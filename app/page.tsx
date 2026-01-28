"use client";
import PageContainer from "@/components/PageContainer";
import { Calendar } from "lucide-react";
import { useState } from "react";
import CalendarPage from "./calender/page";
import { title } from "process";

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
  const [active, setActive] = useState<string | null>("Calendar");

  return (
    <div>
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
              <div className="flex flex-col items-center justify-center h-full text-stone-400">
                <Calendar size={64} className="mb-4" />
                <h2 className="text-2xl font-semibold">Today's Overview</h2>
                <p className="mt-2">Your tasks and goals for today will appear here.</p>
              </div>
            )}
          </>
        </PageContainer>
      ))}
      <div className="fixed bottom-4 right-4 text-stone-500 text-sm">
        &copy; 2026 Progress Tracker
      </div>
    </div>
  );
}
