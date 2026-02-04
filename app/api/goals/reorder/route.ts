import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    const client = await db.connect();

    try {
        const body = await req.json();
        const { day_id, ordered_ids } = body;

        if (!day_id || !Array.isArray(ordered_ids)) {
            return NextResponse.json({ error: "Invalid params" }, { status: 400 });
        }

        await client.query("BEGIN");

        /* Lock rows */
        await client.query(
            `
  SELECT id
  FROM day_goals
  WHERE day_id = $1
    AND archived = false
  FOR UPDATE
  `,
            [day_id]
        );

        /* Phase 1: move out of range */
        await client.query(
            `
  UPDATE day_goals
  SET position = position + 1000000
  WHERE day_id = $1
    AND archived = false
  `,
            [day_id]
        );

        /* Phase 2: apply new order */
        await client.query(
            `
  WITH new_order AS (
    SELECT
      unnest($2::uuid[]) AS id,
      generate_series(1, array_length($2, 1)) AS pos
  )
  UPDATE day_goals dg
  SET position = no.pos
  FROM new_order no
  WHERE dg.id = no.id
    AND dg.day_id = $1
    AND dg.archived = false
  `,
            [day_id, ordered_ids]
        );

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
