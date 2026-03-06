//api example
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";


export async function GET(req: Request) {
    try {



        const url = new URL(req.url);

        const type = url.searchParams.get("type");
        const from = url.searchParams.get("from");
        const until = url.searchParams.get("until");
        const on = url.searchParams.get("on");
        const search = url.searchParams.get("search");
        const page = url.searchParams.get("page");
        const recurrence = url.searchParams.get("recurrence");

        const user = await getSessionUser();

        if (!user.id) {
            return NextResponse.json(
                { error: "login is required" },
                { status: 400 }
            );
        }

        const { query, values } = buildGoalsQuery({
            type,
            from,
            until,
            on,
            search,
            recurrence,
        })

        const additionalConditions: string[] = []
        const additionalValues: any[] = []

        additionalConditions.push(`AND g.user_id = $${values.length + 1} `)
        values.push(user.id)

        console.log(query + additionalConditions[0] + " ORDER BY goal_date ASC")
        console.log(values)

        const result = await db.query(query + additionalConditions[0] + " ORDER BY goal_date ASC", [...values])


        return NextResponse.json(result.rows);

    } catch (err) {
        console.error(err);

        return NextResponse.json(
            { error: "Database error" },
            { status: 500 }
        );
    }
}

function getDateWindow({
    from,
    until,
    on,
    page
}: {
    from?: string | null
    until?: string | null
    on?: string | null
    page?: number
}) {

    if (on) {
        const d = new Date(on)
        return { start: d, end: d }
    }

    if (from || until) {
        return {
            start: from ? new Date(from) : new Date("1970-01-01"),
            end: until ? new Date(until) : new Date("2100-01-01")
        }
    }

    const today = new Date()
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const p = page ?? 0

    let start: Date
    let end: Date

    if (p === 0) {

        start = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0)

    } else if (p > 0) {

        start = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + p + 1, 1)
        end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + p + 2, 0)

    } else {

        start = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + p - 1, 1)
        end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + p, 0)

    }

    return { start, end }
}

export function buildGoalsQuery(params: {
    type?: string | null
    from?: string | null
    until?: string | null
    on?: string | null
    search?: string | null
    recurrence?: string | null
    page?: number
}) {


    const { start, end } = getDateWindow(params)

    const conditions: string[] = []
    const values: any[] = []
    let i = 1

    conditions.push(`goal_date BETWEEN $${i++} AND $${i++}`)
    values.push(start, end)

    const filters: Record<string, () => void> = {

        priority: () => {
            conditions.push(`equadrant = 0`)
        },

        completed: () => {
            conditions.push(`is_completed = true`)
        },

        incomplete: () => {
            conditions.push(`is_completed = false`)
        },

        recurrence: () => {
            conditions.push(`recurr_id IS NOT NULL`)
        }

    }

    if (params.type && filters[params.type]) {
        filters[params.type]()
    }

    if (params.search) {
        conditions.push(`(
      g.title ILIKE $${i}
      OR g.base_description ILIKE $${i}
    )`)
        values.push(`%${params.search}%`)
        i++
    }

    if (params.recurrence) {
        conditions.push(`recurr_id = $${i}`)
        values.push(`${params.recurrence}`)
        i++
    }

    const query = `
    SELECT 
        g.id AS id,
        g.title,
        g.base_description AS description,
        g.position,
        g.is_completed,
        g.created_at AS added_on,
        g.equadrant,
        g.eposition,
        g.goal_date,
        g.recurr_id
    FROM goals g
    WHERE ${conditions.join(" AND ")}
  `

    return { query, values }
}