import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        const { rows } = await db.query(
            `
            UPDATE stints
            SET end_at  = NOW(),
            WHERE id = $1
              AND user_id = $2
              AND archived_at IS NULL
            RETURNING id, user_id, goal_id, is_sprint, start_at, end_at
            `,
            [id, user.id,]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(rows[0]);
    } catch (err: any) {
        if (err?.code === "23503") {
            return NextResponse.json({ error: "Goal does not exist" }, { status: 400 });
        }

        console.error(err);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}