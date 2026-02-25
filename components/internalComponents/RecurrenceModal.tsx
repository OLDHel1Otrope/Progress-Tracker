"use client";

import { X, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import DateSelection from "./DateSelection";
import AIChatPrompt from "./AiChatPrompt";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AIGoal, generateGoals } from "@/lib/api/ai";
import { getRecurrance, saveRecurranceGoals } from "@/lib/api/recurrance";

interface RecurrenceModalProps {
  isOpen: boolean;
  selectedGoal?: Goal;
  onClose: () => void;
}

interface Goal {
  title: string;
  description: string;
}

export interface DateGoal {
  date: Date;
  goal: Goal;
}

const repeatOptions = [
  "Every week",
  "Every 2 weeks",
  "Every month",
];

export default function RecurrenceModal({
  isOpen,
  selectedGoal,//will use this later
  onClose,
}: RecurrenceModalProps) {
  const [groupName, setGroupName] = useState("");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [goalsData, setGoalsData] = useState<DateGoal[]>([]);

  const [chatText, setChatText] = useState("");
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  const handleDateToggle = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const exists = selectedDates.some(d => d.toISOString().split('T')[0] === dateStr);

    if (exists) {
      setSelectedDates(selectedDates.filter(d => d.toISOString().split('T')[0] !== dateStr));
      setGoalsData(goalsData.filter(gd => gd.date.toISOString().split('T')[0] !== dateStr));
    } else {
      setSelectedDates([...selectedDates, date]);
      setGoalsData([...goalsData, { date, goal: { title: "", description: "" } }]);
    }
  };

  const handleGoalChange = (dateStr: string, field: keyof Goal, value: string) => {
    setGoalsData(goalsData.map(gd => {
      if (gd.date.toISOString().split('T')[0] === dateStr) {
        return {
          ...gd,
          goal: { ...gd.goal, [field]: value }
        };
      }
      return gd;
    }));
  };

  // Delete a specific date and its goal
  const handleDeleteDate = (dateStr: string) => {
    setSelectedDates(selectedDates.filter(d => d.toISOString().split('T')[0] !== dateStr));
    setGoalsData(goalsData.filter(gd => gd.date.toISOString().split('T')[0] !== dateStr));
  };

  console.log(goalsData)


  const getRecurranceTypes = useQuery({
    queryKey: ["recurranceTypes"],
    queryFn: getRecurrance
  }
  )

  const generateGoalsMutation = useMutation({
    mutationFn: ({ userPrompt, goals }: { userPrompt: string; goals: DateGoal[] }) =>
      generateGoals({
        userPrompt,
        goals: goals.map(g => ({
          date: g.date.toISOString().split('T')[0],
          title: g.goal.title,
          description: g.goal.description
        }))
      }),
    onMutate: () => {
      setIsAIProcessing(true);
    },
    onSuccess: (aiGeneratedGoals: AIGoal[]) => {
      setGoalsData(prev => prev.map((dateGoal, index) => {
        const aiGoal = aiGeneratedGoals[index];
        if (aiGoal) {
          return {
            ...dateGoal,
            goal: {
              title: aiGoal.title || dateGoal.goal.title,
              description: aiGoal.description || dateGoal.goal.description
            }
          };
        }
        return dateGoal;
      }));
      setChatText("");
    },
    onError: (err) => {
      console.error("AI generation failed:", err);
    },
    onSettled: () => {
      setIsAIProcessing(false);
    },
  });


  const handleAIGenerate = () => {
    if (!chatText.trim() || goalsData.length === 0) return;
    generateGoalsMutation.mutate({
      userPrompt: chatText,
      goals: goalsData
    });
  };

  const saveGoalsMutation = useMutation({
    mutationFn: () => saveRecurranceGoals({
      recurr_name: groupName,
      goalsData: goalsData.map(gd => ({
        date: gd.date.toISOString().split('T')[0], // Send as YYYY-MM-DD string
        goal: {
          title: gd.goal.title,
          description: gd.goal.description
        }
      }))
    }),
    onMutate: () => {
      // Optional: Show loading state
    },
    onSuccess: () => {
      // Close modal and reset form
      setGroupName("");
      setGoalsData([]);
      setSelectedDates([]);
      onClose();

      console.log("Recurrence group created successfully");
    },
    onError: (err: any) => {
      console.error("Failed to save recurrence goals:", err);
    },
  });

  const handleCreate = () => {
    if (!groupName.trim() || selectedDates.length === 0 || goalsData.every(gd => !gd.goal.title.trim())) {
      return;
    }

    saveGoalsMutation.mutate();
  };

  if (!isOpen) return null;

  const sortedGoalsData = [...goalsData].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full max-w-[75vw]
          h-full max-h-[95vh]
          bg-gradient-to-br from-stone-800 to-stone-900
          border border-stone-700/50
          rounded-3xl
          shadow-[0_20px_80px_rgba(0,0,0,0.6),inset_0_0_15px_rgba(0,0,0,0.3)]
          overflow-hidden
          flex flex-col
        "
      >
        {/* Header */}
        <div className="flex items-center px-8 py-6 border-b border-stone-700/30 bg-stone-800/40">
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-stone-100 to-stone-400 tracking-tight">
            Create Recurrence Group
          </h3>

          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-lg hover:bg-stone-700/60 transition-all duration-200 text-stone-400 hover:text-stone-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="flex flex-row gap-8 w-full h-full">

            {/* Left Column - Settings */}
            <div className="space-y-6 w-1/3">

              {/* Group Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-stone-400 tracking-wide">
                  Group Name
                </label>
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Workout, Reading, Study…"
                  className="
                    w-full bg-stone-900/60
                    border border-stone-600/50
                    rounded-xl px-4 py-3
                    text-stone-200 placeholder:text-stone-600
                    focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-400/20
                    transition-all duration-200
                  "
                />
              </div>


              <label className="block text-sm font-medium text-stone-400 tracking-wide">
                Select Dates
              </label>
              <DateSelection
                selectedDates={selectedDates}
                onDateToggle={handleDateToggle}
              />
              <AIChatPrompt
                chatText={chatText}
                setChatText={setChatText}
                isProcessing={isAIProcessing}
                handleAIGenerate={handleAIGenerate}
              />
            </div>

            {/* Right Column - Goals for each date */}
            <div className="space-y-4 w-2/3 overflow-auto">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-stone-400 tracking-wide">
                  Goals for Each Date ({sortedGoalsData.length})
                </label>
              </div>

              {sortedGoalsData.length === 0 ? (
                <div className="text-center py-12 text-stone-600">
                  <p className="text-sm">Select dates from the calendar to add goals</p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto pr-2 ">
                  {sortedGoalsData.map((dateGoal) => {
                    const dateStr = dateGoal.date.toISOString().split('T')[0];
                    const formattedDate = dateGoal.date.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });

                    return (
                      <div
                        key={dateStr}
                        className="
                          relative group
                          bg-stone-900/40 border border-stone-700/40
                          rounded-lg overflow-hidden
                          hover:border-stone-600/60
                          transition-all duration-200
                        "
                      >
                        {/* Date header */}
                        <div className="flex items-center justify-between pl-4  bg-stone-800/40 border-b border-stone-700/30">
                          <span className="text-xs font-thin text-stone-500">
                            {formattedDate}
                          </span>
                          <button
                            onClick={() => handleDeleteDate(dateStr)}
                            className="
                              p-1.5 rounded-lg
                              bg-stone-800/60 hover:bg-red-900/40
                              text-stone-500 hover:text-red-400
                              transition-all duration-200
                            "
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Goal inputs */}
                        <div className="p-0">
                          <input
                            value={dateGoal.goal.title}
                            onChange={(e) => handleGoalChange(dateStr, 'title', e.target.value)}
                            placeholder="Goal title..."
                            className="
                              w-full bg-stone-800/40
                              border-b border-stone-700/40
                              px-4 py-3
                              text-sm text-stone-200 placeholder:text-stone-600
                              focus:outline-none focus:bg-stone-800/60
                              transition-all duration-200 font-semibold
                            "
                          />
                          <textarea
                            value={dateGoal.goal.description}
                            onChange={(e) => handleGoalChange(dateStr, 'description', e.target.value)}
                            placeholder="Description (optional)..."
                            rows={2}
                            className="
                              w-full bg-stone-800/40
                              px-4 py-3
                              text-sm text-stone-200 placeholder:text-stone-600
                              focus:outline-none focus:bg-stone-800/60
                              transition-all duration-200
                              resize-none
                            "
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-stone-700/30 bg-stone-800/40">
          <div className="text-sm text-stone-500">
            {goalsData.filter(gd => gd.goal.title.trim()).length} goal{goalsData.filter(gd => gd.goal.title.trim()).length !== 1 ? 's' : ''} · {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="
                px-5 py-2.5 rounded-xl
                text-stone-400 font-medium
                hover:bg-stone-700/40
                transition-all duration-200
              "
            >
              Cancel
            </button>

            <button
              onClick={handleCreate}
              disabled={
                !groupName.trim() ||
                selectedDates.length === 0 ||
                goalsData.every(gd => !gd.goal.title.trim()) ||
                saveGoalsMutation.isPending
              }
              className="
                px-6 py-2.5 rounded-xl
                bg-stone-200 text-stone-900
                font-semibold tracking-wide
                hover:bg-stone-100
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200
                shadow-lg shadow-stone-900/20"
            >
              {saveGoalsMutation.isPending ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}