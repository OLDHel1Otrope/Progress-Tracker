import { Goal } from "@/components/internalComponents/GoalItem";
import { goalsFilterApi } from "@/lib/api/goalsFilter";
import { getRecurrance } from "@/lib/api/recurrance";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useGoals() {

    const params = useSearchParams();
    const type = params.get("type") || "all";
    const from = params.get("from") || undefined;
    const until = params.get("until") || undefined;
    const on = params.get("on") || undefined;
    const search = params.get("search") || undefined;
    const page = 0; // for now it is zero
    const recurrence = params.get("recurrence") || "";
    const group = params.get("group") || "monthly";

    const { data: recurranceTags } = useQuery({
        queryKey: ["recurranceTypes"],
        queryFn: getRecurrance,
    });

    console.log(recurranceTags)

    const query = useQuery({
        queryKey: ["goals", type, from, until, on, search, recurrence],
        staleTime: Infinity,
        queryFn: () =>
            goalsFilterApi({
                type,
                from,
                until,
                on,
                search,
                page,
                recurrence: recurranceTags?.find(a => a.group_name === recurrence)?.id,
            }),
    });

    const groupedGoals = useMemo(() => {
        if (!query.data) return [];
        const goals = query.data;

        if (group === "monthly") {
            const map = new Map<string, { month: string; year: string; goals: Goal[] }>();

            for (const goal of goals) {
                const date = new Date(goal.goal_date);
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = String(date.getFullYear());

                const key = `${year}-${month}`;

                if (!map.has(key)) {
                    map.set(key, { month, year, goals: [] });
                }

                map.get(key)!.goals.push(goal);
            }
            // console.log("grouped data",Array.from(map.values()))
            return Array.from(map.values());
        }

        if (group === "weekly") {
            const weeks: Record<string, any> = {};

            for (const goal of goals) {
                if (!goal.goal_date) continue;

                const d = new Date(goal.goal_date);

                if (isNaN(d.getTime())) continue; // invalid date protection

                const dayIndex = (d.getDay() + 6) % 7;

                const monday = new Date(d);
                monday.setDate(d.getDate() - dayIndex);

                const weekKey = monday.toISOString().slice(0, 10);

                if (!weeks[weekKey]) {
                    weeks[weekKey] = Array.from({ length: 7 }, (_, i) => {
                        const date = new Date(monday);
                        date.setDate(monday.getDate() + i);

                        return {
                            date: date.toISOString().slice(0, 10),
                            goals: []
                        };
                    });
                }

                weeks[weekKey][dayIndex].goals.push(goal);
            }

            return Object.values(weeks);
        }

        return goals;

    }, [query.data, group]);

    return {
        ...query,
        groupedGoals,
    };
}