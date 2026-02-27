import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

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
        date: new Date(year, month - 1, daysInPrevMonth + dayNumber),
      });
    } else if (dayNumber > daysInMonth) {
      days.push({
        label: dayNumber - daysInMonth,
        isCurrentMonth: false,
        date: new Date(year, month + 1, dayNumber - daysInMonth),
      });
    } else {
      days.push({
        label: dayNumber,
        isCurrentMonth: true,
        date: new Date(year, month, dayNumber),
      });
    }
  }

  return days;
}

interface DateSelectionProps {
  selectedDates: Date[];
  onDateToggle: (date: Date) => void;
}

export default function DateSelection({ selectedDates, onDateToggle }: DateSelectionProps) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  console.log({selectedDates})

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

  const isDateSelected = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return selectedDates.some(d => d.toISOString().split('T')[0] === dateStr);
  };

  const isToday = (date: Date) => {
    const todayStr = today.toISOString().split('T')[0];
    const dateStr = date.toISOString().split('T')[0];
    return todayStr === dateStr;
  };

  return (
    <div className="bg-stone-900/60 rounded-2xl p-5 border border-stone-700/40 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-stone-100 to-stone-400">
          {monthLabel}
        </h2>

        <div className="flex gap-2">
          <button
            onClick={() => handleMonthChange(-1)}
            className="
              w-8 h-8 flex items-center justify-center rounded-lg
              bg-stone-800/60 hover:bg-stone-700/60
              text-stone-400 hover:text-stone-200
              border border-stone-700/40
              transition-all duration-200
            "
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => handleMonthChange(1)}
            className="
              w-8 h-8 flex items-center justify-center rounded-lg
              bg-stone-800/60 hover:bg-stone-700/60
              text-stone-400 hover:text-stone-200
              border border-stone-700/40
              transition-all duration-200
            "
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-stone-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const selected = isDateSelected(day.date);
          const today = isToday(day.date);

          return (
            <button
              onClick={() => {
                if (day.isCurrentMonth) {
                  onDateToggle(day.date);
                }
              }}
              key={index}
              disabled={!day.isCurrentMonth}
              className={`
                h-11 rounded-lg text-sm font-medium
                transition-all duration-200 ease-out
                relative
                ${!day.isCurrentMonth
                  ? "text-stone-700 cursor-not-allowed"
                  : selected
                    ? "bg-stone-200 text-stone-900 shadow-md hover:bg-stone-100 scale-105 border-2 border-stone-300"
                    : today
                      ? "bg-stone-700/60 text-stone-200 border border-stone-500 hover:bg-stone-600/60"
                      : "bg-stone-800/40 text-stone-400 hover:bg-stone-700/60 hover:text-stone-200 border border-stone-700/30"
                }
              `}
            >
              {/* Glow effect for selected dates */}
              {selected && (
                <div className="absolute inset-0 rounded-lg bg-stone-200/20 blur-sm -z-10" />
              )}

              <span className="relative z-10">{day.label}</span>

              {/* Today indicator dot */}
              {today && !selected && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-stone-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}