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
        <div className="w-full h-full min-h-0 flex flex-col gap-2 overflow-scroll overflow-x-hidden pl-20">
            <div
                className="
    w-full max-w-6xl
    border border-stone-700
    rounded-lg
    px-6 py-5
    shadow-sm
    transition
    hover:shadow-md
    font-serif
    text-stone-800
    relative
    overflow-hidden
    flex flex-col gap-4
  "
            >
                {/* Subtle paper grain */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] pointer-events-none" />

                {/* Header */}
                <h2
                    className="
      text-md
      font-bold
      uppercase
      tracking-widest
      text-stone-500
      border-b
      border-stone-600
      pb-2
    "
                >
                    Add Note
                </h2>

                {/* Form */}
                <div className="space-y-4">
                    {/* Title Input */}
                    <input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Title"
                        className="
        w-full
        bg-transparent
        border-b
        border-stone-600
        py-2
        text-2xl
        font-bold
        text-stone-300
        placeholder:text-stone-400
        focus:outline-none
        focus:border-stone-500
        transition
      "
                    />

                    {/* Editor */}
                    <div className="leading-relaxed text-[17px] text-stone-700">
                        <RichTextEditor
                            value={newNote}
                            onChange={setNewNote}
                            placeholder="Write a new note..."
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleAddNote}
                            className="
          px-5 py-2
          rounded-md
          border border-stone-400
          text-sm
          font-medium
          text-stone-300
          hover:bg-stone-700
          transition
        "
                        >
                            Add Note
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 max-w-6xl flex flex-col gap-2">
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
