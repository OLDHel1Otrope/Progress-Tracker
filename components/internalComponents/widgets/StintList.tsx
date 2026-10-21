"use client"

export type Assessment = 0 | 1 | 2 | 3;

export interface StintEntry {
    id: number;
    goal_id: string | null;
    start_at: number;    // epoch ms
    end_at: number;      // epoch ms
    duration: number;    // ms
    startH: number, startM: number,
    endH: number, endM: number,
    description: string;
    assessment: Assessment;
}

// ---- sample data: 6 stints for today ----
const today = (h: number, m: number) => {
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.getTime();
};

const stint = (
    id: number,
    startH: number, startM: number,
    endH: number, endM: number,
    description: string,
    goal_id: string | null,
    assessment: Assessment,
): StintEntry => {
    const start_at = today(startH, startM);
    const end_at = today(endH, endM);
    return { id, start_at, goal_id, end_at, duration: end_at - start_at, description, assessment, startH, startM, endH, endM };
};

export const TODAY_STINTS: StintEntry[] = [//api response
    stint(1, 8, 30, 9, 15, '', '', 1),
    stint(2, 9, 40, 10, 20, '', '', 0),
    stint(3, 11, 5, 12, 0, '', '', 1),
    stint(4, 14, 10, 14, 45, '', '', 0),
    stint(5, 16, 20, 17, 55, '', '', 3),
    stint(6, 18, 43, 19, 25, '', '', 0),
];

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


// const sectopercentage = ([h, m]: [h: number, m: number]) =>
//     ((h * 60 + m) / 1440) * 100;

// ---- the list: maps the data array into rows ----
const sectopercentage = ([h, m]: [number, number]) => ((h * 60 + m) / (24 * 60)) * 100;

const toPercent = (ms: number) => {
    const d = new Date(ms);
    return sectopercentage([d.getHours(), d.getMinutes()]);
};

export const StintList = ({ stints = TODAY_STINTS }: { stints?: StintEntry[] }) => {
    const sorted = [...stints].sort((a, b) => a.start_at - b.start_at);

    return (
        // no overflow-hidden here, or the tooltips get clipped
        <div className="relative w-full h-1">
            {sorted.map((entry, index) => {
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
                            className="absolute bottom-0 inset-x-0 h-[2px] rounded-none"
                            style={{ backgroundColor: DOT[entry.assessment] }}
                        />

                        {/* tooltip */}
                        <div
                            role="tooltip"
                            className="pointer-events-none absolute bottom-full left-1/2 mb-2 z-50 -translate-x-1/2 translate-y-1 opacity-0 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100"
                        >
                            <div className="relative flex items-center gap-2 whitespace-nowrap rounded-xl bg-stone-800 mr-1 p-1.5 text-[13px] text-stone-100 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                                <span className="tabular-nums">
                                    <span className="rounded-lg  px-1.5 py-0.5 font-semibold text-stone-800 mr-1" style={{ backgroundColor: DOT[entry.assessment] }}>
                                        {formatDuration(entry.duration)}
                                    </span>{' '}
                                    at{' '}
                                    <span className="text-stone-500" suppressHydrationWarning>{formatTime(entry.start_at)}</span>
                                </span>

                                {/* tail */}
                                <span className="absolute left-1/2 top-full -mt-1 h-2 w-2 -translate-x-1/2 rotate-45 rounded-[2px] bg-stone-800 mr-1" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


//  <div className="absolute inset-y-0 left-0  z-0 transition-[width] h-full duration-500  border-b-2 border-stone-300 rounded-2xl rounded-br-none" style={{ width: `3%`, left: '4%' }} />
//  i now realize that each stint must be associated with a goal, and later on you should get an option to rename the stint or goal, if thats the case then you should also be able to schedule stints
//  its a better  for user after completing a stint, for them to be able to select the goal from drop down and assign it,