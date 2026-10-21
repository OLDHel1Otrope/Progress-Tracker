"use client"

export type Assessment = 0 | 1 | 2 | 3;

export interface StintEntry {
    id: string;
    goal_id: string | null;
    start_at: string;    // epoch ms
    end_at: string;      // epoch ms
    duration: number;    // ms
    startH: number, startM: number,
    endH: number, endM: number,
    description: string;
    assessment: Assessment;
    minutes?: number
}

const DOT: Record<Assessment, string> = {
    0: '#78716cd0',
    1: '#22c55ed0',
    2: '#8b5cf6d0',
    3: '#f22fb5d0',
};

// ---- formatting ----
const formatDuration = (ms: number) => {
    const totalMin = Math.round(ms / 60000);
    if (totalMin < 60) return `${totalMin} min`;
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')} min`;
};

const formatTime = (ms: number) =>
    new Date(ms)
        .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        .toLowerCase(); // "6:43 pm"

// ---- the list: maps the data array into rows ----
const sectopercentage = ([h, m]: [number, number]) => ((h * 60 + m) / (24 * 60)) * 100;

const toPercent = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return sectopercentage([h, m]);
};

function minutesBetween(older: Date | number, newer: Date | number): number {
    const olderMs = typeof older === "number" ? older : older.getTime();
    const newerMs = typeof newer === "number" ? newer : newer.getTime();

    return (newerMs - olderMs) / 60000;
}


export const StintList = ({ stints, loading, isRunning, currentId }: { stints?: StintEntry[], loading: boolean, isRunning: boolean, currentId: string }) => {

    return (
        // no overflow-hidden here, or the tooltips get clipped
        <div className="relative w-full h-1">
            {loading ? null : stints?.map((entry, index) => {
                const start = toPercent(entry.start_at);
                const end = toPercent(entry.end_at);

                return (
                    // taller hover area than the 2px line so it is easy to hit
                    <div
                        key={entry.id}
                        className="group absolute bottom-0 h-4"
                        style={{ left: `${start}%`, width: `${end - start}%` }}
                    >
                        <div
                            className={`absolute bottom-0 inset-x-0 h-[2px] rounded-none ${entry.id === currentId && isRunning
                                    ? "bg-red-500"
                                    : "bg-stone-500"
                                }`}
                        />

                        {/* tooltip */}
                        <div
                            role="tooltip"
                            className="pointer-events-none absolute bottom-full left-1/2 mb-0 z-50 -translate-x-1/2 translate-y-1 opacity-0 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100"
                        >
                            <div className="relative flex items-center gap-2 whitespace-nowrap rounded-xl bg-stone-800 mr-1 p-1.5 text-[10px] text-stone-100 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                                <span className="tabular-nums">
                                    <span className="rounded-lg  px-1.5 py-0.5 font-xs text-stone-600 mr-1 bg-stone-100"
                                    >
                                        {entry.minutes} mins
                                    </span>{' '}
                                    at{' '}
                                    <span className="text-stone-600" suppressHydrationWarning>{entry.start_at}</span>
                                </span>

                                {/* tail */}
                                <span className="absolute left-1/2 top-full -mt-1 h-2 w-2 -translate-x-1/2 rotate-45 rounded-[2px] bg-stone-800 mr-1" />
                            </div>
                        </div>
                    </div>
                );
            })}
            {isRunning &&
                <div
                    className=" absolute bottom-0 h-4 z-100"
                    style={{ left: `${((minutesBetween(new Date(new Date().setHours(0, 0, 0, 0)).getTime(), Date.now()) / (24 * 60)) * 100)-0.1}%`, width: `2px` }}
                >
                    <div
                        className="absolute bottom-0 inset-x-0 h-[2px] z-100 rounded-full bg-rose-500 animate-pulse"
                    />
                </div>
            }
        </div>
    );
};


//  <div className="absolute inset-y-0 left-0  z-0 transition-[width] h-full duration-500  border-b-2 border-stone-300 rounded-2xl rounded-br-none" style={{ width: `3%`, left: '4%' }} />
//  i now realize that each stint must be associated with a goal, and later on you should get an option to rename the stint or goal, if thats the case then you should also be able to schedule stints
//  its a better  for user after completing a stint, for them to be able to select the goal from drop down and assign it,