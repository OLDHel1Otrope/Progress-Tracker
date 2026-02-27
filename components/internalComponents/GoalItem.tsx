
"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, Ellipsis, Fullscreen, Plus, RectangleEllipsis } from "lucide-react";
import RecurrenceModal from "./RecurrenceModal";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import GoalDetails from "./GoalDetails";
import MenuItem from "./MenuItem";
import { useDeleteGoal } from "@/hooks/useDeleteGoal";
import { AddRecurrenceModal } from "../AddRecurrenceModal";


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
    updateGoalText,
    updateGoalStatus,
    isFullscreen,
    onFocus,
    isActive,
    isHome = false,

}: {
    goal: Goal;
    updateGoalText: (updated: Goal) => void;
    updateGoalStatus: (updated: Goal) => void;
    isFullscreen: boolean;
    onFocus: () => void;
    isActive: boolean;
}) {
    const [expanded, setExpanded] = useState(false);
    const [editing, setEditing] = useState(false);
    const [showAddRecurrenceModal, setShowAddRecurrenceModal] = useState<string | null>(null); //this holds goal's id
    const [localTitle, setLocalTitle] = useState(goal.title)
    const [showMenu, setShowMenu] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

    const menuRef = useRef<HTMLDivElement | null>(null);
    const ellipsisRef = useRef<HTMLButtonElement | null>(null);

    const deleteGoalMutation = useDeleteGoal();


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

    useEffect(() => {
        setLocalTitle(goal.title);
    }, [goal.title])

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                showMenu &&
                menuRef.current &&
                !menuRef.current.contains(e.target as Node) &&
                ellipsisRef.current &&
                !ellipsisRef.current.contains(e.target as Node)
            ) {
                setShowMenu(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMenu]);


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
                            ? "bg-stone-800/40"
                            : "bg-stone-800/30"
                }
    ${isHome ? " bg-stone-800/20 hover:bg-stone-800/40" : ""}
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
  "
                >
                    <GripVertical size={16} />
                </div>

                <button
                    onClick={() =>
                        updateGoalStatus({ ...goal, is_completed: !goal.is_completed })
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


                <div className="flex-1 ml-1 pt-0">
                    {editing ? (
                        <input
                            value={localTitle}
                            autoFocus
                            onChange={(e) => {
                                setLocalTitle(e.target.value);

                                updateGoalText({
                                    ...goal,
                                    title: e.target.value,
                                });
                            }}
                            onBlur={() => setEditing(false)}
                            className={`w-full bg-transparent focus:outline-none font-bold
        ${goal.is_completed ? "line-through text-stone-500" : " text-stone-300"}
      `}
                        />
                    ) : (
                        <div
                            onClick={() => setEditing(true)}
                            className={`font-bold cursor-text flex flex-row gap-2
        ${goal.is_completed ? "line-through text-stone-500" : "text-stone-300"}
      `}
                        >
                            {removeTags(goal.title) || (
                                <span className="text-stone-500">Untitled</span>
                            )}

                            {!goal.recurr_id && extractTags(goal.title).length == 0 && (<button
                                onClick={() => {
                                    setShowAddRecurrenceModal(goal.id);
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
                                <Plus width={10} height={10} /> Assign Recurrence group
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

                        {goal?.equadrant == 0 && (
                            <button
                                key={"important"}
                                onClick={() => {
                                    console.log("Clicked important tag");
                                }}
                                className="
            px-2 py-[2px] rounded-md text-xs
            border border-rose-600
            text-stone-200  font-bold
            bg-rose-700 
            hover:bg-rose-500/60
            transition
          "
                            >
                                {"P1"}
                            </button>
                        )}
                        {goal?.group_name && (
                            <button
                                key={"recurr_name"}
                                onClick={() => {
                                    console.log("Clicked important tag");
                                }}
                                className="
            px-2 py-[2px] rounded-md text-xs
            border border-stone-600
            border-2
            text-stone-300 capitalize font-bold
            hover:bg-stone-700/60
            transition
          "
                            >
                                {goal?.group_name}
                            </button>
                        )}

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

                        {!goal.recurr_id && extractTags(goal.title).length > 0 && (<button
                            onClick={() => {
                                setShowAddRecurrenceModal(goal.id);
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
                    onUpdate={updateGoalText}
                    isFullscreen={isFullscreen}
                />
            </div>
            {expanded && !isFullscreen && (
                <div className="flex justify-end mt-0">

                    {/* Ellipsis Button */}
                    <button
                        ref={ellipsisRef}
                        onClick={(e) => {
                            e.stopPropagation();

                            const rect = e.currentTarget.getBoundingClientRect();

                            setMenuPos({
                                top: rect.top - 10,
                                left: rect.left - 120,
                            });

                            setShowMenu(prev => !prev);
                        }}
                        className="p-1 rounded hover:bg-stone-700/50 transition"
                    >
                        <Ellipsis color="#666666" />
                    </button>

                    {/* Floating Menu (Portal-like) */}
                    {showMenu && (
                        <div
                            ref={menuRef}
                            style={{
                                top: menuPos.top + 20,
                                left: menuPos.left + 200,
                            }}
                            className="
          fixed
          z-[9999]
          w-40
          origin-top-right
          animate-menu-in
            rounded-2xl
            bg-gradient-to-br from-stone-800/90 to-stone-900/90
            border border-stone-700/30
            backdrop-blur-xl
            shadow-[0_20px_40px_rgba(0,0,0,0.6)]
            overflow-hidden
        "
                        >
                            <MenuItem onClick={() => setEditing(true)}>
                                Edit
                            </MenuItem>

                            <MenuItem onClick={() => updateGoalStatus({ ...goal, is_completed: true })}>
                                Mark Complete
                            </MenuItem>

                            <MenuItem onClick={() => {
                                const nextDay = new Date(goal.goal_date);
                                nextDay.setDate(nextDay.getDate() + 1);
                                updateGoalStatus({
                                    ...goal,
                                    goal_date: nextDay.toISOString()
                                });
                            }}>
                                Move to next day
                            </MenuItem>

                            <MenuItem
                                danger
                                disabled={deleteGoalMutation.isPending}
                                onClick={() => {
                                    deleteGoalMutation.mutate(goal.id);
                                }}
                            >
                                {deleteGoalMutation.isPending ? "Deleting..." : "Delete"}
                            </MenuItem>

                        </div>
                    )}
                </div>
            )}


            <AddRecurrenceModal isOpen={showAddRecurrenceModal} onClose={() => setShowAddRecurrenceModal(null)} />
        </div>
    );
}
