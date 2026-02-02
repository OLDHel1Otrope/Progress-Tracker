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

import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    fetchTodayGoals,
    addGoalApi,
    updateGoalApi,
} from "@/lib/api/goals";

export default function TodayGoals() {
    const queryClient = useQueryClient();

    const {
        data: goals = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["goals", "today"],
        queryFn: fetchTodayGoals,
    });


    const addGoalMutation = useMutation({
        mutationFn: ({ title, goal_date }: { title: string; goal_date: string }) => addGoalApi(title, goal_date),

        onSuccess: () => {
            // Refetch today goals
            queryClient.invalidateQueries({
                queryKey: ["goals", "today"],
            });
        },
    });

    const updateGoalMutation = useMutation({
        mutationFn: updateGoalApi,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["goals", "today"],
            });
        },
    });

    const updateGoal = (updated: Goal) => {
        updateGoalMutation.mutate(updated);
    };

    const addGoal = (title: string) => {
        if (!title.trim()) return;

        const today = new Date().toISOString().split('T')[0];
        addGoalMutation.mutate({ title, goal_date: today });
    };


    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 }, // prevents accidental drags
        })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = goals.findIndex(
            (g) => g.id === active.id
        );

        const newIndex = goals.findIndex(
            (g) => g.id === over.id
        );

        const reordered = arrayMove(goals, oldIndex, newIndex);

        // OPTIONAL: send order to backend
        // saveOrderMutation.mutate(reordered);
    };

    if (isLoading) {
        return (
            <div className="text-stone-400">
                Loading goals...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-red-400">
                Failed to load goals
            </div>
        );
    }



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