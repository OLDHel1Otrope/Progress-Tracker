"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, Codesandbox } from "lucide-react";
import { GalaxyNavigator } from "./GlaxyNavigator";
import * as THREE from "three";
import { UnplacedItem } from "@/lib/sampleGalaxyData";

type Item = {
    id?: string;
    size?: number;
};

export default function PlacementDock({
    stars,
    planets,
    setUnplacedItem,
    confirmPlacement,
    unplacedItem,
    newStarPosition,
    orbitControlsRef
}: {
    stars: Item[];
    planets: Item[];
    setUnplacedItem: (item: UnplacedItem) => void;
    confirmPlacement: () => void;
    unplacedItem: UnplacedItem | null;
    newStarPosition: number[];
    orbitControlsRef: any
}) {
    const [open, setOpen] = useState(false);

    const allItems = [
        ...stars.map((s, i) => ({ ...s, type: "star" as const, title: `Star #${i + 1}` })),
        ...planets.map((p, i) => ({ ...p, type: "planet" as const, title: `Planet #${i + 1}` })),
    ];

    return (
        <div className="fixed bottom-5 right-5 z-50 w-80 text-stone-300 gap-3 flex flex-col transition-all duration-200 font-pixelify">
            <div className="flex flex-row justify-end">
                <GalaxyNavigator orbitControlsRef={orbitControlsRef}/>
            </div>

            <div className="bg-gradient-to-br from-stone-900/10 to-stone-900/30 backdrop-blur-xl border border-stone-700/40 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden">
                <button
                    onClick={() => setOpen(!open)}
                    className="w-full flex items-center justify-between px-4 py-3 cursor-pointer bg-stone-800/40 hover:bg-stone-700/10 transition-colors"
                >
                    <h3 className="text-sm font-semibold tracking-wide">
                        Inventory
                    </h3>
                    {/* <div className="mr-auto pl-1 flex items-center gap-1">
                        <Codesandbox size={16}/>
                    </div> */}
                    {open ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>

                <div
                    className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                >
                    <div className="overflow-hidden">
                        <div className="max-h-64 overflow-y-auto p-2 gap-2 flex flex-col">
                            {allItems.length === 0 ? (
                                <EmptyState text="No items in inventory" />
                            ) : (
                                allItems.map((item, i) => (
                                    <ItemCard
                                        key={i}
                                        title={item.title}
                                        size={item.size}
                                        type={item.type}
                                        index={i}
                                        isPlacing={unplacedItem?.details?.id == item.id}
                                        confirmPlacement={confirmPlacement}
                                        newStarPosition={newStarPosition}
                                        setPlacing={() => {
                                            if (item.type === "star") {
                                                setUnplacedItem({ type: "star", details: item });
                                            } else {
                                                // setPlacingPlanet(item);
                                            }
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ItemCard({
    title,
    size,
    type,
    index,
    setPlacing,
    isPlacing,
    confirmPlacement,
    newStarPosition
}: {
    title: string;
    size?: number;
    type: "star" | "planet";
    index: number;
    isPlacing: boolean;
    confirmPlacement: () => void;
    setPlacing?: () => void;
    newStarPosition?: number[];
}) {
    const getIcon = () => {
        if (type === "star") {
            return (
                <div className="w-8 h-8 inset-1 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            );
        } else {
            return (
                <div className="w-8 h-8 inset-1 rounded-full bg-stone-500 shadow-[0_0_1px_rgba(255,255,255,0.8)]" />
            );
        }
    };

    const getTypeColor = () => {
        return type === "star"
            ? "bg-stone-500/10 text-stone-400 border-stone-500/20"
            : "bg-stone-600/10 text-stone-400 border-stone-600/20";
    };

    return (
        <div
            className={`group w-full rounded-xl border shadow-[inset_0_0_10px_rgba(0,0,0,0.4)] bg-stone-800/20 text-left transition-all ${isPlacing
                    ? "border-stone-500/50 bg-stone-700/40 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    : "border-stone-700/30 hover:border-stone-600/50 hover:bg-stone-700/30 hover:shadow-lg"
                }`}
            style={{
                animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
            }}
        >
            <button
                onClick={isPlacing ? undefined : setPlacing}
                className="w-full"
                disabled={isPlacing}
            >
                <div className="flex items-center gap-4 h-14 border rounded-xl border-stone-600/20">
                    <div className="h-full w-16 bg-stone-800 shadow-[inset_0_0_10px_rgba(0,0,0,0.4)] rounded-l-xl flex-shrink-0 flex items-center justify-center">
                        {getIcon()}
                    </div>

                    <div className="min-w-0 w-full justify-between flex flex-col py-2 pr-4">
                        <div className="flex flex-row justify-between gap-2">
                            <h4 className="text-sm font-medium text-stone-100 truncate">
                                {title}
                            </h4>
                            <span
                                className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${getTypeColor()}`}
                            >
                                {type[0]}
                            </span>
                        </div>

                        {size && (
                            <div className="flex flex-row text-[10px] text-stone-400">
                                Size: {size.toFixed(3)}
                            </div>
                        )}
                    </div>
                </div>
            </button>

            <div
                className={`grid transition-all duration-300 ease-in-out ${isPlacing ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
                    }`}
            >
                <div className="overflow-hidden">
                    <div className="px-4 pb-3 pt-1   space-y-2">
                        {/* Position display */}
                        <div className="grid grid-cols-3 gap-2 text-[10px]">
                            <div className="bg-stone-800/50 rounded-md px-2 py-1.5 shadow-[inset_0_0_5px_rgba(0,0,0,0.3)]">
                                <div className="text-stone-500 uppercase">X</div>
                                <div className="text-stone-300 font-medium">
                                    {newStarPosition?.[0]?.toFixed(2) ?? "0.00"}
                                </div>
                            </div>
                            <div className="bg-stone-800/50 rounded-md px-2 py-1.5 shadow-[inset_0_0_5px_rgba(0,0,0,0.3)]">
                                <div className="text-stone-500 uppercase">Y</div>
                                <div className="text-stone-300 font-medium">
                                    {newStarPosition?.[1]?.toFixed(2) ?? "0.00"}
                                </div>
                            </div>
                            <div className="bg-stone-800/50 rounded-md px-2 py-1.5 shadow-[inset_0_0_5px_rgba(0,0,0,0.3)]">
                                <div className="text-stone-500 uppercase">Z</div>
                                <div className="text-stone-300 font-medium">
                                    {newStarPosition?.[2]?.toFixed(2) ?? "0.00"}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={confirmPlacement}
                            className="w-full bg-stone-700/50 hover:bg-stone-600/60 border border-stone-600/40 rounded-lg px-3 py-2 text-[11px] uppercase tracking-wide transition-all shadow-[inset_0_0_10px_rgba(0,0,0,0.2)] hover:shadow-[inset_0_0_15px_rgba(0,0,0,0.3)]"
                        >
                            Confirm Placement
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="py-6 text-center text-xs text-stone-500 italic">
            {text}
        </div>
    );
}