import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
    const client = await db.connect();

    try {
        const body = await req.json();

        const { day_id, ordered_ids } = body;

        if (
            !day_id ||
            !Array.isArray(ordered_ids) ||
            ordered_ids.length === 0
        ) {
            return NextResponse.json(
                { error: "Invalid parameters" },
                { status: 400 }
            );
        }

        await client.query("BEGIN");

        await client.query(
            `
  UPDATE day_goals
  SET position = -position
  WHERE day_id = $1
  `,
            [day_id]
        );

        /* 2. Set new positions */
        for (let i = 0; i < ordered_ids.length; i++) {
            await client.query(
                `
    UPDATE day_goals
    SET position = $1
    WHERE id = $2
      AND day_id = $3
    `,
                [i + 1, ordered_ids[i], day_id]
            );
        }


        await client.query("COMMIT");

        return NextResponse.json({ success: true });

    } catch (err) {
        await client.query("ROLLBACK");

        console.error("Reorder error:", err);

        return NextResponse.json(
            { error: "Failed to reorder goals" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
