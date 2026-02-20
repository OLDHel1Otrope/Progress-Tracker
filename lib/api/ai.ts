type GenerateGoalsInput = {
    userPrompt: string;
    goals: {
        goalDate: string;
        title: string;
        description: string;
    }[];
};

export type AIGoal = {
    goalDate: string;
    title: string;
    description: string;
};


export async function generateGoals(
    payload: GenerateGoalsInput
): Promise<AIGoal[]> {
    const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "AI generation failed");
    }

    return res.json();
}
