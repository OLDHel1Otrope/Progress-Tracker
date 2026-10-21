import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// PATCH /api/stints/[id]
// "Ping": pushes end_at to now, and optionally attaches a goal.
// Optional body: { goal_id?: string }
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const goalId: string | null =
        typeof body?.goal_id === "string" ? body.goal_id : null;
    const description: string | null =
        typeof body?.description === "string" ? body.description : null;

    try {
        const { rows } = await db.query(
            `
                UPDATE stints
                SET goal_id     = COALESCE($3::uuid, goal_id),
                    description = COALESCE($4::text, description)
                WHERE id = $1
                AND user_id = $2
                AND archived_at IS NULL
                RETURNING id, user_id, goal_id, is_sprint, description, start_at, end_at
            `,
            [id, user.id, goalId, description ?? null]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(rows[0]);
    } catch (err: any) {
        if (err?.code === "22P02") {
            return NextResponse.json({ error: "Invalid id or goal_id" }, { status: 400 });
        }
        if (err?.code === "23503") {
            return NextResponse.json({ error: "Goal does not exist" }, { status: 400 });
        }

        console.error(err);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}

// DELETE /api/stints/[id]  (soft delete)
export async function DELETE(
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
            SET archived_at = NOW()
            WHERE id = $1
              AND user_id = $2
              AND archived_at IS NULL
            RETURNING id, user_id, is_sprint, start_at, end_at, archived_at
            `,
            [id, user.id]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(rows[0]);
    } catch (err: any) {
        if (err?.code === "22P02") {
            return NextResponse.json({ error: "Invalid id" }, { status: 400 });
        }

        console.error(err);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}