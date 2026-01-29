"use client";

import { useState } from "react";
import { Minimize2, Maximize2 } from "lucide-react";
import GoalItem, { Goal } from "./GoalItem";
import GoalDetails from "./GoalDetails";

import {
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
} from "@dnd-kit/sortable";
import GoalList from "./GoalList";
import { sampleGoals } from "./DayModal";

export default function TodayGoals() {
    const [goals, setGoals] = useState<Goal[]>(sampleGoals);

    const updateGoal = (updated: Goal) => {
        setGoals((prev) =>
            prev.map((g) => (g.id === updated.id ? updated : g))
        );
    };

    const addGoal = (title: string) => {
        if (!title.trim()) return;

        setGoals((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                title,
                completed: false,
            },
        ]);
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 }, // prevents accidental drags
        })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setGoals((items) => {
            const oldIndex = items.findIndex((g) => g.id === active.id);
            const newIndex = items.findIndex((g) => g.id === over.id);
            return arrayMove(items, oldIndex, newIndex);
        });
    };


    return (
        <div className="w-[800px]  items-center justify-center ">
            <GoalList
                goals={goals}
                updateGoal={updateGoal}
                isFullscreen={false}
                // activeGoalId={activeGoalId}
                // setActiveGoalId={setActiveGoalId}
                sensors={sensors}
                closestCenter={closestCenter}
                handleDragEnd={handleDragEnd}
                addGoal={addGoal}
                isHome={true}
            />
        </div>
    );
}