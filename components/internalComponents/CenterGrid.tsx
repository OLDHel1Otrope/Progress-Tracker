"use client";

import { ChevronsRight, Cross, PlusIcon, Snail, Soup } from "lucide-react";
import Image from "next/image";
import { DayCounterWidget } from "./widgets/DayCounterWidget";
import { PomodoroTimer } from "./widgets/PomodoroCounter";
import TodayGoals from "./TodayGoals";
import { StatsDisplay } from "./widgets/StatsDisplay";

interface CenteredGridProps {
    images: string[];
}

export default function CenteredGrid({ images }: CenteredGridProps) {
    return (
        <div
            className="
        h-full
        w-full
        flex
        items-center
        justify-center
        bg-stone-1000
        pt-12
        sm:pt-5
      "
        >
            <div
                className={`
                flex flex-col
                gap-6
                place-items-center
                max-w-7xl
                p-6
                `}
            //   sm:grid
            //   sm:grid-cols-3
            >

                <div
                    key="today" className="row-span-2 col-span-2 border rounded-xl border-stone-900 h-full"
                >
                    <TodayGoals home />
                </div>
                <div
                    key="day-counter" className="w-full h-full row-span-1 col-span-1 "
                >
                    <DayCounterWidget targetDate={"2025-12-06T06:15:23.123Z"} toFrom={true} />
                </div>



                {/* <div
                    key={"t"}
                    className="
              w-80
              h-48
              rounded-xl
              overflow-hidden
              bg-stone-900/30
              hover:scale-105
              hover:bg-stone-700/50
              transition-transform
              border border-stone-700/30 backdrop-blur-lg shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]
              flex flex-row items-center justify-center
            "
                >
                    <ChevronsRight size={90} strokeWidth={1.5} />
                    <Snail size={90} strokeWidth={1.5} />
                </div>

                <div
                    key={"s"}
                    className="
              w-80
              h-48
              rounded-xl
              overflow-hidden
              bg-stone-900/30
              hover:scale-105
              hover:bg-stone-700/50
              transition-transform
              border border-stone-700/30 backdrop-blur-lg shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]
              flex flex-col items-center justify-center
            "
                >
                    <Soup size={116} strokeWidth={1.5} />
                </div>  */}
                <div
                    key="countdown" className="col-span-1 w-full h-full"
                >
                    <PomodoroTimer />
                </div>
                <div
                    key="stats" className="w-full h-full row-span-1 col-span-1 "
                >
                    <StatsDisplay/>
                </div>

                {/* {images.map((src, index) => (
                    <div
                        key={index}
                        className="
                                        relative
                                        w-full
                                        h-48
                                        rounded-xl
                                        bg-stone-800/30
                                        shadow-lg
                                        hover:scale-105
                                        transition-transform
                                        border border-stone-700/30
                                        backdrop-blur-lg
                                        overflow-hidden
                                    "
                    >
                        <Image
                            src={src}
                            alt={`Image ${index}`}
                            fill
                            className="object-cover"
                        />

                        <div
                            className="
                                pointer-events-none
                                absolute inset-0
                                rounded-none
                                shadow-[inset_0_0_20px_rgba(0,0,0,0.7)]
                                "
                        />
                    </div>

                ))} */}



                {/* <div
                    key={"tk"}
                    className="
              w-80
              h-48
              rounded-xl
              overflow-hidden
              bg-stone-900/30
              hover:scale-105
              hover:bg-stone-700/50
              transition-transform
              border border-stone-700/30 backdrop-blur-lg shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]
              flex flex-row items-center justify-center
            "
                >
                    <PlusIcon size={90} strokeWidth={1.5} />
                </div> */}

            </div>
        </div>
    )
}
