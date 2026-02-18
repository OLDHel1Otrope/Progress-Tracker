"use client";
import { NoteRenderer } from "./internalComponents/noteComponents/NoteRenderer";

export default function NotesPane() {
    return (
        <div className="w-full h-full min-h-0 flex flex-col gap-2 overflow-scroll overflow-x-hidden ml-28 pointer-events-auto">
            <NoteRenderer />
        </div>
    );
}