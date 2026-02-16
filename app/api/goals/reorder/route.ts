import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    const client = await db.connect();

    try {
        const body = await req.json();
        const { goal_date, ordered_ids } = body;

        if (!goal_date || !Array.isArray(ordered_ids)) {
            return NextResponse.json({ error: "Invalid params" }, { status: 400 });
        }

        await client.query("BEGIN");

        /* Lock rows */
        await client.query(
            `
                SELECT id
                FROM goals
                WHERE goal_date = $1
                    AND archived_at IS NULL
                FOR UPDATE
  `,
            [goal_date]
        );

        /* Phase 1: move out of range */
        await client.query(
            `
            UPDATE goals
            SET position = position + 1000000
            WHERE goal_date = $1
                AND archived_at IS NULL
  `,
            [goal_date]
        );

        const updatePromises = ordered_ids.map((id, index) =>
            client.query(
                `
        UPDATE goals
        SET position = $1
        WHERE id = $2
        `,
                [index + 1, id]
            )
        );
        
        await Promise.all(updatePromises);

        await client.query("COMMIT");


        return NextResponse.json({ success: true });

    } catch (err) {

        await client.query("ROLLBACK");

        console.error("Reorder error:", err);

        return NextResponse.json(
            { error: "Failed to reorder" },
            { status: 500 }
        );

    } finally {
        client.release();
    }
}
