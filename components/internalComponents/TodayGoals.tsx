"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
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
import { reorderDayGoals } from "@/lib/api/reorder";
import EisenhowerMatrix from "./EisenhowerMatrix";

export default function TodayGoals({ home = false, setCompletionRate }: { home: boolean, setCompletionRate: Dispatch<SetStateAction<number>> }) {

    const [eisenHower, setEisenHower] = useState(false)

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

        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        addGoalMutation.mutate({ title, goal_date: today });
    };

    const reorderMutation = useMutation({
        mutationFn: ({
            goal_date,
            ordered,
        }: {
            goal_date: string;
            ordered: Goal[];
        }) => reorderDayGoals(goal_date, ordered),

        onMutate: async ({ ordered }) => {
            await queryClient.cancelQueries({
                queryKey: ["goals", "today"],
            });

            const prev = queryClient.getQueryData<Goal[]>([
                "goals",
                "today",
            ]);

            queryClient.setQueryData<Goal[]>(
                ["goals", "today"],
                ordered
            );

            return { prev };
        },

        onError: (err, _, ctx) => {
            if (ctx?.prev) {
                queryClient.setQueryData(
                    ["goals", "today"],
                    ctx.prev
                );
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["goals", "today"],
            });
        },
    });




    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 }, // prevents accidental drags
        })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;
        if (!goals.length) return;

        const oldIndex = goals.findIndex(
            (g) => g.id === active.id
        );

        const newIndex = goals.findIndex(
            (g) => g.id === over.id
        );

        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(goals, oldIndex, newIndex);

        reorderMutation.mutate({
            goal_date: goals[0].goal_date,
            ordered: reordered,
        });
    };



    useEffect(() => {
        if (!debouncedGoal) return;

        updateGoalMutation.mutate(debouncedGoal);
    }, [debouncedGoal]);


    useEffect(() => {
        if (!setCompletionRate) return
        if (!Array.isArray(goals) || goals.length === 0) {
            setCompletionRate(0);
            return;
        }

        const completed = goals.filter(g => g?.is_completed === true).length;
        const rawRate = completed / goals.length;

        const safeRate = Math.min(Math.max(rawRate, 0), 1);

        setCompletionRate(safeRate);
    }, [goals]);

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
        <>
            {!eisenHower || home ? (
                <div
                    className={`flex flex-col items-center justify-center pointer-events-auto ${home ? "w-full" : "w-[900px]"
                        }`}
                >                    <GoalList
                        goals={goals}
                        updateGoalText={updateGoalText}
                        updateGoalStatus={updateGoalStatus}
                        isFullscreen={false}
                        sensors={sensors}
                        closestCenter={closestCenter}
                        handleDragEnd={handleDragEnd}
                        addGoal={addGoal}
                        isHome={true}
                    />
                    {!home && <button
                        onClick={() => setEisenHower(p => !p)}
                        className="mt-2 px-2 py-2 bg-stone-800/40 hover:bg-stone-700/40 border border-stone-700/30 rounded-xl text-stone-600 text-xs italic transition-colors pointer-events-auto"
                    >
                        Switch to Eisenhower Matrix
                    </button>}
                </div>
            ) : (
                <div className="w-11/12 flex flex-col items-center justify-center">
                    <EisenhowerMatrix
                        goalsUC={goals}
                    />
                    <button
                        onClick={() => setEisenHower(p => !p)}
                        className="mt-0 px-2 py-2 bg-stone-800/40 hover:bg-stone-700/40 border border-stone-700/30 rounded-xl text-stone-600 text-xs italic transition-colors pointer-events-auto"
                    >
                        Switch to List View
                    </button>
                </div>
            )}

        </>
    );
}