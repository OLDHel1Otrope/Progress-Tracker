import { NextResponse } from "next/server";
import { db } from "@/lib/db";


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    let result;

    if (date) {
      result = await db.query(
        `SELECT * FROM goals WHERE goal_date = $1 ORDER BY position ASC`,
        [date]
      );
    } else {
      result = await db.query(
        `SELECT * FROM goals ORDER BY goal_date DESC`
      );
    }

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
  try {
    const body = await req.json();

    const { title, goal_date } = body;

    if (!title || !goal_date) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const result = await db.query(
      `
      INSERT INTO goals (title, goal_date, is_completed)
      VALUES ($1, $2, false)
      RETURNING *
      `,
      [title, goal_date]
    );

    return NextResponse.json(result.rows[0], {
      status: 201,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }
}
