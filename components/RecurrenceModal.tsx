"use client";

import { X, ChevronDown } from "lucide-react";
import { useState } from "react";

interface RecurrenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const repeatOptions = [
  "Every day",
  "Every week",
  "Every month",
  "Every other day",
  "MWFS",
  "TTS",
];

export default function RecurrenceModal({
  isOpen,
  onClose,
}: RecurrenceModalProps) {
  const [groupName, setGroupName] = useState("");
  const [repeatRule, setRepeatRule] = useState(repeatOptions[0]);
  const [repeatUntil, setRepeatUntil] = useState<string>("");

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full max-w-lg
          bg-gradient-to-br from-stone-800/80 to-stone-900/80
          border border-stone-700/40
          rounded-3xl p-6
          shadow-[0_30px_80px_rgba(0,0,0,0.6)]
          animate-[fadeIn_0.25s_ease-out]
          text-stone-300
        "
      >
        {/* Header */}
        <div className="flex items-center mb-6">
          <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-stone-300">
            Add recurrence group
          </h3>

          <button
            onClick={onClose}
            className="ml-auto p-1 rounded-md hover:bg-stone-700/60 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5">
          {/* Group Name */}
          <div className="space-y-1">
            <label className="text-sm text-stone-400">
              Group name
            </label>

            <div className="relative">
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Workout, Reading, Study…"
                className="
                  w-full bg-stone-800/50
                  border border-stone-600/50
                  rounded-lg px-3 py-2
                  focus:outline-none focus:border-stone-400
                  transition
                "
              />
              {/* dropdown hint */}
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500"
              />
            </div>
          </div>

          {/* Repeat Rule */}
          <div className="space-y-1">
            <label className="text-sm text-stone-400">
              Repeat
            </label>

            <select
              value={repeatRule}
              onChange={(e) => setRepeatRule(e.target.value)}
              className="
                w-full bg-stone-800/50
                border border-stone-600/50
                rounded-lg px-3 py-2
                focus:outline-none focus:border-stone-400
                transition
              "
            >
              {repeatOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Repeat Until */}
          <div className="space-y-1">
            <label className="text-sm text-stone-400">
              Repeat until
            </label>

            <input
              type="date"
              value={repeatUntil}
              onChange={(e) => setRepeatUntil(e.target.value)}
              className="
                w-full bg-stone-800/50
                border border-stone-600/50
                rounded-lg px-3 py-2
                focus:outline-none focus:border-stone-400
                transition
              "
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="
              px-4 py-2 rounded-lg
              text-stone-400
              hover:bg-stone-700/40
              transition
            "
          >
            Cancel
          </button>

          <button
            className="
              px-4 py-2 rounded-lg
              bg-stone-200 text-stone-900
              font-medium
              hover:bg-white
              transition
            "
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
