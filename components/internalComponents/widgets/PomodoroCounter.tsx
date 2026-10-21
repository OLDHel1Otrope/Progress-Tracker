"use client"
import { useEffect, useRef, useState } from 'react';
import { StintEntry, StintList } from './StintList';
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteStrint, getTodayStrints, startStrint, traceAwake, updateStrint } from '@/lib/api/strints';
import { useHeartbeat } from '@/hooks/useHeartBeat';

type Status = 'idle' | 'running' | 'paused' | 'done';
type Mode = 'pomodoro' | 'stint';

interface Pomo {
    total: number;
    remaining: number;
    endAt: number | null;
    status: Status;
}

interface Stint {
    elapsed: number;
    startAt: number | null;
    status: Status;
}

const DEFAULT_TOTAL = 25 * 60 * 1000;

const pad = (n: number) => String(n).padStart(2, '0');
const clock = (ms: number) => `${pad(Math.floor(ms / 60000))}:${pad(Math.floor((ms % 60000) / 1000))}`;

export const PomodoroTimer = () => {
    const queryClient = useQueryClient();
    const [dayElapsedPercentage, setDayElapsedPercentage] = useState(0);

    const [view, setView] = useState<Mode>('stint');
    const [pomo, setPomo] = useState<Pomo>({
        total: DEFAULT_TOTAL,
        remaining: DEFAULT_TOTAL,
        endAt: null,
        status: 'idle',
    });
    const [stint, setStint] = useState<Stint>({ elapsed: 0, startAt: null, status: 'idle' });

    const [now, setNow] = useState(() => Date.now());
    const [isEditing, setIsEditing] = useState(false);
    const [minutesInput, setMinutesInput] = useState('25');
    const [secondsInput, setSecondsInput] = useState('00');

    const audioRef = useRef<AudioContext | null>(null);
    const originalTitle = useRef<string>('');

    const pomoRunning = pomo.status === 'running';
    const stintRunning = stint.status === 'running';

    const pomoMs = pomoRunning && pomo.endAt !== null
        ? Math.max(0, pomo.endAt - now)
        : pomo.remaining;
    const stintMs = stintRunning && stint.startAt !== null
        ? Math.max(0, now - stint.startAt)
        : stint.elapsed;


    const todayStrintData = useQuery({
        queryKey: ["todayStrints"],
        queryFn: () => getTodayStrints(),
    });

    const addStrintMutation = useMutation({
        mutationFn: startStrint,

        onSuccess: () => {

        },
    });

    const pingStrintMutation = useMutation({
        mutationFn: (sid: string) => traceAwake(sid),

        onSuccess: () => {

        },
    });

    const editStrintMutation = useMutation({
        mutationFn: (s: StintEntry) => updateStrint(s),

        onSuccess: () => {

        },
    });

    const deleteStrintMutation = useMutation({
        mutationFn: (sid: string) => deleteStrint(sid),

        onSuccess: () => {

        },
    });



    useEffect(() => {
        if (!pomoRunning && !stintRunning) return;
        const id = setInterval(() => setNow(Date.now()), 33);
        return () => clearInterval(id);
    }, [pomoRunning, stintRunning]);

    useEffect(() => {
        if (pomo.status === 'running' && pomo.endAt !== null && now >= pomo.endAt) {
            setPomo(p => ({ ...p, remaining: 0, endAt: null, status: 'done' }));
            beep(audioRef.current);
        }
    }, [now, pomo.status, pomo.endAt]);

    useEffect(() => {
        originalTitle.current = document.title;
        return () => {
            document.title = originalTitle.current;
        };
    }, []);

    const viewedRunning = view === 'pomodoro' ? pomoRunning : stintRunning;
    let titleText: string | null = null;
    if (viewedRunning) {
        titleText = clock(view === 'pomodoro' ? pomoMs : stintMs);
    } else if (pomoRunning) {
        titleText = clock(pomoMs);
    } else if (stintRunning) {
        titleText = clock(stintMs);
    }

    useEffect(() => {
        document.title = titleText ?? originalTitle.current;
    }, [titleText]);

    useEffect(() => {
        function calculateDayProgress() {
            const now = new Date();

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(24, 0, 0, 0);

            const progress =
                (now.getTime() - startOfDay.getTime()) /
                (endOfDay.getTime() - startOfDay.getTime());

            setDayElapsedPercentage(progress * 100);
        }

        calculateDayProgress();

        const interval = setInterval(calculateDayProgress, 60000);

        return () => clearInterval(interval);
    }, []);

    // ---- helpers ----
    const unlockAudio = () => {
        if (!audioRef.current && typeof window !== 'undefined') {
            const Ctx = window.AudioContext || (window as any).webkitAudioContext;
            if (Ctx) audioRef.current = new Ctx();
        }
        audioRef.current?.resume?.();
    };

    const startPomo = (total: number) => {
        const t = Date.now();
        setNow(t);
        setPomo({ total, remaining: total, endAt: t + total, status: 'running' });
    };

    const pausePomo = () => {
        setPomo(p => ({
            ...p,
            remaining: Math.max(0, (p.endAt ?? Date.now()) - Date.now()),
            endAt: null,
            status: 'paused',
        }));
    };


    const startPromiseRef = useRef<Promise<{ id: string }> | null>(null);

    const beginStint = () => {
        const t = Date.now();
        setNow(t);
        setStint({ elapsed: 0, startAt: t, status: 'running' });

        const p = addStrintMutation.mutateAsync();
        startPromiseRef.current = p;

        p.catch(() => {
            setStint({ elapsed: 0, startAt: null, status: 'idle' });
            startPromiseRef.current = null;
        });
    };

    const stopStint = async () => {
        const elapsed = Math.max(0, Date.now() - (stint.startAt ?? Date.now()));
        setStint({ elapsed: 0, startAt: null, status: 'idle' });

        try {
            const row = await startPromiseRef.current;
            if (row) await pingStrintMutation.mutateAsync(String(row.id));
            queryClient.invalidateQueries({
                queryKey: ["todayStrints"],
            });
        } finally {
            startPromiseRef.current = null;
        }
    };


    const handleStart = () => {
        unlockAudio();

        if (view === 'pomodoro') {
            if (isEditing) {
                const m = Math.min(99, parseInt(minutesInput, 10) || 0);
                const s = Math.min(59, parseInt(secondsInput, 10) || 0);
                const total = m * 60000 + s * 1000;
                if (total === 0) return;
                setIsEditing(false);
                startPomo(total);
                return;
            }

            if (pomo.status === 'running') {
                pausePomo();
            } else if (pomo.status === 'done') {
                startPomo(pomo.total);
            } else {
                const t = Date.now();
                setNow(t);
                setPomo(p => ({ ...p, endAt: t + p.remaining, status: 'running' }));
            }
            return;
        }

        // stint
        if (stint.status === 'running') stopStint();
        else beginStint();

    };

    // const handleReset = () => {
    //     if (view === 'pomodoro') {
    //         setPomo(p => ({ ...p, remaining: p.total, endAt: null, status: 'idle' }));
    //     } else {
    //         setStint({ elapsed: 0, startAt: null, status: 'idle' });
    //     }
    // };

    console.log({stint})

    const handleReset = () => {
        if (view === 'pomodoro') {
            setPomo(p => ({ ...p, remaining: p.total, endAt: null, status: 'idle' }));
        } else if (stint.status === 'running') {
            stopStint();
        } else {
            setStint({ elapsed: 0, startAt: null, status: 'idle' });
        }
    };

    const handleEdit = () => {
        if (pomo.status === 'running') pausePomo();
        const base = pomo.status === 'done' ? pomo.total : pomoMs;
        setMinutesInput(String(Math.floor(base / 60000)));
        setSecondsInput(pad(Math.floor((base % 60000) / 1000)));
        setIsEditing(true);
    };

    const handleCancelEdit = () => setIsEditing(false);

    const switchView = (next: Mode) => {
        setIsEditing(false);
        setView(next);
    };

    const onDigits = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value.replace(/\D/g, '').slice(0, 2));
    };

    const onInputKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleStart();
        if (e.key === 'Escape') handleCancelEdit();
    };

    // ---- what's on screen ----
    const status = view === 'pomodoro' ? pomo.status : stint.status;
    const displayMs = view === 'pomodoro' ? pomoMs : stintMs;
    const displayMinutes = Math.floor(displayMs / 60000);
    const displaySeconds = Math.floor((displayMs % 60000) / 1000);
    const displayCs = Math.floor((displayMs % 1000) / 10);

    const progress =
        pomo.total > 0
            ? Math.min(100, Math.max(0, (pomoMs / pomo.total) * 100))
            : 0;

    const editTotal = (Math.min(99, parseInt(minutesInput, 10) || 0) * 60 + Math.min(59, parseInt(secondsInput, 10) || 0));
    const startDisabled = isEditing && editTotal === 0;

    const startLabel = isEditing
        ? 'START'
        : status === 'running'
            ? 'PAUSE'
            : status === 'paused'
                ? 'RESUME'
                : status === 'done'
                    ? 'RESTART'
                    : 'START';

    const other = view === 'pomodoro'
        ? { mode: 'stint' as Mode, name: 'STINT', status: stint.status, ms: stintMs }
        : { mode: 'pomodoro' as Mode, name: 'POMODORO', status: pomo.status, ms: pomoMs };
    const otherVisible = other.status !== 'idle';

    const btn = 'hover:text-rose-700 italic transition-colors duration-200 disabled:opacity-30 disabled:hover:text-stone-300';


    useHeartbeat(
        () => {
            const id = addStrintMutation.data?.id;
            if (id != null) pingStrintMutation.mutate(String(id));
        },
        stint.status === 'running' && addStrintMutation.data?.id != null
    );


    return (
        <div className=' relative rounded-2xl border border-stone-700/30 pb-[2px] pt-[2px]'>
            <div
                className=" group/day absolute inset-y-0 left-0  z-0 transition-[width] h-full duration-500  border-t-2 border-stone-700 rounded-2xl rounded-tr-none"
                style={{ width: `${dayElapsedPercentage}%` }}
            >
                <NowTooltip totalMin={todayStrintData?.data?.stints.reduce((sum: number, stint: StintEntry) => sum += stint?.minutes || 0, 0) || 0} />
            </div>


            <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)] ">
                <div className="absolute inset-0">
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-stone-800/20 to-stone-900/30 transition-all duration-100 ease-linear"
                        style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
                    />
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-stone-700/10 to-stone-800/70 transition-all duration-100 ease-linear"
                        style={{
                            clipPath: `inset(0 0 0 ${progress}%)`,
                            boxShadow: 'inset 0 0 40px rgba(168, 162, 158, 0.1)',
                        }}
                    />
                    <div
                        className="absolute inset-y-0 w-1 bg-gradient-to-b from-transparent via-stone-700/40 to-transparent transition-all duration-100 ease-linear"
                        style={{ left: `${progress}%`, filter: 'blur(2px)' }}
                    />
                </div>

                {Array.from({ length: 24 }).map((_, i) => {
                    const leftPosition = (i / 24) * 100;

                    // Every 6 hours (index 0, 6, 12, 18), make the background darker
                    const bgClass = i % 6 === 0 ? "bg-stone-600/30" : "bg-stone-600/10";

                    return (
                        <div
                            key={i}
                            className={`absolute top-0 w-px h-full ${bgClass}`}
                            style={{ left: `${leftPosition}%` }}
                        />
                    );
                })}

                <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
                    <div className="flex flex-col w-full p-2">
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    aria-label="Minutes"
                                    autoFocus
                                    value={minutesInput}
                                    onChange={onDigits(setMinutesInput)}
                                    onKeyDown={onInputKey}
                                    onFocus={e => e.target.select()}
                                    className="w-24 font-semibold bg-stone-800/80 border border-stone-600/40 rounded-xl px-3 py-2 text-4xl text-stone-100 text-center focus:outline-none focus:border-stone-400/60 backdrop-blur-sm"
                                />
                                <span className="text-4xl font-bold text-stone-400">:</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    aria-label="Seconds"
                                    value={secondsInput}
                                    onChange={onDigits(setSecondsInput)}
                                    onKeyDown={onInputKey}
                                    onFocus={e => e.target.select()}
                                    className="w-24 font-semibold bg-stone-800/80 border border-stone-600/40 rounded-xl px-3 py-2 text-4xl text-stone-100 text-center focus:outline-none focus:border-stone-400/60 backdrop-blur-sm"
                                />
                            </div>
                        ) : (
                            <div className="text-[clamp(55px,10vw,64px)] sm:text-[110px] sm:-mb-8 italic tabular-nums bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300 bg-clip-text text-transparent tracking-wider drop-shadow-lg">
                                {pad(displayMinutes)}
                                <span className="text-stone-400/60">:</span>
                                {pad(displaySeconds)}
                                <span className="text-[0.35em] text-stone-500/60">.{pad(displayCs)}</span>
                            </div>
                        )}

                        <div className="relative w-full">
                            <div className="flex gap-1 text-[clamp(10px,1.5vw,14px)] text-stone-300 italic tracking-wide">
                                {view === 'pomodoro' && !isEditing && (
                                    <>
                                        <button onClick={handleEdit} className={btn}>SET</button>
                                        <span className="text-stone-600">·</span>
                                    </>
                                )}

                                {view === 'stint' && status === 'running' ?
                                    (<></>)
                                    :
                                    (
                                        <>
                                            <button onClick={handleStart} disabled={startDisabled} className={btn}>
                                                {startLabel}
                                            </button>
                                        </>
                                    )
                                }

                                {isEditing ? (
                                    <>
                                        <span className="text-stone-600">·</span>
                                        <button onClick={handleCancelEdit} className={btn}>CANCEL</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={handleReset} className={btn}>{view == 'stint' ? status == 'running' ? 'END STINT' : '' : <><span className="text-stone-600">·</span> RESET</>}</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* the other timer, when it has something going on */}
                    {otherVisible && (
                        <button
                            onClick={() => switchView(other.mode)}
                            aria-label={`Switch to ${other.name.toLowerCase()} timer`}
                            className={`absolute bottom-3 right-4 text-[clamp(10px,1.5vw,13px)] italic tabular-nums tracking-wide transition-colors duration-200 hover:text-rose-700 ${other.status === 'running' ? 'text-stone-300' : 'text-stone-500'
                                }`}
                        >
                            {other.name} {other.status === 'done' ? 'DONE' : clock(other.ms)}
                            {other.status === 'paused' && ' ·  PAUSED'}
                        </button>
                    )}

                    {/* switch between pomodoro and stint */}
                    <div
                        role="button"
                        tabIndex={0}
                        aria-label="Toggle pomodoro / stint"
                        className="absolute top-4 right-4 w-6 h-6 opacity-10 hover:opacity-5 transition-opacity duration-200 cursor-pointer"
                        onClick={() => switchView(view === 'pomodoro' ? 'stint' : 'pomodoro')}
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') switchView(view === 'pomodoro' ? 'stint' : 'pomodoro');
                        }}
                    >
                        <div className="grid grid-cols-4 grid-rows-4 w-full h-full transform rotate-12 ">
                            {Array.from({ length: 16 }, (_, i) => (
                                <div
                                    key={i}
                                    className={(Math.floor(i / 4) + i) % 2 === 0 ? 'bg-stone-100' : 'bg-stone-900'}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className='absolute bottom-0  w-full'>
                <StintList stints={todayStrintData?.data?.stints || []} loading={todayStrintData.isLoading} isRunning={stint.status == 'running'} currentId={addStrintMutation?.data?.id || ''}/>
            </div>
        </div>
    );
};

function beep(ctx: AudioContext | null) {
    if (!ctx) return;
    try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
    } catch {
    }
}

