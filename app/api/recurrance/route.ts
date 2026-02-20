import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const user = await getSessionUser();
    const userId = user.id;
    const client = await db.connect();
    let result = await client.query(`select id, group_name from recurrence_groups where user_id = $1`, [userId])
    if (!result) {
        return NextResponse.json(
            { error: "Groups not found" },
            { status: 404 }
        );
    }
    return NextResponse.json(
        result.rows
    )
}

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