export async function reorderDayGoals(day_id: string, newOrder: { day_goal_id: string }[]) {
    const res = await fetch("/api/goals/reorder", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            day_id:day_id,
            ordered_ids: newOrder.map(g => g.day_goal_id),
        }),
    });
    return res.json();
}