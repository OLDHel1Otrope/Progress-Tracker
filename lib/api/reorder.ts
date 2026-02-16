export async function reorderDayGoals(goal_date: string, newOrder: { id: string }[]) {
    const res = await fetch("/api/goals/reorder", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            goal_date:goal_date,
            ordered_ids: newOrder.map(g => g.id),
        }),
    });
    return res.json();
}