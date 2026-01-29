"use client"

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import GoalItem from "./GoalItem";

interface GoalListProps {
    goals: any[];
    updateGoal: (id: string, updates: any) => void;
    isFullscreen: boolean;
    activeGoalId: string | null;
    setActiveGoalId: (id: string) => void;
    sensors: any;
    closestCenter: any;
    handleDragEnd: (event: any) => void;
    addGoal: (goal: string) => void;
    isHome?: boolean;
}


export default function GoalList({
    goals,
    updateGoal,
    isFullscreen,
    activeGoalId,
    setActiveGoalId,
    sensors,
    closestCenter,
    handleDragEnd,
    addGoal,
    isHome = false,
}: GoalListProps) {
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >

            {/* LEFT COLUMN */}
            <div className={`w-full min-h-0 flex flex-col `}>

                <SortableContext
                    items={goals.map((g) => g.id)}
                    strategy={verticalListSortingStrategy}
                >

                    {/* SCROLL AREA */}
                    <div className={`flex flex-col ${isHome ? "gap-1" : "gap-2"} min-h-0 overflow-y-auto overflow-x-hidden`}>

                        {goals.map((goal, i) => (
                            <GoalItem
                                key={goal.id}
                                goal={{ ...goal, index: i }}
                                onUpdate={updateGoal}
                                isFullscreen={isFullscreen}
                                onFocus={() => setActiveGoalId(goal.id)}
                                isActive={activeGoalId === goal.id}
                                isHome={isHome}
                            />
                        ))}

                    </div>
                </SortableContext>

                {/* ADD INPUT (fixed at bottom) */}
                <div className={`${isHome ? "mt-1" : "mt-2"} shrink-0 flex items-center gap-4 p-1 pl-9 bg-stone-800/${isHome && goals.length > 0 ? "20 rounded-b-xl" : "30"}`}
                    style={{

                    }}
                >
                    <input type="checkbox" disabled className="opacity-40" />
                    

                    <input
                        placeholder="Add a new goal…"
                        className="bg-transparent focus:outline-none w-full text-stone-500 h-12 placeholder:text-stone-600 font-bold"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                addGoal(e.currentTarget.value);
                                e.currentTarget.value = "";
                            }
                        }}
                    />
                </div>

            </div>

        </DndContext>);
}