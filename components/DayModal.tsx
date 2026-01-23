"use client";

import { useState } from "react";
import { Minimize2, Maximize2 } from "lucide-react";
import GoalItem from "./GoalItem";
import GoalDetails from "./GoalDetails";

interface DayModalProps {
  day: number;
  month: number; // 0-indexed
  year: number;
  isOpen: boolean;
  onClose: () => void;
}

type Goal = {
  id: string;
  title: string;
  completed: boolean;
  recurrence_group_id?: string | null;
  notes?: string;
  subtasks?: { id: string; title: string; done: boolean }[];
};

export default function DayModal({ day, month, year, isOpen, onClose }: DayModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [goals, setGoals] = useState<Goal[]>(sampleGoals);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);

  if (!isOpen) return null;

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

  const formattedDate = `${day}${getOrdinal(day)} ${new Date(year, month).toLocaleString("default", {
    month: "long",
  })} ${year}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center"
    onClick={() => { onClose(); setIsFullscreen(false); }}>
      <div
        className={`
    bg-stone-900 p-6 border border-stone-700/40 flex flex-col
    transition-[width,height,border-radius] duration-300 ease-out
    animate-[fadeIn_0.25s_ease-out]
    ${isFullscreen
            ? "w-screen h-screen rounded-none"
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


        <div className="h-full min-h-0 flex flex-row gap-2">
          <div className="flex-1 h-full overflow-y-auto rounded-xl p-4 space-y-2">
            {goals.map((goal) => (
              <GoalItem
                key={goal.id}
                goal={goal}
                onUpdate={updateGoal}
                isFullscreen={isFullscreen}
                onFocus={() => setActiveGoalId(goal.id)}
                isActive={activeGoalId === goal.id}
              />
            ))}

            <div className="flex items-center gap-2 p-3 rounded-lg bg-stone-800/30">
              <input type="checkbox" disabled className="opacity-40" />

              <input
                placeholder="Add a new goal…"
                className="bg-transparent focus:outline-none w-full text-stone-400 h-12"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addGoal(e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
            </div>
          </div>
          {isFullscreen && (
            <div className="w-3/5 min-h-0 overflow-y-auto rounded-xl bg-stone-800/40 p-6">
              {activeGoalId ? (
                <GoalDetails
                  goal={goals.find((g) => g.id === activeGoalId)!}
                  onUpdate={updateGoal}
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
    </div>
  );
}

let sampleGoals= [
  {
    id: "goal-2026-01-24-001",
    scheduled_date: "2026-01-24",
    title: "Morning workout #Exercise #Health",
    recurrence_group_id: "recurr-001",
    description: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Chest + triceps day. Focus on form, not weight.\n\n" },
            { type: "text", marks: [{ type: "bold" }], text: "Workout plan:\n" },
            { type: "text", text: "- Bench press\n- Incline dumbbell press\n- Tricep dips\n- Cable pushdowns\n\n" },
            { type: "text", text: "End with 10 min stretching." }
          ]
        }
      ]
    },
    is_completed: true,
  },

  {
    id: "goal-2026-01-24-002",
    scheduled_date: "2026-01-24",
    title: "DSA practice session #Academic #Coding",
    recurrence_group_id: "recurr-002",
    description: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Solve problems on:\n" },
            { type: "text", marks: [{ type: "bold" }], text: "Topics:\n" },
            { type: "text", text: "- Binary Search\n- Recursion\n- Sliding Window\n\n" },
            { type: "text", text: "Target: 4 problems minimum.\nFocus on approach, not speed." }
          ]
        }
      ]
    },
    is_completed: false,
  },

  {
    id: "goal-2026-01-24-003",
    scheduled_date: "2026-01-24",
    title: "Read 20 pages #Reading #Focus",
    recurrence_group_id: null,
    description: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Book: " },
            { type: "text", marks: [{ type: "italic" }], text: "Deep Work – Cal Newport\n\n" },
            { type: "text", text: "No phone, no notifications.\nRead with full concentration.\n\nTake short notes after reading." }
          ]
        }
      ]
    },
    is_completed: true,
  },

  {
    id: "goal-2026-01-24-004",
    scheduled_date: "2026-01-24",
    title: "Plan weekly goals #Planning #Life",
    recurrence_group_id: "recurr-003",
    description: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Plan for upcoming week:\n\n" },
            { type: "text", text: "- Fitness schedule\n- Study targets\n- Project milestones\n- Rest days\n\n" },
            { type: "text", text: "Set realistic goals, not idealistic ones." }
          ]
        }
      ]
    },
    is_completed: false,
  }
];
