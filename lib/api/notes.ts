import { Block } from "@/components/internalComponents/noteComponents/types/types";

export async function fetchNotes(): Promise<Block[]> {
    const res = await fetch("/api/notes");
    if (!res.ok) throw new Error("Failed to fetch notes");
    const data = await res.json();
    return data.blocks;
}

export async function updateNotes(blocks: Block[]): Promise<Block[]> {
    const res = await fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
    });
    if (!res.ok) throw new Error("Failed to update notes");
    const data = await res.json();
    return data.blocks;
}