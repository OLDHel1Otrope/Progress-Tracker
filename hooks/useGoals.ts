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

        const formatDate = (d: Date) => {
            const dd = String(d.getDate()).padStart(2, "0");
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const yyyy = d.getFullYear();
            return `${dd}-${mm}-${yyyy}`;
        };

        const getDay = (d: Date) =>
            d.toLocaleString("en-US", { weekday: "long" });

        if (group === "monthly") {
            const map = new Map<
                string,
                { title: string; days: { date: string; day: string; goals: Goal[] }[] }
            >();

            for (const goal of goals) {
                if (!goal.goal_date) continue;

                const d = new Date(goal.goal_date);
                const year = d.getFullYear();
                const month = d.getMonth();

                const key = `${year}-${month}`;

                const title = d.toLocaleString("en-US", {
                    month: "long",
                    year: "numeric"
                });

                const date = formatDate(d);
                const day = getDay(d);

                if (!map.has(key)) {
                    map.set(key, { title, days: [] });
                }

                const group = map.get(key)!;

                let dayObj = group.days.find((x) => x.date === date);

                if (!dayObj) {
                    dayObj = { date, day, goals: [] };
                    group.days.push(dayObj);
                }

                dayObj.goals.push(goal);
            }

            return Array.from(map.values());
        }

        if (group === "weekly") {
            const weeks = new Map<
                string,
                { title: string; days: { date: string; day: string; goals: Goal[] }[] }
            >();

            for (const goal of goals) {
                if (!goal.goal_date) continue;

                const d = new Date(goal.goal_date);
                if (isNaN(d.getTime())) continue;

                const dayIndex = (d.getDay() + 6) % 7;

                const monday = new Date(d);
                monday.setDate(d.getDate() - dayIndex);

                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);

                const weekKey = monday.toISOString().slice(0, 10);

                if (!weeks.has(weekKey)) {
                    const title = `${formatDate(monday)} - ${formatDate(sunday)}`;

                    const days = Array.from({ length: 7 }, (_, i) => {
                        const dateObj = new Date(monday);
                        dateObj.setDate(monday.getDate() + i);

                        return {
                            date: formatDate(dateObj),
                            day: getDay(dateObj),
                            goals: []
                        };
                    });

                    weeks.set(weekKey, { title, days });
                }

                const week = weeks.get(weekKey)!;

                week.days[dayIndex].goals.push(goal);
            }

            return Array.from(weeks.values());
        }

        return [];
    }, [query.data, group]);

    return {
        ...query,
        groupedGoals,
    };
}