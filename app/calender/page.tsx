"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import DayModal from "@/components/DayModal";

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getCalendarDays(month: number, year: number) {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days = [];

  for (let i = 0; i < 42; i++) {
    const dayNumber = i - startOffset + 1;

    if (dayNumber <= 0) {
      days.push({
        label: daysInPrevMonth + dayNumber,
        isCurrentMonth: false,
      });
    } else if (dayNumber > daysInMonth) {
      days.push({
        label: dayNumber - daysInMonth,
        isCurrentMonth: false,
      });
    } else {
      days.push({
        label: dayNumber,
        isCurrentMonth: true,
      });
    }
  }

  return days;
}

export default function CalendarPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const calendarDays = getCalendarDays(month, year);

  const monthLabel = new Date(year, month).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const handleMonthChange = (delta: number) => {
    const newDate = new Date(year, month + delta, 1);
    setMonth(newDate.getMonth());
    setYear(newDate.getFullYear());
  };

  return (
    <>
      <div className="p-7 flex justify-center">
        <div className="w-full max-w-6xl bg-gradient-to-br from-stone-800/80 to-stone-900/80 rounded-3xl p-6 border border-stone-700/30 backdrop-blur-lg shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] text-stone-300">        {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-stone-300">
                {monthLabel}
              </h2>

              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => handleMonthChange(-1)}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-stone-800 hover:bg-stone-600 transition"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  onClick={() => handleMonthChange(1)}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-stone-800 hover:bg-stone-600 transition"
                >
                  <ChevronRight size={16} />
                </button>

                <button className="w-8 h-8 flex items-center justify-center rounded-md bg-stone-800 hover:bg-stone-600 transition">
                  <Maximize2 size={16} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-md bg-stone-800 hover:bg-stone-600 transition">
                  <Minimize2 size={16} />
                </button>
              </div>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 mt-4 text-sm text-stone-500">
              {dayNames.map((day) => (
                <div key={day} className="text-center">
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-[1px]">
            {calendarDays.map((day, index) => (
              <div
                onClick={() => {
                  if (day.isCurrentMonth) {
                    setSelectedDay(day.label);
                    setIsModalOpen(true);
                  }
                }}
                key={index}
                className={`h-32 p-3 text-sm cursor-pointer transition-all duration-200 ease-out
                ${day.isCurrentMonth
                    ? "bg-stone-700/40 text-stone-100 hover:bg-stone-600/50 hover:scale-[1.01] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_10px_30px_rgba(0,0,0,0.4)]"
                    : "bg-stone-800/30 text-stone-500"
                  }
              `}
              >
                <div className="flex justify-between items-start">
                  <span>{day.label}</span>
                </div>

                {/* Placeholder for progress indicators */}
                {day.isCurrentMonth && (
                  <div className="mt-2 flex flex-col gap-1 text-xs text-stone-300">
                    {/* progress dots / completion bars later */}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="w-30 ml-6 mt-6 text-stone-500 italic">
          Monthly report will be here.
        </div>
      </div>
      {/* this is the day modal */}
      <DayModal
        day={selectedDay ?? 1}
        month={month}
        year={year}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

// todos
// create data models
// add autocomplete for #tags when adding goals/tasks in DayModal
// ability to delete goals/tasks in DayModal
// ability to add links
// ability to reschedule the goals, by one day, uncompleted goals will be rescheduled to next day automatically
// add some beautiful graphic to indicate progress/completion of goals/tasks on each day cell in calendar
// add search facility to search for goals/tasks across days
// add streak feature to motivate consistent goal completion
// draggable goals/tasks to reorder priority
// add monthly report section to show stats, charts, progress summary etc.
// add a quick notes section on the home page, easy way to jot down thoughts this can also be opened in its own model
// integrate with backend to fetch and display actual events/tasks
// maybe integrate with calendar APIs like Google Calendar or Apple Calendar for syncing events


const goals = [{ date: "", goals: [{ title: "", description: "", completed: false, notes: "" },] }]

const notes = [{ date: "", content: "" }]

const tags = ["", ""]