const formatNow = () =>
    new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

export const NowTooltip = ({ totalMin }: { totalMin: number }) => {
    const [label, setLabel] = useState('');

    useEffect(() => {
        setLabel(formatNow());
        const id = setInterval(() => setLabel(formatNow()), 1000);
        return () => clearInterval(id);
    }, []);

    if (!label) return null; // nothing on the server, avoids hydration mismatch

    const [time, period] = label.split(' ');
    return (
        <div
            role="tooltip"
            className="pointer-events-none absolute top-[2px] mt-2 z-50 -translate-x-1/2 -translate-y-1 opacity-0 group-hover/day:translate-y-0 group-hover/day:opacity-100"
            style={{
                left: `${100}%`,
                transition: 'left 500ms, opacity 150ms, transform 150ms',
            }}
        >
            <div className="relative flex gap-2 items-center whitespace-nowrap rounded-xl bg-stone-800 p-1.5 text-[10px] text-stone-300 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                <span className="tabular-nums">
                    {time}{' '}
                    <span className="text-stone-300">{period.toLowerCase()}</span>
                </span>
                <span className='rounded-lg bg-stone-100 text-stone-600 px-1.5 py-0.5'>
                    {totalMin} minutes today
                </span>

                <span className="absolute left-1/2 bottom-full -mb-1 h-2 w-2 -translate-x-1/2 rotate-45 rounded-[2px] bg-stone-800" />
            </div>
        </div>
    );
};
