import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = new URL(req.url).searchParams.get("date"); // optional
  if (date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
  }

  try {
    const { rows } = await db.query(
      `
      WITH b AS (
        SELECT
          u.timezone AS tz,
          d.local_date,
          d.local_date::timestamp       AT TIME ZONE u.timezone AS day_start,
          (d.local_date + 1)::timestamp AT TIME ZONE u.timezone AS day_end
        FROM users u
        CROSS JOIN LATERAL (
          SELECT COALESCE($2::date, (now() AT TIME ZONE u.timezone)::date) AS local_date
        ) d
        WHERE u.id = $1
      ),
      x AS (
        SELECT
          s.id, s.goal_id, s.is_sprint, s.description,
          GREATEST(s.start_at, b.day_start) AS c_start,
          s.end_at                          AS raw_end,
          b.tz, b.local_date, b.day_start, b.day_end
        FROM strints s
        CROSS JOIN b
        WHERE s.user_id = $1
          AND s.archived_at IS NULL
          AND s.end_at IS NOT NULL
          AND s.start_at < b.day_end
          AND s.end_at > b.day_start
      )
      SELECT
        id, goal_id, is_sprint, description,
        to_char(local_date, 'YYYY-MM-DD')                       AS date,
        tz                                                       AS timezone,
        to_char(c_start AT TIME ZONE tz, 'HH24:MI')              AS start,
        CASE WHEN raw_end >= day_end
             THEN '23:59'
             ELSE to_char(raw_end AT TIME ZONE tz, 'HH24:MI')
        END                                                      AS "end",
        ROUND(EXTRACT(EPOCH FROM (LEAST(raw_end, day_end) - c_start)) / 60)::int AS minutes
      FROM x
      ORDER BY c_start
      `,
      [user.id, date]
    );

    const stints = rows.map((r) => {
      const [startH, startM] = r.start.split(":").map(Number);
      const [endH, endM] = r.end.split(":").map(Number);
      return {
        id: r.id,
        goal_id: r.goal_id,
        is_sprint: r.is_sprint,
        description: r.description,
        // assessment: r.assessment,
        start_at: r.start, // "00:00" if it began on a previous day
        end_at: r.end,     // "23:59" if it ends after this day
        startH, startM, endH, endM,
        minutes: r.minutes,
      };
    });

    return NextResponse.json({
      date: rows[0]?.date ?? date,
      timezone: rows[0]?.timezone ?? null,
      stints,
    });
  } catch (err: any) {
    // e.g. 2026-02-31 or an invalid stored timezone
    if (err?.code === "22008" || err?.code === "22007" || err?.code === "22023") {
      return NextResponse.json({ error: "Invalid date or timezone" }, { status: 400 });
    }

    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}