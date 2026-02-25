import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

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
          g.id AS id,
          g.title,
          g.base_description AS description,
          g.position,
          g.is_completed,
          g.created_at AS added_on,
          g.equadrant,
          g.eposition,
          g.goal_date,
          rg.id AS recurr_id,
          rg.group_name AS group_name
        FROM goals g LEFT JOIN recurrence_groups rg
        ON
          g.recurr_id = rg.id
        WHERE
          g.goal_date = $1
          AND g.archived_at IS NULL
        ORDER BY g.position ASC
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


export async function POST(req: Request) {
  const user = await getSessionUser();
  const userId = user.id;
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


    const dayGoalRes = await client.query(
      `
      INSERT INTO goals
      (goal_date, title, is_completed, created_at, position, user_id)
      VALUES ($1, $2, false, NOW(), COALESCE(
      (SELECT MAX(position) + 1 FROM goals WHERE goal_date = $1 AND archived_at IS null),1),$3)
      RETURNING *
      `,
      [goal_date, title, userId]
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
//find yesterdays incompleted goals, make its position next days highest position, keep equadrant same, make eposition the next days highest position
const cron = "update goals "