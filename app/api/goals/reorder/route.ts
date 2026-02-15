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
                FROM day_goals
                WHERE goal_date = $1
                    AND archived_at IS NULL
                FOR UPDATE
  `,
            [goal_date]
        );

        /* Phase 1: move out of range */
        await client.query(
            `
            UPDATE day_goals
            SET position = position + 1000000
            WHERE goal_date = $1
                AND archived_at IS NULL
  `,
            [goal_date]
        );

        /* Phase 2: apply new order */
        //         await client.query(
        //             `
        //             WITH new_order AS (
        //                 SELECT
        //                 unnest($2::uuid[]) AS id,
        //                 generate_series(1, array_length($2, 1)) AS pos
        //             )
        //             UPDATE day_goals dg
        //             SET position = no.pos
        //             FROM new_order no
        //             WHERE dg.id = no.id
        //                 AND dg.goal_date = $1
        //                 AND dg.archived_at IS NULL
        //   `,
        //             [goal_date, ordered_ids]
        //         );

        const updatePromises = ordered_ids.map((id, index) =>
            client.query(
                `
        UPDATE day_goals
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
