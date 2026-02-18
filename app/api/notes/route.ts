import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const client = await db.connect();
    try {
        const user = await getSessionUser();
        const userId = user.id;

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        let result = await client.query(
            `SELECT id, note_description, created_at, updated_at
             FROM notes
             WHERE user_id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            const defaultBlocks = [
                {
                    id: Math.random().toString(36).slice(2, 9),
                    type: "paragraph",
                    data: "",
                }
            ];

            result = await client.query(
                `INSERT INTO notes (user_id, note_title, note_description, created_at, updated_at)
                 VALUES ($1, $2, $3, NOW(), NOW())
                 RETURNING id, note_description, created_at, updated_at`,
                [userId, "My Notes", JSON.stringify(defaultBlocks)]
            );
        }

        const note = result.rows[0];

        return NextResponse.json({
            id: note.id,
            blocks: note.note_description,
            created_at: note.created_at,
            updated_at: note.updated_at,
        });
    } catch (err) {
        console.error("Get note error:", err);
        return NextResponse.json(
            { error: "Failed to fetch note" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}


export async function PUT(req: Request) {
    const client = await db.connect();
    try {
        const user = await getSessionUser();
        const userId = user.id;

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { blocks } = body;

        if (!blocks || !Array.isArray(blocks)) {
            return NextResponse.json(
                { error: "Invalid blocks data" },
                { status: 400 }
            );
        }

        // Checking if note exists
        const existing = await client.query(
            `SELECT id FROM notes WHERE user_id = $1`,
            [userId]
        );

        let note;
        if (existing.rows.length > 0) {
            const updateResult = await client.query(
                `UPDATE notes
                 SET note_description = $1, updated_at = NOW()
                 WHERE user_id = $2
                 RETURNING id, note_description, updated_at`,
                [JSON.stringify(blocks), userId]
            );
            note = updateResult.rows[0];
        } else {
            const insertResult = await client.query(
                `INSERT INTO notes (user_id, note_title, note_description, created_at, updated_at)
                 VALUES ($1, $2, $3, NOW(), NOW())
                 RETURNING id, note_description, updated_at`,
                [userId, "My Notes", JSON.stringify(blocks)]
            );
            note = insertResult.rows[0];
        }

        return NextResponse.json({
            id: note.id,
            blocks: note.note_description,
            updated_at: note.updated_at,
        });
    } catch (err) {
        console.error("Update note error:", err);
        return NextResponse.json(
            { error: "Failed to update note" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}