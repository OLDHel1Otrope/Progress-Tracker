"use client"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronUp, Minus, Plus } from "lucide-react"

export const GalaxyNavigator = ({ orbitControlsRef }: { orbitControlsRef: any }) => {
    //bind each key to perform its designed action
    return (
        <div className="relative z-50 h-[120px] w-[120px]">
            {/* Circular container */}
            <div className="absolute inset-0 rounded-full border border-stone-700/40 bg-gradient-to-br from-stone-800/30 to-stone-900/30 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl hover:bg-stone-700/10" />

            {/* Navigator grid */}
            <div className="relative grid h-full w-full grid-cols-[1fr_2fr_1fr] grid-rows-[1fr_2fr_1fr] gap-1 p-2">
                {/* Top */}
                <button className="col-start-2 row-start-1 flex items-center justify-center rounded-full hover:bg-stone-700/20 transition-colors"
                    onClick={() => orbitControlsRef.current?.moveUp()}>
                    <ChevronUp size={20} />
                </button>

                {/* Left */}
                <button className="col-start-1 row-start-2 flex items-center justify-center rounded-md hover:bg-stone-700/20 transition-colors"
                    onClick={() => orbitControlsRef.current?.moveLeft()}>
                    <ChevronLeft size={20} />
                </button>

                {/* Center 3x3 grid */}
                <div className="col-start-2 row-start-2 grid grid-cols-3 grid-rows-3 w-14 gap-0.5 rounded-full border border-stone-600/30 bg-stone-800/20 p-0.5">
                    <button className="col-start-2 row-start-1 flex items-center justify-center hover:bg-stone-700/30 rounded transition-colors"
                        onClick={() => orbitControlsRef.current?.zoomIn()}>
                        <Plus size={16} />
                    </button>
                    <button className="col-start-1 row-start-2 flex items-center justify-center hover:bg-stone-700/30 rounded transition-colors"
                        onClick={() => orbitControlsRef.current?.rotateLeft()}>
                        <ChevronsLeft size={16} />
                    </button>
                    <button className="col-start-3 row-start-2 flex items-center justify-center hover:bg-stone-700/30 rounded transition-colors"
                        onClick={() => orbitControlsRef.current?.rotateRight()}>
                        <ChevronsRight size={16} />
                    </button>
                    <button className="col-start-2 row-start-3 flex items-center justify-center hover:bg-stone-700/30 rounded transition-colors"
                        onClick={() => orbitControlsRef.current?.zoomOut()}>
                        <Minus size={16} />
                    </button>
                </div>

                {/* Right */}
                <button className="col-start-3 row-start-2 flex items-center justify-center rounded-md hover:bg-stone-700/20 transition-colors"
                    onClick={() => orbitControlsRef.current?.moveRight()}>
                    <ChevronRight size={20} />
                </button>

                {/* Bottom */}
                <button className="col-start-2 row-start-3 flex items-center justify-center rounded-md hover:bg-stone-700/20 transition-colors"
                    onClick={() => orbitControlsRef.current?.moveDown()}>
                    <ChevronDown size={20} />
                </button>
            </div>
        </div>
    )
}