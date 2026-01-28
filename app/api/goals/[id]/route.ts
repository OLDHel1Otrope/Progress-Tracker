import { NextResponse } from "next/server";
import { db } from "@/lib/db";


export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const client = await db.connect();

  try {
    const goalId = Number(params.id);

    if (isNaN(goalId)) {
      return NextResponse.json(
        { error: "Invalid goal id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      title,
      description,
      is_completed,
      date, // YYYY-MM-DD
      recurrence_group_id,
    } = body;

    await client.query("BEGIN");


    const fields: string[] = [];
    const values: any[] = [];

    let index = 1;

    if (title !== undefined) {
      fields.push(`title = $${index++}`);
      values.push(title);
    }

    if (description !== undefined) {
      fields.push(`description = $${index++}`);
      values.push(description);
    }

    if (is_completed !== undefined) {
      fields.push(`is_completed = $${index++}`);
      values.push(is_completed);
    }

    if (recurrence_group_id !== undefined) {
      fields.push(`recurrence_group_id = $${index++}`);
      values.push(recurrence_group_id);
    }

    if (fields.length > 0) {
      await client.query(
        `
        UPDATE goals
        SET ${fields.join(", ")}
        WHERE id = $${index}
        `,
        [...values, goalId]
      );
    }


    if (date !== undefined) {

      const dayResult = await client.query(
        `
        INSERT INTO days (day)
        VALUES ($1)
        ON CONFLICT (day) DO UPDATE SET day = EXCLUDED.day
        RETURNING id
        `,
        [date]
      );

      const newDayId = dayResult.rows[0].id;

      await client.query(
        `
        UPDATE day_goals
        SET day_id = $1
        WHERE goal_id = $2
        `,
        [newDayId, goalId]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({ success: true });

  } catch (err) {
    await client.query("ROLLBACK");

    console.error(err);

    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );

  } finally {
    client.release();
  }
}
