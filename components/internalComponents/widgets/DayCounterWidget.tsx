"use client"

import { useEffect, useState } from "react";
import { WidgetModal } from "./WidgetModal";
import DateSelection from "../DateSelection";
import { useAuth } from "@/contexts/authContext";

export const DayCounterWidget = () => {
    const { user, updateUserDetails } = useAuth();

    const [showModal, setShowModal] = useState(false)
    // const setDate = new Date(targetDate);
    const now = new Date();
    const [selectedDate, setSelectedDate] = useState<Date[]>([new Date()]); // array structure compatibility

    const handleDateToggle = (date: Date) => {
        setSelectedDate([date]);
        updateUserDetails({ target_date: date.toISOString() })
    };


    if (isNaN((new Date(selectedDate[0])).getTime())) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-800/20 to-stone-900/30 backdrop-blur-xl border border-stone-700/20 rounded-2xl">
                <div className="text-stone-500/80 font-pixelify text-sm">Invalid date</div>
            </div>
        );
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const elapsedDays = Math.floor(
        (now.getTime() - (new Date(selectedDate[0])).getTime()) / msPerDay
    );

    useEffect(() => {
        if (!user?.target_date) return
        setSelectedDate([new Date(user?.target_date)]);
    }, [user?.target_date])


    return (
        <div className="relative w-full h-full bg-gradient-to-br from-stone-800/20 to-stone-900/30 backdrop-blur-xl border border-stone-700/20 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-1/4 w-px h-full bg-stone-200 transform -skew-x-12" />
                <div className="absolute top-0 right-1/4 w-px h-full bg-stone-200 transform -skew-x-12" />
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute blur-3xl opacity-20 w-3/4 h-3/4 bg-gradient-to-br from-stone-600/30 to-stone-500/30 rounded-full" />
            </div>

            <div className="relative w-full h-full flex flex-row items-center justify-center p-3">
                <div className="relative  w-full">
                    <div
                        className={`relative pl-4 pr-14 text-[110px] font-extrabold italic font-pixelify h-32 ${elapsedDays === 0 ? "text-rose-800" : "text-stone-200"
                            }`}
                    >
                        {String(elapsedDays < 0 ? -1 * elapsedDays : elapsedDays).padStart(3, '0')}
                    </div>
                    {elapsedDays == 0 ?
                        <div className="relative  px-6 py-1.5 font-pixelify text-[clamp(8px,1.5vw,14px)] text-stone-300 italic tracking-wide ">
                            Welcome to the new world
                        </div>
                        :
                        <div className="relative  px-6 py-1.5 font-pixelify text-[clamp(8px,1.5vw,14px)] text-stone-300 italic tracking-wide ">
                            DAYS {elapsedDays > 0 ? 'SINCE' : 'UNTIL'} {(new Date(selectedDate[0])).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                        </div>
                    }
                </div>
                <div className="absolute top-4 right-4 w-6 h-6 opacity-5">
                    <div className="grid grid-cols-4 grid-rows-4 w-full h-full transform rotate-12 hover:opacity-45"
                        onClick={() => setShowModal(true)}

                    >
                        {[...Array(16)].map((_, i) => (
                            <div
                                key={i}
                                className={`${(Math.floor(i / 4) + i) % 2 === 0 ? 'bg-stone-100' : 'bg-stone-900'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <WidgetModal isOpen={showModal} onClose={() => setShowModal(false)} title={"Select Target Date"} hideFooter>
                <DateSelection
                    selectedDates={selectedDate}
                    onDateToggle={handleDateToggle}
                />
            </WidgetModal>
        </div>
    );
};