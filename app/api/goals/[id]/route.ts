import { NextResponse } from "next/server";
import { db } from "@/lib/db";


export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const client = await db.connect();

  try {
    const { id: goalId } = await params;

    if (!goalId) {
      return NextResponse.json(
        { error: "Invalid goal id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      id,
      day_goal_id,
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
        UPDATE day_goals
        SET ${fields.join(", ")}
        WHERE id = $${index}
        `,
        [...values, day_goal_id]
      );
    }

    const goalFields: string[] = [];
    const goalValues: any[] = [];

    index = 1;

    if (title !== undefined) {
      goalFields.push(`title = $${index++}`);
      goalValues.push(title);
    }
    if (description !== undefined) {
      goalFields.push(`base_description = $${index++}`);
      goalValues.push(description);
    }


    if (goalFields.length > 0) {
      await client.query(
        `
        UPDATE goals
        SET ${goalFields.join(", ")}
        WHERE id = $${index}
        `,
        [...goalValues, id]
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

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  let client;

  try {
    client = await db.connect();

    const params = await context.params;
    const dayGoalId = params?.id;

    if (!dayGoalId) {
      return NextResponse.json(
        { error: "Missing id" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const result = await client.query(
      `
      UPDATE day_goals
      SET archived = true
      WHERE id = $1
      RETURNING id
      `,
      [dayGoalId]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({ success: true });

  } catch (err) {

    if (client) await client.query("ROLLBACK");

    console.error(err);

    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );

  } finally {
    if (client) client.release();
  }
}
