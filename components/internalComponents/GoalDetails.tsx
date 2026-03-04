"use client";

import RichTextEditor from "@/components/internalComponents/RichTextEditor";
import { Goal } from "./GoalItem";


interface GoalDetailsProps {
  goal: Goal;
  onUpdate: (goal: Goal) => void;
  isFullscreen: boolean;
  isPane?: boolean
}

export default function GoalDetails({
  goal,
  onUpdate,
  isFullscreen,
  isPane = false
}: GoalDetailsProps) {
  return (
    <div className={`flex flex-col gap-6 ${!isPane ? "mt-4" : "mt-1"}`}>

      {isFullscreen && (
        <h4 className="text-xl font-semibold text-stone-100">
          {goal.title}
        </h4>
      )}


      <section className="space-y-2">
        {/* <label className="text-sm text-stone-400">Description</label> */}
        <RichTextEditor
          isPane
          value={goal.description || ""}
          placeholder="What is this goal about?"
          onChange={(value) =>
            onUpdate({ ...goal, description: value })
          }
        />
      </section>

      {/* <section className="space-y-2">
        <RichTextEditor
          value={goal.notes || ""}
          placeholder="Add thoughts, links, reflections…"
          onChange={(value) =>
            onUpdate({ ...goal, notes: value })
          }
        />
      </section> */}
    </div>
  );
}
