"use client";
import { useState } from "react";
import RichTextEditor from "./RichTextEditor";

interface NoteCardProps {
    note: {
        id: string;
        title: string;
        content: string;
        createdAt: string;
    };
    onUpdate: (id: string, content: string) => void;
}

export function NoteCard({ note, onUpdate }: NoteCardProps) {
    const [value, setValue] = useState(note.content);

    return (
        <div
            className="
        bg-stone-800/60
        border border-stone-700/40
        rounded-xl
        p-4
        transition
        hover:bg-stone-800/80
        flex flex-col gap-2
        "
        // w-full max-w-6xl bg-gradient-to-br from-stone-800/80 to-stone-900/80 rounded-3xl p-6 border border-stone-700/30 backdrop-blur-lg shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] text-stone-300
        >
            {/* Title */}
            <div className="w-max px-2 py-[2px] rounded-md text-xs
            border border-stone-600
            text-stone-300
            hover:bg-stone-700/60
            mb-0 font-bold italic">
                {new Date(note.createdAt).toLocaleString()}
            </div>
            <div className="text-2xl text-stone-200 truncate font-bold mb-2">
                {note.title || "Untitled"}
            </div>


            {/* Editor */}
            <RichTextEditor
                value={value}
                onChange={(v) => {
                    setValue(v);
                    onUpdate(note.id, v);
                }}
            // minimal
            />

            {/* Footer */}
        </div>
    );
}
