
"use client";

import { useState } from "react";
import { ChevronRight, Fullscreen, Plus } from "lucide-react";
import GoalDetails from "./GoalDetails";
import RecurrenceModal from "./RecurrenceModal";

function extractTags(text: string): string[] {
    return Array.from(
        new Set(
            text.match(/#[a-zA-Z0-9_]+/g)?.map(t => t.slice(1)) ?? []
        )
    );
}

function removeTags(text: string): string {
    return text.replace(/#[a-zA-Z0-9_]+/g, "").replace(/\s+/g, " ").trim();
}


export interface Goal {
    recurrence_group_id: any;
    id: string;
    title: string;
    completed: boolean;
    description?: string;
    notes?: string;
}

export default function GoalItem({
    goal,
    onUpdate,
    isFullscreen,
    onFocus,
    isActive,

}: {
    goal: Goal;
    onUpdate: (updated: Goal) => void;
    isFullscreen: boolean;
    onFocus: () => void;
    isActive: boolean;
}) {
    const [expanded, setExpanded] = useState(false);
    const [editing, setEditing] = useState(false);
    const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);


    return (
        <div
            className={`rounded-lg p-3 transition-all duration-200 group
        ${goal.completed ? "bg-stone-700/30" : expanded ? "bg-stone-800/60" : "bg-stone-800/40"}
      `}
        >

            <div className="flex items-center gap-2">
                <button
                    onClick={() =>
                        onUpdate({ ...goal, completed: !goal.completed })
                    }
                    className={`
            w-4 h-4 rounded-[4px] border flex items-center justify-center
            transition-all duration-200
            ${goal.completed
                            ? "bg-blue-600 border-blue-600"
                            : "border-stone-500 hover:border-stone-300"
                        }
        `}
                >
                    {goal.completed && (
                        <svg
                            viewBox="0 0 24 24"
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                </button>


                <div className="flex-1 ml-1">
                    {editing ? (
                        <input
                            value={goal.title}
                            autoFocus
                            onChange={(e) =>
                                onUpdate({ ...goal, title: e.target.value })
                            }
                            onBlur={() => setEditing(false)}
                            className={`w-full bg-transparent focus:outline-none font-bold
        ${goal.completed ? "line-through text-stone-500" : ""}
      `}
                        />
                    ) : (
                        <div
                            onClick={() => setEditing(true)}
                            className={`font-bold cursor-text flex flex-row gap-2
        ${goal.completed ? "line-through text-stone-500" : ""}
      `}
                        >
                            {removeTags(goal.title) || (
                                <span className="text-stone-500">Untitled</span>
                            )}

                            {!goal.recurrence_group_id && extractTags(goal.title).length == 0 && (<button
                                onClick={() => {
                                    setShowRecurrenceModal(true);
                                    console.log("Clicked tag:", "recurrence");
                                }}
                                className=" font-normal
            px-2 py-[2px] rounded-md text-xs
            border border-stone-600
            text-stone-300
            hover:bg-stone-700/60
            transition flex items-center gap-1
            opacity-0
            group-hover:opacity-100
            transition-all duration-200
            translate-x-1
            group-hover:translate-x-0
          "
                            >
                                <Plus width={10} height={10} /> Add Recurrence group
                            </button>)}
                        </div>
                    )}




                    <div className="mt-1 flex flex-wrap gap-1">
                        {goal.recurrence_group_id && (
                            <button
                                key={goal.recurrence_group_id}
                                onClick={() => {
                                    console.log("Clicked tag:", goal.recurrence_group_id);
                                }}
                                className="
            px-2 py-[2px] rounded-md text-xs
            border border-stone-200
            text-stone-300
            bg-stone-700/40
            hover:bg-stone-700/60
            transition
          "
                            >
                                {goal.recurrence_group_id.charAt(0).toUpperCase() + goal.recurrence_group_id.slice(1)}
                            </button>)}

                        {extractTags(goal.title).length > 0 && (
                            <>

                                {extractTags(goal.title).map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => {
                                            console.log("Clicked tag:", tag);
                                        }}
                                        className="
            px-2 py-[2px] rounded-md text-xs
            border border-stone-600
            text-stone-300
            hover:bg-stone-700/60
            transition
          "
                                    >
                                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                    </button>
                                ))}
                            </>
                        )}

                        {!goal.recurrence_group_id && extractTags(goal.title).length > 0 && (<button
                            onClick={() => {
                                setShowRecurrenceModal(true);
                                console.log("Clicked tag:", "recurrence");
                            }}
                            className="
            px-2 py-[2px] rounded-md text-xs
            border border-stone-600
            text-stone-300
            hover:bg-stone-700/60
            transition flex items-center gap-1
            opacity-0
            group-hover:opacity-100
            transition-all duration-200
            translate-x-1
            group-hover:translate-x-0
          "
                        >
                            <Plus width={10} height={10} /> Add Recurrence group
                        </button>)}
                    </div>

                </div>



                <button
                    onClick={() => {
                        if (isFullscreen) {
                            onFocus();
                        } else {
                            setExpanded(!expanded);
                        }
                    }}
                    className="text-stone-400 hover:text-stone-200 transition     opacity-0 
    group-hover:opacity-100     transition-all duration-200
    translate-x-1
    group-hover:translate-x-0"
                >
                    <ChevronRight
                        size={16}
                        className={`transition-transform duration-200
              ${expanded && !isFullscreen ? "rotate-90" : ""}
            `}
                    />
                </button>
            </div>

            {/* Expanded section */}
            {expanded && !isFullscreen && (
                // <div className="mt-3 border-t border-stone-700/40 pt-3 text-sm text-stone-300">
                //     <div className="italic text-stone-400">
                //         Notes, subtasks, details…
                //     </div>
                // </div>
                <GoalDetails goal={goal} onUpdate={onUpdate} isFullscreen={isFullscreen} />
            )}
            <RecurrenceModal isOpen={showRecurrenceModal} onClose={() => setShowRecurrenceModal(false)} />
        </div>
    );
}
