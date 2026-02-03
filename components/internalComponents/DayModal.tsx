"use client";

import { useEffect, useState } from "react";
import { Minimize2, Maximize2 } from "lucide-react";
import GoalItem from "./GoalItem";
import GoalDetails from "./GoalDetails";

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
import GoalList from "./GoalList";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addGoalApi, fetchGoalsByDate, updateGoalApi } from "@/lib/api/goals";
import { useDebounce } from "@/hooks/useDebounce";
import { reorderDayGoals } from "@/lib/api/reorder";


interface DayModalProps {
  day: number;
  month: number; // 0-indexed
  year: number;
  isOpen: boolean;
  onClose: () => void;
}

type Goal = {
  id: string;
  scheduled_date?: string;
  title: string;
  is_completed: boolean;
  recurrence_group_id?: string | null;
  description?: string;
  notes?: string;
  subtasks?: { id: string; title: string; done: boolean }[];
};

const getOrdinal = (n: number) => {
  if (n % 100 >= 11 && n % 100 <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

export default function DayModal({ day, month, year, isOpen, onClose }: DayModalProps) {
  const queryKey = ["goals", "byDate", year, month, day];
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);

  const [editingGoalText, setEditingGoalText] = useState<Goal | null>(null);
  const debouncedGoal = useDebounce(editingGoalText, 600);

  const formattedDate = `${day}${getOrdinal(day)} ${new Date(year, month).toLocaleString("default", {
    month: "long",
  })} ${year}`;


  const queryClient = useQueryClient();

  const {
    data: goals = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["goals", "byDate", year, month, day],
    queryFn: () => fetchGoalsByDate(`${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`),
  });


  const addGoalMutation = useMutation({
    mutationFn: ({ title, goal_date }: { title: string; goal_date: string }) => addGoalApi(title, goal_date),

    onSuccess: () => {
      // Refetch today goals
      queryClient.invalidateQueries({
        queryKey: ["goals", "byDate", year, month, day],
      });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: updateGoalApi,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["goals", "byDate", year, month, day],
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
    addGoalMutation.mutate({ title, goal_date: `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` });
  };

  const reorderMutation = useMutation({
    mutationFn: ({
      day_id,
      ordered,
    }: {
      day_id: string;
      ordered: Goal[];
    }) => reorderDayGoals(day_id, ordered),

    onMutate: async ({ ordered }) => {
      await queryClient.cancelQueries({
        queryKey
      });

      const prev = queryClient.getQueryData<Goal[]>(queryKey);

      queryClient.setQueryData<Goal[]>(
        queryKey,
        ordered
      );

      return { prev };
    },

    onError: (err, _, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(
          queryKey,
          ctx.prev
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey,
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
      day_id: goals[0].day_id,
      ordered: reordered.map(g => g.day_goal_id),
    });
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

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center"
      onClick={() => { onClose(); setIsFullscreen(false); }}>
      <div
        className={`
    bg-stone-900 p-6 border border-stone-700/40 flex flex-col
    transition-[width,height,border-radius] duration-300 ease-out
    animate-[fadeIn_0.25s_ease-out]
    ${isFullscreen
            ? "w-screen h-screen rounded-none pl-[170px]"
            : "w-[55vw] h-[75vh] rounded-3xl"
          }
  `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center mb-4">
          <h3 className="text-xl font-semibold">{formattedDate}</h3>

          <div className="ml-auto flex gap-2">
            {isFullscreen ? (
              <button
                onClick={() => setIsFullscreen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-stone-800 hover:bg-stone-600 transition"
              >
                <Minimize2 size={18} />
              </button>
            ) : (
              <button
                onClick={() => setIsFullscreen(true)}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-stone-800 hover:bg-stone-600 transition"
              >
                <Maximize2 size={18} />
              </button>
            )}

            <button
              onClick={() => { onClose(); setIsFullscreen(false); }}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-stone-800 hover:bg-stone-600 transition"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="h-full min-h-0 flex flex-row gap-2 overflow-hidden">

          <GoalList
            goals={goals}
            updateGoalText={updateGoalText}
            updateGoalStatus={updateGoalStatus}
            isFullscreen={isFullscreen}
            activeGoalId={activeGoalId}
            setActiveGoalId={setActiveGoalId}
            sensors={sensors}
            closestCenter={closestCenter}
            handleDragEnd={handleDragEnd}
            addGoal={addGoal}
          />

          {/* RIGHT PANEL */}
          {isFullscreen && (
            <div className="w-full min-h-0 overflow-y-auto rounded-xl bg-stone-800/40 p-6">
              {activeGoalId ? (
                <GoalDetails
                  goal={goals.find((g) => g.id === activeGoalId)!}
                  onUpdate={updateGoalText}
                  isFullscreen={isFullscreen}
                />
              ) : (
                <div className="text-stone-500 italic">
                  Select a goal to view details
                </div>
              )}
            </div>
          )}


        </div>
      </div>
    </div >
  );
}