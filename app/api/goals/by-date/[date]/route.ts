import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { date: string } }
) {
  try {
    const { date } = params;

    const result = await db.query(
      `
      SELECT g.*
      FROM days d
      JOIN day_goals dg ON d.id = dg.day_id
      JOIN goals g ON dg.goal_id = g.id
      WHERE d.date = $1
      `,
      [date]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { date: string } }
) {
  const client = await db.connect();

  try {
    const { date } = params;
    const body = await req.json();

    const { title } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    /* 1️⃣ Ensure day exists */
    const dayResult = await client.query(
      `
      INSERT INTO days (date)
      VALUES ($1)
      ON CONFLICT (date) DO UPDATE SET date = EXCLUDED.date
      RETURNING id
      `,
      [date]
    );

    const dayId = dayResult.rows[0].id;

    /* 2️⃣ Create goal */
    const goalResult = await client.query(
      `
      INSERT INTO goals (title)
      VALUES ($1)
      RETURNING id, title, is_completed
      `,
      [title]
    );

    const goal = goalResult.rows[0];

    /* 3️⃣ Link day + goal */
    await client.query(
      `
      INSERT INTO day_goals (day_id, goal_id)
      VALUES ($1, $2)
      `,
      [dayId, goal.id]
    );

    await client.query("COMMIT");

    return NextResponse.json(goal, { status: 201 });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);

    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );

  } finally {
    client.release();
  }
}