"use client";
import { useState } from "react";
import { ChevronDown, Star, Circle, Sparkles, Menu, X, PlaneTakeoff } from "lucide-react";
import { useAuth } from "@/contexts/authContext";

export const dummySpaceData = {

    stars: [
        { id: "star-1", name: "Proxima Centauri", size: 0.154, temperature: 3042, luminosity: 0.0017 },
        { id: "star-2", name: "Sirius A", size: 1.711, temperature: 9940, luminosity: 25.4 },
        { id: "star-3", name: "Betelgeuse", size: 764.0, temperature: 3500, luminosity: 126000 },
        { id: "star-4", name: "Vega", size: 2.362, temperature: 9602, luminosity: 40.12 },
        { id: "star-5", name: "Rigel", size: 78.9, temperature: 12100, luminosity: 120000 },
    ],
    planets: [
        { id: "planet-1", name: "Kepler-452b", size: 1.63, mass: 5.0, orbitalPeriod: 385 },
        { id: "planet-2", name: "HD 189733 b", size: 1.138, mass: 1.13, orbitalPeriod: 2.2 },
        { id: "planet-3", name: "TRAPPIST-1e", size: 0.92, mass: 0.62, orbitalPeriod: 6.1 },
        { id: "planet-4", name: "Gliese 581c", size: 1.5, mass: 5.5, orbitalPeriod: 12.9 },
        { id: "planet-5", name: "Proxima b", size: 1.07, mass: 1.27, orbitalPeriod: 11.2 },
    ],
    comets: [
        { id: "comet-1", name: "Halley's Comet", size: 0.011, orbitalPeriod: 75.3, velocity: 70.56 },
        { id: "comet-2", name: "Hale-Bopp", size: 0.06, orbitalPeriod: 2533, velocity: 44.0 },
        { id: "comet-3", name: "Swift-Tuttle", size: 0.026, orbitalPeriod: 133.28, velocity: 60.0 },
    ],
};

export function GalaxyMenu() {
    const [open, setOpen] = useState(false);
    const { user } = useAuth();


    const allObjects = [
        ...dummySpaceData.stars.map((s) => ({ ...s, type: "star" as const })),
        ...dummySpaceData.planets.map((p) => ({ ...p, type: "planet" as const })),
        ...dummySpaceData.comets.map((c) => ({ ...c, type: "comet" as const })),
    ];

    return (
        <div className="fixed top-4 right-4 z-50 font-sans-serif">
            <div className="flex justify-end">
                <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-2 rounded-full border border-stone-700/40 bg-gradient-to-br from-stone-800/30 to-stone-900/30 px-4 py-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all hover:bg-stone-700/20"
                >
                    <span className="text-sm font-pixelify">{user?.name || "Your "}Galaxy</span>
                    {open ? <X size={16} /> : <Menu size={16} />}
                </button>
            </div>

            <div
                className={`mt-2 grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
            >
                <div className="overflow-hidden">
                    <div className="w-80 rounded-2xl border border-stone-700/40 bg-gradient-to-br from-stone-800/40 to-stone-900/40 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                        <div className="border-b border-stone-700/30 px-4 py-3">
                            <h3 className="text-sm font-semibold text-stone-200 font-pixelify">Celestial Objects</h3>
                            <p className="text-xs text-stone-400 mt-0.5 font-pixelify">{allObjects.length} objects discovered</p>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto p-2 gap-2 flex flex-col">
                            {allObjects.map((obj, i) => (
                                <CelestialCard key={obj.id} object={obj} index={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CelestialCard({
    object,
    index,
}: {
    object: any;
    index: number;
}) {
    const getIcon = () => {
        switch (object.type) {
            case "star":
                return <div
                    className=" w-8 h-8
       inset-1
      rounded-full
      bg-white
      shadow-[0_0_10px_rgba(255,255,255,0.8)]
    "
                />;
            case "planet":
                return <div
                    className=" w-8 h-8
       inset-1
      rounded-full
      bg-stone-500
      shadow-[0_0_1px_rgba(255,255,255,0.8)]
    "
                />;
            case "comet":
                return <div className="w-10 h-2 rounded-full bg-gradient-to-l from-stone-500 to-stone-500/0 
                flex flex-row transform -rotate-[32deg]">
                    <div className="h-2 w-3 ml-auto rounded-full bg-gradient-to-r from-stone-500 to-stone-200/60" />
                </div>
                    ;
        }
    };

    const getTypeColor = () => {
        switch (object.type) {
            case "star":
                return "bg-stone-500/10 text-stone-400 border-stone-500/20";
            case "planet":
                return "bg-stone-600/10 text-stone-400 border-stone-600/20";
            case "comet":
                return "bg-stone-700/10 text-stone-400 border-stone-700/20";
        }
    };

    return (
        <button
            className="group w-full rounded-xl border border-stone-700/30 shadow-[inset_0_0_10px_rgba(0,0,0,0.4)] bg-stone-800/20 text-left transition-all hover:border-stone-600/50 hover:bg-stone-700/30 hover:shadow-lg"
            style={{
                animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
            }}
        >
            <div className="flex items-start gap-4 h-14">
                <div className="h-full w-16 bg-stone-800 shadow-[inset_0_0_10px_rgba(0,0,0,0.4)] rounded-l-xl flex-shrink-0  flex-row flex items-center justify-center">{getIcon()}</div>

                <div className=" min-w-0 w-full justify-between flex flex-col py-2 pr-4">
                    <div className="flex flex-row justify-between gap-2 ">
                        <h4 className="text-sm font-medium text-stone-100 truncate font-pixelify ">{object.name}</h4>
                        <span
                            className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-pixelify uppercase tracking-wide ${getTypeColor()}`}
                        >
                            {object.type[0]}
                        </span>
                    </div>

                    <div className="flex gap-3 text-[10px] text-stone-400 font-pixelify">
                        <span>Size: {object.size.toFixed(3)}</span>
                        {object.temperature && <span>Temp: {object.temperature}K</span>}
                        {object.mass && <span>Mass: {object.mass}M⊕</span>}
                        {object.velocity && <span>Vel: {object.velocity}km/s</span>}
                    </div>
                </div>
            </div>
        </button>
    );
}
