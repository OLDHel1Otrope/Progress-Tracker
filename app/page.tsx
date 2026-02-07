"use client";
import PageContainer from "@/components/PageContainer";
import { useState } from "react";
import CalendarPage from "./calender/page";
import NotesPane from "@/components/NotesPane";
import TodayGoals from "@/components/internalComponents/TodayGoals";
import CenteredGrid from "@/components/internalComponents/CenterGrid";
import UserHeader from "@/components/internalComponents/UserHeader";
import { useAuth } from "@/contexts/authContext";

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
  const {loggedIn} = useAuth();
  const images = [
    "/img/i1.png",
    "/img/i2.png",
    "/img/ik.png",
    "/img/i4.png",
  ];
  

  return (
    <div className="h-full flex flex-col">
      {loggedIn && pages.map((p, i) => (
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
      <UserHeader />
      <div className="fixed bottom-4 right-4 text-stone-500 text-xs italic">
        {/* &copy; 2026 Progress Tracker */}
        Made with 💖
      </div>
      {!active && loggedIn && (
        <>
          {/* <div className="fixed top-4 right-4 text-stone-500 text-sm flex flex-row gap-2">
            <CircleUserRound />
            <span className="font-bold">
              Swapnil Singh
            </span>
          </div> */}
          <CenteredGrid images={images} />;
        </>
      )}

    </div>
  );
}
