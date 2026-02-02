"use client";

import { useEffect, useState } from "react";
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

import { useDebounce } from "@/hooks/useDebounce";

export default function TodayGoals() {

    const [editingGoalText, setEditingGoalText] = useState<Goal | null>(null);
    const debouncedGoal = useDebounce(editingGoalText, 600);

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

    const updateGoalText = (updated: Goal) => {
        setEditingGoalText(updated);
    };

    const updateGoalStatus = (updated: Goal) => {
        updateGoalMutation.mutate(updated);
    }

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

    useEffect(() => {
        if (!debouncedGoal) return;

        updateGoalMutation.mutate(debouncedGoal);
    }, [debouncedGoal]);

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
                updateGoalText={updateGoalText}
                updateGoalStatus={updateGoalStatus}
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