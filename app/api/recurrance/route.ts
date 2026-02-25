import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const client = await db.connect();

    try {
        const user = await getSessionUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const result = await client.query(
            `SELECT id, group_name FROM recurrence_groups WHERE user_id = $1`,
            [user.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "Groups not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(result.rows);

    } catch (err) {
        console.error("GET /recurrence_groups error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

export async function PATCH(req: Request) {
    const client = await db.connect();

    try {
        const user = await getSessionUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { goalId, recurrName } = body;

        if (!goalId || !recurrName) {
            return NextResponse.json(
                { error: "goalId and recurrName are required" },
                { status: 400 }
            );
        }

        await client.query("BEGIN");

        // Insert or get existing recurrence group
        const recurrResult = await client.query(
            `
      INSERT INTO recurrence_groups (group_name, user_id)
      VALUES ($1, $2)
      ON CONFLICT (group_name, user_id)
      DO UPDATE SET group_name = EXCLUDED.group_name
      RETURNING id
      `,
            [recurrName, user.id]
        );

        const recurrId = recurrResult.rows[0].id;

        // Update goal with recurrence group id
        const goalUpdateResult = await client.query(
            `
      UPDATE goals
      SET recurr_id = $1
      WHERE id = $2
        AND user_id = $3
      RETURNING *
      `,
            [recurrId, goalId, user.id]
        );

        if (goalUpdateResult.rowCount === 0) {
            throw new Error("Goal not found or not owned by user");
        }

        await client.query("COMMIT");

        return NextResponse.json(
            {
                success: true,
                recurrenceGroupId: recurrId,
                goal: goalUpdateResult.rows[0],
            },
            { status: 200 }
        );
    } catch (error: any) {
        await client.query("ROLLBACK");

        console.error("PATCH /goals recurrence error:", error);

        return NextResponse.json(
            {
                error: "Failed to update recurrence",
                message: error.message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

//this was created to create multiple goals along with groupname
export async function POST(req: Request) {
    const client = await db.connect();
    const user = await getSessionUser();
    const userId = user.id;

    try {
        const body = await req.json();
        const { recurr_name, goalsData } = body;

        if (!recurr_name || !goalsData || !Array.isArray(goalsData)) {
            return NextResponse.json({ error: "missing fields" }, { status: 400 });
        }

        await client.query("BEGIN");

        const recurrResult = await client.query(
            `INSERT INTO recurrence_groups (group_name, user_id)
                VALUES ($1, $2)
                ON CONFLICT (group_name, user_id) 
                DO UPDATE SET group_name = EXCLUDED.group_name
                RETURNING id`,
            [recurr_name, userId]
        );

        const recurr_id = recurrResult.rows[0].id;

        for (const dateGoal of goalsData) {
            await client.query(
                `INSERT INTO goals (user_id, goal_date, title, base_description, is_completed, created_at, position, archived_at, recurr_id) 
                 VALUES ($1, $2, $3, $4, false, NOW(), 
                         COALESCE((SELECT MAX(position) + 1 FROM goals WHERE goal_date = $2 AND archived_at IS NULL), 1),
                         NULL, $5)`,
                [
                    userId,
                    dateGoal.date,
                    dateGoal.goal.title,
                    dateGoal.goal.description || null,
                    recurr_id
                ]
            );
        }

        await client.query("COMMIT");
        return NextResponse.json({ success: true });
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