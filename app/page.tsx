"use client";
import PageContainer from "@/components/PageContainer";
import { Calendar } from "lucide-react";
import { useState } from "react";
import CalendarPage from "./calender/page";
import { title } from "process";
import NotesPane from "@/components/NotesPane";
import { sampleGoals } from "@/components/internalComponents/DayModal";
import GoalItem from "@/components/internalComponents/GoalItem";
import TodayGoals from "@/components/internalComponents/TodayGoals";

const prevP = [
  { title: "Today", color: "#2a2a2af1" },
  { title: "Calendar", color: "#242424f1" },
  { title: "Goals", color: "#1f1f1ff1" },
  { title: "Statistics", color: "#191919f1" },
  { title: "Settings", color: "#121212f1" },
  { title: "Notes", color: "#101010f1" },
];

const pages = prevP.map((p, i) => ({ ...p, color: prevP[prevP.length - 1 - i].color }));


export default function Home() {
  const [active, setActive] = useState<string | null>("Today");

  return (
    <div className="h-full flex flex-col">
      {pages.map((p, i) => (
        <PageContainer
          key={p.title}
          title={p.title}
          index={i}
          color={p.color}
          isActive={active === p.title}
          onToggle={() =>
            setActive(active === p.title ? null : p.title)
          }
        >
          <>
            {p.title === "Calendar" && <CalendarPage />}

            {p.title === "Today" && (
              <div className="flex-1 min-h-0 h-full overflow-y-auto">

                {/* Center wrapper */}
                <div className="min-h-full flex items-center justify-center p-4">
                  <TodayGoals />
                </div>

              </div>
            )}



            {p.title == "Notes" && (
              <div className="p-7 flex flex-row justify-center min-h-0 h-full flex-1">
                <NotesPane />
              </div>
            )}
            {/* {p.title==="Calendar"} */}
          </>
        </PageContainer>
      ))}
      {!active && (
        <div className="flex-1 h-full flex flex-col items-center justify-center gap-4">
          <span className="text-stone-300 font-medium">Welcome</span>
        </div>
      )}
      <div className="fixed bottom-4 right-4 text-stone-500 text-sm">
        &copy; 2026 Progress Tracker
      </div>
    </div>
  );
}
