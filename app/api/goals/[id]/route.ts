import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";


export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const client = await db.connect();

  try {
    const { id: goalId } = await context.params;

    if (!goalId) {
      return NextResponse.json(
        { error: "Invalid goal id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      id,
      title,
      description,
      is_completed,
      goal_date, // YYYY-MM-DD
      recurrence_group_id,
      position,
      equadrant,
      eposition
    } = body;

    if (goalId !== id) {
      return NextResponse.json(
        { error: "Invalid attempt." },
        { status: 401 }
      );
    }
    await client.query("BEGIN");
    //here get the existing details about the 
    const goalData = await client.query(`select * from goals where id=$1`, [goalId])

    const oldGoalDate = goalData.rows[0].goal_date

    const dateToStore = goal_date != oldGoalDate
      ? new Date(goal_date).toISOString().split('T')[0]
      : goal_date;


    let newPosition = position;
    let newEPosition = eposition;

    if (goal_date !== oldGoalDate) {
      const newp = await client.query(
        `SELECT COUNT(*) FROM goals WHERE goal_date = $1`,
        [dateToStore]
      );
      //NEWP IS THE NEW POSITION OF THE NOTE, IF IT IS MOVED TO A DIFFERENT DATE, HENCE EQUATE IT TO newPosition
      newPosition = newp.rows[0].count

    }

    if (goal_date != oldGoalDate) {
      const newP = await client.query(
        `SELECT COUNT(*) FROM goals WHERE goal_date = $1 AND equadrant= $2`,
        [dateToStore, equadrant]
      );
      newEPosition = newP.rows[0].count
    }


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

    if (dateToStore !== undefined) {
      fields.push(`goal_date = $${index++}`);
      values.push(dateToStore);
    }

    if (title !== undefined) {
      fields.push(`title = $${index++}`);
      values.push(title);
    }
    if (description !== undefined) {
      fields.push(`base_description = $${index++}`);
      values.push(description);
    }

    if (position !== undefined) {
      fields.push(`position = $${index++}`);
      values.push(newPosition || null);
    }

    if (equadrant !== undefined) {
      fields.push(`eposition = $${index++}`);
      values.push(newEPosition || null);
    }

    if (fields.length > 0) {
      await client.query(
        `
        UPDATE goals
        SET ${fields.join(", ")}
        WHERE id = $${index}
        `,
        [...values, id]
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
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  let client;
  try {
    client = await db.connect();
    const { id: dayGoalId } = await context.params;

    if (!dayGoalId) {
      return NextResponse.json(
        { error: "Missing id" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const result = await client.query(
      `UPDATE goals
       SET archived_at = NOW()
       WHERE id = $1
       RETURNING position, goal_date, user_id`,
      [dayGoalId]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      );
    }

    const { position, goal_date, user_id } = result.rows[0];

    // await client.query(
    //   `UPDATE goals
    //    SET position = position - 1
    //    WHERE user_id = $1
    //      AND goal_date = $2
    //      AND position > $3
    //      AND archived_at IS NULL`,
    //   [user_id, goal_date, position]
    // );
    // this dosent conform that it will run in an order, hence we cant use it

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