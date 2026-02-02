import { Goal } from "@/components/internalComponents/GoalItem";

export async function fetchTodayGoals(): Promise<Goal[]> {
  const today = new Date().toISOString().split("T")[0];

  const res = await fetch(`/api/goals?date=${today}`);

  if (!res.ok) {
    throw new Error("Failed to fetch goals");
  }

  return res.json();
}

export async function addGoalApi(title: string, goal_date: string) {
  const res = await fetch("/api/goals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, goal_date }),
  });

  if (!res.ok) {
    throw new Error("Failed to add goal");
  }

  return res.json();
}

export async function updateGoalApi(goal: Goal) {
  const res = await fetch(`/api/goals/${goal.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(goal),
  });

  if (!res.ok) {
    throw new Error("Failed to update goal");
  }

  return res.json();
}
