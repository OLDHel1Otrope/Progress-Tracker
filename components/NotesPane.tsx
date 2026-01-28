"use client";

import { useState } from "react";
import { NoteCard } from "./internalComponents/NoteCard";
import RichTextEditor from "./internalComponents/RichTextEditor";

type Note = {
    id: string;
    content: string;
    createdAt: string;
    title: string;
};

export default function NotesPane() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState("");
    const [newTitle, setNewTitle] = useState("");

    // Add note
    const handleAddNote = () => {
        if (!newNote.trim()) return;

        const finalTitle =
            newTitle.trim() ||
            generateTitleFromContent(newNote);

        setNotes((prev) => [
            {
                id: crypto.randomUUID(),
                title: finalTitle,
                content: newNote,
                createdAt: new Date().toISOString(),
            },
            ...prev,
        ]);

        setNewNote("");
        setNewTitle("");
    };



    // Update note
    const updateNote = (
        id: string,
        content: string,
        title?: string
    ) => {
        setNotes((prev) =>
            prev.map((n) =>
                n.id === id
                    ? {
                        ...n,
                        content,
                        title: title ?? n.title,
                    }
                    : n
            )
        );
    };


    return (
        <div className="w-full max-w-6xl h-full min-h-0 flex flex-col gap-2">
            <div
                className="
            w-full max-w-6xl
            bg-gradient-to-br from-stone-800/80 to-stone-900/80
        rounded-3xl p-6
        border border-stone-700/30
        backdrop-blur-lg
        shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]
        text-stone-300
        flex flex-col
        "
            >
                {/* Header */}
                <h2 className="text-xl font-semibold text-stone-200">
                    Add notes
                </h2>

                {/* Add Note */}
                <div className="space-y-3 gap-2">

                    <input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Title"
                        className="
      w-full py-2 
      bg-stone-800/70
      text-stone-200 placeholder:text-stone-500
      text-xl
    "
                    />
                    <RichTextEditor
                        value={newNote}
                        onChange={setNewNote}
                        placeholder="Write a new note..."
                    />

                    <div className="flex justify-end">
                        <button
                            onClick={handleAddNote}
                            className="
                        px-4 py-2 rounded-lg
                        bg-stone-700 hover:bg-stone-600
                        transition text-sm
                        "
                        >
                            Add Note
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
                {notes.map((note) => (
                    <NoteCard
                        key={note.id}
                        note={note}
                        onUpdate={updateNote}
                    />
                ))}
            </div>
        </div>
    );
}


function generateTitleFromContent(html: string) {
    // Remove HTML tags
    const text = html.replace(/<[^>]*>/g, "").trim();

    if (!text) return "Untitled";

    const words = text.split(/\s+/).slice(0, 4);

    return words.join(" ") + (words.length >= 4 ? "…" : "");
}
