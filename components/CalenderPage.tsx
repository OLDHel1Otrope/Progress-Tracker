import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";
import DayModal from "./internalComponents/DayModal";
import { useQuery } from "@tanstack/react-query";
import { getMonthlyStats } from "@/lib/api/calender";

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getCalendarDays(month: number, year: number) {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const days = [];

  // Helper to format date as YYYY-MM-DD without timezone conversion
  const formatDate = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  for (let i = 0; i < 42; i++) {
    const dayNumber = i - startOffset + 1;

    if (dayNumber <= 0) {
      // Previous month
      const actualDay = daysInPrevMonth + dayNumber;
      days.push({
        label: actualDay,
        isCurrentMonth: false,
        date: formatDate(year, month - 1, actualDay)
      });
    } else if (dayNumber > daysInMonth) {
      // Next month
      const actualDay = dayNumber - daysInMonth;
      days.push({
        label: actualDay,
        isCurrentMonth: false,
        date: formatDate(year, month + 1, actualDay)
      });
    } else {
      // Current month
      days.push({
        label: dayNumber,
        isCurrentMonth: true,
        date: formatDate(year, month, dayNumber)
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
  const stats = useQuery({
    queryFn: getMonthlyStats,
    queryKey: ["monthlySats", month + 1, year],
    select: (data) => {
      const statsMap = new Map(data.map(d => [d.date, d.stats]));

      return calendarDays.map(day => ({
        ...day,
        stats: statsMap.get(day.date) || { total_goals: 0, completed: 0 }
      }));
    },
  });


  stats.refetch()


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
      <div className="p-7 flex ml-40 justify-center pointer-events-auto">
        <div className="w-full max-w-6xl bg-gradient-to-br from-stone-900/70 to-stone-900/80 rounded-3xl p-6 border border-stone-700/30 backdrop-blur-lg shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] text-stone-300">        {/* Header */}
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

            <div className="grid grid-cols-7 mt-4 text-sm text-stone-500">
              {dayNames.map((day) => (
                <div key={day} className="text-center">
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-[1px]">
            {stats?.data?.map((day, index) => (
              <div
                onClick={() => {
                  if (day.isCurrentMonth) {
                    setSelectedDay(day.label);
                    setIsModalOpen(true);
                  }
                }}
                key={index}
                className={`h-32 p-3 text-sm cursor-pointer transition-all duration-200 ease-out  flex flex-col
                ${day.isCurrentMonth
                    ? "bg-stone-700/40 text-stone-100 hover:bg-stone-600/50 hover:scale-[1.01] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_10px_30px_rgba(0,0,0,0.4)]"
                    : "bg-stone-800/30 text-stone-500"
                  }
              `}
              >
                <div className="flex justify-between items-start ">
                  <span>{day.label}</span>
                </div>

                {day.isCurrentMonth && (
                  <div className="mt-auto">
                    {day?.stats?.total_goals > 0 ? (
                      <div className="space-y-1">
                        {/* Stats text */}
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-stone-500">
                            {day.stats.completed}/{day.stats.total_goals}
                          </span>
                          <span className={`font-semibold ${day.stats.completed === day.stats.total_goals
                            ? 'text-stone-300'
                            : 'text-stone-400'
                            }`}>
                            {Math.round((day.stats.completed / day.stats.total_goals) * 100)}%
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full h-1.5 bg-stone-800/60 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-stone-500 to-stone-400 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.round((day.stats.completed / day.stats.total_goals) * 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-stone-600 italic">
                        No goals
                      </div>
                    )}
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