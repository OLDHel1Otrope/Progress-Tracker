
"use client";

import { useState } from "react";
import { ChevronRight, Fullscreen } from "lucide-react";
import GoalDetails from "./GoalDetails";

interface Goal {
    id: string;
    title: string;
    completed: boolean;
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

    return (
        <div
            className={`rounded-lg p-3 transition-all duration-200
        ${goal.completed ? "bg-stone-700/30" : expanded ? "bg-stone-800/60" : "bg-stone-800/40"}
      `}
        >
            {/* Header */}
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


                <input
                    value={goal.title}
                    onChange={(e) =>
                        onUpdate({ ...goal, title: e.target.value })
                    }
                    className={`flex-1 bg-transparent focus:outline-none
            ${goal.completed ? "line-through text-stone-500" : ""}
          `}
                />

                <button
                    onClick={() => {
                        if (isFullscreen) {
                            onFocus(); // open in right pane
                        } else {
                            setExpanded(!expanded); // inline expand
                        }
                    }}
                    className="text-stone-400 hover:text-stone-200 transition"
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
            {expanded&&!isFullscreen && (
                // <div className="mt-3 border-t border-stone-700/40 pt-3 text-sm text-stone-300">
                //     <div className="italic text-stone-400">
                //         Notes, subtasks, details…
                //     </div>
                // </div>
                <GoalDetails goal={goal} onUpdate={onUpdate} isFullscreen={isFullscreen} />
            )}
        </div>
    );
}
