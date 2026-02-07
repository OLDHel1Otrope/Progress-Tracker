"use client"

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Minus, Plus, RotateCcw, RotateCw } from "lucide-react"

export const GalaxyNavigator = () => {
    return (
        <div className="  z-50 
                w-[70px] h-[70px] rounded-full  backdrop-blur-xl
        border border-stone-700/40
         bg-gradient-to-br from-stone-800/30 to-stone-900/30
                 shadow-[0_10px_40px_rgba(0,0,0,0.6)]
                             hover:bg-stone-700/10
                grid grid-cols-3 grid-rows-3 gap-0">
            <div className=" col-start-2 row-start-1 rounded-sm flex items-center justify-center" ><ChevronUp /></div>
            <div className=" col-start-1 row-start-2  rounded-sm flex items-center justify-center" ><ChevronLeft /></div>
            <div className=" col-start-2 row-start-2 grid grid-cols-3 grid-rows-3 flex items-center justify-center" ></div>
            <div className=" col-start-3 row-start-2  rounded-sm flex items-center justify-center" ><ChevronRight /></div>
            <div className=" col-start-2 row-start-3  rounded-sm flex items-center justify-center" ><ChevronDown /></div>
        </div>

    )
}

function NavButton({
    children,
    small = false,
}: {
    children: React.ReactNode;
    small?: boolean;
}) {
    return (
        <button
            className={`
        flex items-center justify-center
        rounded-md
        transition
        hover:bg-stone-600/40
        active:scale-95
        ${small ? "w-6 h-6" : "w-8 h-8"}
      `}
        >
            {children}
        </button>
    );
}