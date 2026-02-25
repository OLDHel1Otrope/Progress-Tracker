import { Goal } from "@/components/internalComponents/GoalItem";
import { DateGoal } from "@/components/internalComponents/RecurrenceModal";

interface saveRecurranceProps {
    recurr_name: string;
    goalsData: { date: string; goal: { title: string; description: string; }; }[];
}

export async function getRecurrance() {
    const res = await fetch(`/api/recurrance`);
    if (!res.ok) {
        throw new Error("Failed to fetch goals");
    }
    return res.json();
}

export async function saveRecurranceGoals({ recurr_name, goalsData }: saveRecurranceProps) {
    const payload = {
        recurr_name,
        goalsData: goalsData.map(dg => ({
            date: typeof dg.date === 'string' ? dg.date : dg.date.toISOString().split('T')[0],
            goal: dg.goal
        }))
    };

    const res = await fetch("/api/recurrance", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to save recurrence goals");
    }
    return res.json();
}