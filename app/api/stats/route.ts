import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const user = await getSessionUser();
    const userId = user.id;
    const client = await db.connect();
    
    try {
        const { searchParams } = new URL(req.url);
        const year = searchParams.get('year');
        const month = searchParams.get('month'); // month starts at 1
        
        if (!year || !month) {
            return NextResponse.json(
                { error: "Year and month are required" },
                { status: 400 }
            );
        }
        
        // Calculate start and end dates properly
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);
        const startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
        
        // Get last day of month (next month's day 0)
        const lastDay = new Date(yearNum, monthNum, 0).getDate();
        const endDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        
        const result = await client.query(
            `SELECT 
                goal_date::text as date,
                COUNT(*) as total_goals,
                SUM(CASE WHEN is_completed = true THEN 1 ELSE 0 END) as completed
             FROM goals
             WHERE user_id = $1
                AND goal_date >= $2::date
                AND goal_date <= $3::date
                AND archived_at IS NULL
             GROUP BY goal_date
             ORDER BY goal_date`,
            [userId, startDate, endDate]
        );
        
        // Create a map for quick lookup
        const statsMap = new Map(
            result.rows.map(row => [
                row.date,
                {
                    total_goals: parseInt(row.total_goals),
                    completed: parseInt(row.completed)
                }
            ])
        );
        
        // Generate all days of the month
        const monthly_stats = [];
        for (let day = 1; day <= lastDay; day++) {
            const dateStr = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            monthly_stats.push({
                date: dateStr,
                stats: statsMap.get(dateStr) || {
                    total_goals: 0,
                    completed: 0
                }
            });
        }
        
        return NextResponse.json(monthly_stats);
        
    } catch (err) {
        console.error("Get monthly stats error:", err);
        return NextResponse.json(
            { error: "Database error" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}