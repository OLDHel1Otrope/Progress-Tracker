"use client";

import { useState } from "react";
import { NoteCard } from "./internalComponents/NoteCard";
import RichTextEditor from "./internalComponents/RichTextEditor";
import { Plus } from "lucide-react";
import { NoteRenderer } from "./internalComponents/noteComponents/NoteRenderer";

type Note = {
    id: string;
    content: string;
    createdAt: string;
    title: string;
};

export default function NotesPane() {
    const [notes, setNotes] = useState<Note[]>(SampleNotes);
    const [newNote, setNewNote] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [addNote, setAddNote] = useState(false);

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
        setAddNote(false);
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
        <div className="w-full h-full min-h-0 flex flex-col gap-2 overflow-scroll overflow-x-hidden ml-28 pointer-events-auto">
            {/* {!addNote ? (
                <button
                    onClick={() => setAddNote(true)}
                    className="
      w-full max-w-6xl
      border-2 border-dashed border-stone-400
      rounded-lg
      px-6 py-10
      flex flex-col items-center justify-center gap-3
      text-stone-600
      transition
      hover:border-stone-600
      hover:text-stone-800
      hover:bg-stone-400
      hover:shadow-sm
      group
    "
                >
                    <div
                        className="
        flex items-center justify-center
        w-12 h-12
        rounded-full
        border border-stone-400
        group-hover:border-stone-600
        transition
      "
                    >
                        <Plus className="w-6 h-6" />
                    </div>

                    <div className="text-lg font-medium tracking-wide">
                        Add New Note
                    </div>

                    <div className="text-xs text-stone-600 italic">
                        Start writing
                    </div>
                </button>
            ) : (<>
                <div
                    className="
    w-full max-w-6xl
    border border-stone-700
    rounded-lg
    px-6 py-5
    shadow-sm
    transition
    hover:shadow-md
    text-stone-800
    relative
    overflow-hidden
    flex flex-col gap-4
  "
                >

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

                    <div className="space-y-4">
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

                        <div className="leading-relaxed text-[17px] text-stone-700">
                            <RichTextEditor
                                value={newNote}
                                onChange={setNewNote}
                                placeholder="Write a new note..."
                            />
                        </div>

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
            </>)} */}
            {/* <div className="flex-1 min-h-0 max-w-6xl flex flex-col gap-1">
                {notes.map((note) => (
                    <NoteCard
                        key={note.id}
                        note={note}
                        onUpdate={updateNote}
                    />
                ))}
            </div> */}
                        <NoteRenderer initialBlocks={sampleNoteData} />
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


const sampleNoteData = [
    {
        id: "n1",
        type: "todo",
        data: "This is the first sample todo",
        checked: false,
    },
    {
        id: "n2",
        type: "dropdown",
        data: "This is the first dropdown",
        isOpen: true,
        children: [
            {
                id: "n3",
                type: "todo",
                data: "This is the child todo",
                checked: false,
            },
            {
                id: "n4",
                type: "todo",
                data: "This is the second child todo",
                checked: false,
            },
        ]
    }
];


const SampleNotes: Note[] = [
    {
        id: "1",
        title: "My boss says try-catch is `garbage` and we shouldn't use it. Is this actually a thing? ",
        content: "<p>So my boss recently told me that try-catch statements are 'garbage' and that I should avoid using them when developing. This wasn't specific to any particular language - they seemed to mean it as a general programming principle. I'm pretty confused because I thought error handling with try-catch was fundamental to most modern programming languages. I know it can be misused (like catching exceptions and doing nothing, or using exceptions for control flow), but completely avoiding it seems extreme. Is there some programming philosophy or best practice I'm missing here? Are there alternatives to try-catch that are considered better? Or is my boss maybe referring to specific anti-patterns that I should be aware of? Has anyone else encountered this 'no try-catch' philosophy? What are the actual best practices around exception handling across different languages? Any insight would be really helpful - I want to understand if there's something legitimate here or if I should push back on this guidance.</p>",
        createdAt: new Date().toISOString(),
    },
    {
        id: "2",
        title: "How do I center a div with CSS?",
        content: "<p>I'm trying to center a div both horizontally and vertically within its parent container using CSS. I've tried using <code>margin: auto</code>, but it only centers the div horizontally. I've also tried using <code>position: absolute</code> with <code>top: 50%</code> and <code>left: 50%</code>, but that doesn't seem to work either. What is the best way to center a div in the middle of the page regardless of its size? Are there any modern CSS techniques or properties that can help with this? I want to make sure it works across different screen sizes and is responsive. Any code examples or explanations would be greatly appreciated!</p>",
        createdAt: new Date().toISOString(),
    },
    {
        id: "3",
        title: "What's the difference between let, const, and var in JavaScript?",
        content: "<p>I've been learning JavaScript and I keep seeing the keywords <code>let</code>, <code>const</code>, and <code>var</code> for declaring variables. I'm a bit confused about when to use each one. I know that <code>var</code> is the old way of declaring variables, but what are the specific differences between them? I've heard that <code>let</code> and <code>const</code> have block scope while <code>var</code> has function scope, but I'm not entirely sure what that means in practice. Also, when should I use <code>const</code>? Is it just for values that won't change, or are there other reasons to prefer it? Are there any performance implications or best practices around using these different variable declarations? I'd love some clarity on this topic!</p>",
        createdAt: new Date().toISOString(),
    },
    {
        id: "4",
        title: "How do I create a responsive navigation bar with CSS?",
        content: "<p>I'm trying to create a responsive navigation bar for my website using CSS. I want the navigation links to be displayed horizontally on larger screens, but on smaller screens (like mobile devices), I want them to collapse into a hamburger menu. I've heard about using media queries and flexbox for this, but I'm not sure how to implement it. Can someone provide a step-by-step guide or code example on how to create a responsive navigation bar that works well on both desktop and mobile devices? Also, are there any best practices or common pitfalls I should be aware of when designing a responsive nav bar?</p>",
        createdAt: new Date().toISOString(),
    }

];