"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Star, Circle } from "lucide-react";
import { GalaxyNavigator } from "./GlaxyNavigator";

type Item = {
    id?: string;
    size?: number;
};

export default function PlacementDock({
    stars,
    setPlacingStar,
    planets,
    setPlacingPlanet,
}: {
    stars: Item[];
    setPlacingStar: (star: Item | null) => void;
    planets: Item[];
    setPlacingPlanet: (planet: Item | null) => void;
}) {
    const [open, setOpen] = useState(true);
    const [tab, setTab] = useState<"stars" | "planets">("stars");

    return (
        <div className=" fixed bottom-5 right-5 z-50 w-72 text-stone-300 gap-3 flex flex-col">
            <div className="flex flex-row justify-end">
                <GalaxyNavigator />
            </div>
            <div
                className="
        bg-gradient-to-br from-stone-900/10 to-stone-900/30
        backdrop-blur-xl
        border border-stone-700/40
        rounded-2xl
        shadow-[0_10px_40px_rgba(0,0,0,0.6)]
        overflow-hidden
      "
            >
                {/* Header */}
                <div
                    onClick={() => setOpen(!open)}
                    className="
            flex items-center justify-between
            px-4 py-3
            cursor-pointer
            bg-stone-800/40
            hover:bg-stone-700/10
            transition
          "
                >
                    <h3 className="text-sm font-semibold tracking-wide">
                        Inventory
                    </h3>

                    {open ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </div>

                {open && (
                    <>
                        <div className="max-h-64 overflow-y-auto p-2 space-y-2">
                            {/* tab === "stars" && */}
                            {stars.map((s, i) => (
                                <ItemCard
                                    key={i}
                                    title={`Star #${i + 1}`}
                                    size={s.size}
                                    setPlacing={() => setPlacingStar(s)}
                                />
                            ))}


                            {planets.map((p, i) => (
                                <ItemCard
                                    key={i}
                                    title={`Planet #${i + 1}`}
                                    size={p.size}
                                    setPlacing={() => setPlacingPlanet(p)}
                                />
                            ))}

                        </div>
                    </>
                )}
            </div>
        </div>
    );
}


function ItemCard({
    title,
    size,
    setPlacing,
}: {
    title: string;
    size?: number;
    setPlacing?: () => void;
}) {
    return (
        <div
            className="
        flex flex-row items-center gap-4
        p-3 rounded-xl
        bg-stone-800/40
        border border-stone-700/30
        hover:border-stone-500/40
        hover:bg-stone-700/40
        transition
      "
        >
            <div className="relative w-8 h-8">
                {/* Glow */}
                <div
                    className="
      absolute inset-0
      rounded-full
      bg-white/40
      blur-md
    "
                />

                {/* Core */}
                <div
                    className="
      absolute inset-1
      rounded-full
      bg-white
      shadow-[0_0_10px_rgba(255,255,255,0.8)]
    "
                />
            </div>


            <div>
                <p className="text-sm font-medium">{title}</p>

                {size && (
                    <p className="text-xs text-stone-500">
                        Size: {size.toFixed(3)}
                    </p>
                )}
            </div>

            <button
                className="
                ml-auto
          text-xs px-3 py-1.5 rounded-md
          bg-stone-700/50
          hover:bg-stone-600/60
          border border-stone-600/40
          transition
        "
                onClick={setPlacing}
            >
                Place
            </button>
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
