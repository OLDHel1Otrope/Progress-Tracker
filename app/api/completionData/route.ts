import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const user = await getSessionUser();
    const userId = user.id;
    const client = await db.connect();

    try {

        const result = await client.query(
            `SELECT 
                date::text as date,
                completion_percentage
             FROM day_stats
             WHERE user_id = $1`,
            [userId]
        );

        return NextResponse.json(result.rows);

    } catch (err) {
        console.error("Get stats error:", err);
        return NextResponse.json(
            { error: "Database error" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}