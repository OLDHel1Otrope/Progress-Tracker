
"use client";

import { useState } from "react";
import { ChevronRight, Fullscreen, Plus } from "lucide-react";
import RecurrenceModal from "./RecurrenceModal";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import GoalDetails from "./GoalDetails";


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
    is_completed: boolean;
    description?: string;
    notes?: string;
    isHome?: boolean;
}

export default function GoalItem({
    goal,
    onUpdate,
    isFullscreen,
    onFocus,
    isActive,
    isHome = false,

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

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: goal.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };



    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
            className={`
    group p-3
    flex flex-col
    transition-colors duration-200
    ${isHome && goal.index === 0 ? "rounded-t-xl" : ""}


    ${isDragging
                    ? "opacity-60 bg-stone-700/60"
                    : goal.is_completed
                        ? "bg-stone-700/30"
                        : expanded
                            ? "bg-stone-800/60"
                            : "bg-stone-800/40"
                }
    ${isHome ? "opacity-70 hover:opacity-100 bg-stone-800/20" : ""}
  `}
        >


            <div className="flex items-center gap-2">

                <div
                    {...attributes}
                    {...listeners}
                    className="
    opacity-0 group-hover:opacity-100
    cursor-grab active:cursor-grabbing
    text-stone-500 hover:text-stone-300
    transition-opacity
    pt-1
  "
                >
                    <GripVertical size={16} />
                </div>

                <button
                    onClick={() =>
                        onUpdate({ ...goal, is_completed: !goal.is_completed })
                    }
                    className={`
            w-4 h-4 rounded-[4px] border flex items-center justify-center
            transition-all duration-200
            ${goal.is_completed
                            ? "bg-blue-600 border-blue-600"
                            : "border-stone-500 hover:border-stone-300"
                        }
        `}
                >
                    {goal.is_completed && (
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
        ${goal.is_completed ? "line-through text-stone-500" : ""}
      `}
                        />
                    ) : (
                        <div
                            onClick={() => setEditing(true)}
                            className={`font-bold cursor-text flex flex-row gap-2
        ${goal.is_completed ? "line-through text-stone-500" : ""}
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
            <div
                className={` mx-7
    overflow-hidden
    transition-[max-height,opacity,margin-top] duration-300 ease-out
    ${expanded && !isFullscreen
                        ? "max-h-[700px] opacity-100 mt-3"
                        : "max-h-0 opacity-0 mt-0"}
  `}
            >
                <GoalDetails
                    goal={goal}
                    onUpdate={onUpdate}
                    isFullscreen={isFullscreen}
                />
            </div>
            <RecurrenceModal isOpen={showRecurrenceModal} onClose={() => setShowRecurrenceModal(false)} />
        </div>
    );
}
