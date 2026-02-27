import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    const client = await db.connect();

    await client.query("BEGIN");
    //need to add some sort of validation here from envs to check for valid origin

    try {
        await client.query(`
            INSERT INTO day_stats (
            id,
            date,
            user_id,
            completion_percentage
            )
                SELECT
                gen_random_uuid(),
                    CURRENT_DATE - INTERVAL '1 day',
                        u.id,
                        COALESCE(
                            ROUND(
                                (COUNT(*) FILTER(WHERE g.is_completed):: numeric
                            / NULLIF(COUNT(*), 0)) * 100,
                            2
                        ),
                        0
                ) AS completion_percentage
                FROM users u
                LEFT JOIN goals g
                ON g.user_id = u.id
                AND g.goal_date = CURRENT_DATE - INTERVAL '1 day'
                WHERE u.carry_over = true
                GROUP BY u.id;`
        );

        await db.query(`
        UPDATE goals g
            SET goal_date = CURRENT_DATE
            FROM users u
            WHERE g.user_id = u.id
            AND u.carry_over = true
            AND g.goal_date = CURRENT_DATE - INTERVAL '1 day'
            AND g.is_completed = false;
        `)

        await client.query("COMMIT");
    }
    catch (err) {
        await client.query("ROLLBACK");

        console.error(err);
        return NextResponse.json(
            { error: "Failed to update goal" },
            { status: 500 }
        );
    }
    finally {
        client.release();
    }
}