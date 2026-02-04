import { NextResponse } from "next/server";
import { db } from "@/lib/db";


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    const result = await db.query(
      `
      SELECT
        g.id as id,
        g.title,
        g.base_description as description,
        dg.id as day_goal_id,
        dg.position,
        dg.is_completed,
        dg.created_at AS added_on,
        d.id as day_id
      FROM days d
      JOIN day_goals dg ON dg.day_id = d.id
      JOIN goals g ON g.id = dg.goal_id
      WHERE d.date = $1
      AND dg.archived = false
      ORDER BY dg.position ASC
      `,
      [date]
    );

    return NextResponse.json(result.rows);

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }
}

/**
 * CREATE goal
 */
export async function POST(req: Request) {
  const client = await db.connect(); // get transaction client

  try {
    const body = await req.json();
    const { title, goal_date } = body;

    if (!title || !goal_date) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    /* 1️⃣ Insert goal */
    const goalRes = await client.query(
      `
      INSERT INTO goals (title, created_at)
      VALUES ($1, NOW())
      RETURNING id
      `,
      [title]
    );

    const goalId = goalRes.rows[0].id;

    /* 2️⃣ Insert date if not exists */
    const dateRes = await client.query(
      `
      INSERT INTO days (date)
      VALUES ($1)
      ON CONFLICT (date)
      DO UPDATE SET date = EXCLUDED.date
      RETURNING id; 
      `,
      [goal_date]
    );

    const dayId = dateRes.rows[0].id;

    const dayGoalRes = await client.query(
      `
      INSERT INTO day_goals
      (day_id, goal_id, is_completed, created_at, position)
      VALUES ($1, $2, false, NOW(), COALESCE(
    (SELECT MAX(position) + 1 FROM day_goals WHERE day_id = $1 AND archived = false),1))
      RETURNING *
      `,
      [dayId, goalId]
    );

    await client.query("COMMIT");

    return NextResponse.json(dayGoalRes.rows[0], {
      status: 201,
    });

  } catch (err) {
    await client.query("ROLLBACK");

    console.error(err);

    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
