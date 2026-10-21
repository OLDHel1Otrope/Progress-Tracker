import { StintEntry } from "@/components/internalComponents/widgets/StintList";

export async function startStrint(): Promise<StintEntry> {
    //start a strint
    const res = await fetch(`/api/strint`, { method: 'POST' });
    if (!res.ok) {
        throw new Error("Failed to get the strint id");
    }

    return res.json(); //this
}

export async function updateStrint(s: StintEntry) {
    //update goal associated or a description of strint
    const res = await fetch(`/api/strint/${s.id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ goal_id: s.goal_id, description: s.description }),
    });

    if (!res.ok) {
        throw new Error("Failed to update strint");
    }

    return res.json();
}

export async function traceAwake(sid: string) {
    //keep strint alive
    const res = await fetch(`/api/strint/${sid}/traceAwake`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        }
    });

    if (!res.ok) {
        throw new Error("Failed to keep strint alive. try again.");
    }

    return res.json();
}

export async function deleteStrint(sid: string) {
    //delete strint
    const res = await fetch(`/api/strint/${sid}`, {
        method: "DELETE"
    });

    if (!res.ok) {
        throw new Error("Failed to delete strint.");
    }

    return res.json();
}

export async function getTodayStrints() {
    //delete strint
    const res = await fetch(`/api/strint/today`);

    if (!res.ok) {
        throw new Error("Failed to get strints.");
    }

    return res.json();
}