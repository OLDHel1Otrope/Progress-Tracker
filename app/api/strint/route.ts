import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// POST /api/stints
// Starts a stint (or sprint) right now and returns the new row, including its id.
// Optional body: { is_sprint?: boolean }  (defaults to a stint)
export async function POST(req: Request) {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const isSprint = body?.is_sprint === true;

    try {
        const { rows } = await db.query(
            `INSERT INTO strints (user_id, is_sprint)
       VALUES ($1, $2)
       RETURNING id, user_id, is_sprint, start_at, end_at`,
            [user.id, isSprint]
        );

        return NextResponse.json(rows[0], { status: 201 });
    } catch (err: any) {
        // unique index: only one running stint and one running sprint per user
        if (err?.code === "23505") {
            return NextResponse.json({ error: "Already running" }, { status: 409 });
        }

        console.error(err);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}