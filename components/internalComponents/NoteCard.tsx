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
        rounded-lg
        px-6 py-5
        shadow-sm
        transition
        hover:shadow-md
        flex flex-col gap-4
        font-serif
        text-stone-800
        relative
      "
    >
      {/* Subtle paper grain */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" />


      {/* Title */}
      <h2
        className="
          text-3xl
          font-bold
          leading-snug
          text-stone-300
          border-b
          border-stone-600
          pb-2
        "
      >
        {note.title || "Untitled"}
      </h2>
      {/* Date */}
      <div
        className="
          text-xs
          uppercase
          tracking-widest
          text-stone-500
          font-medium
        "
      >
        {new Date(note.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "2-digit",
          year: "numeric",
        })
        }
      </div>


      {/* Content */}
      <div className="leading-relaxed text-[17px] text-stone-700">
        <RichTextEditor
          value={value}
          onChange={(v) => {
            setValue(v);
            onUpdate(note.id, v);
          }}
        />
      </div>
    </div>
  );
}
