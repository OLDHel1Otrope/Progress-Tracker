import { useState, useEffect, useRef } from 'react';

export const PomodoroTimer = () => {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60 * 1000); // in milliseconds
    const totalTimeRef = useRef(25 * 60 * 1000);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startTimeRef = useRef<number | null>(null);
    const endTimeRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isRunning) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        intervalRef.current = setInterval(() => {
            const now = Date.now();
            const remaining = (endTimeRef.current ?? 0) - now;

            if (remaining <= 0) {
                setTimeLeft(0);
                setIsRunning(false);
                clearInterval(intervalRef.current!);
            } else {
                setTimeLeft(remaining);
            }
        }, 50); // 20 FPS is plenty

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);


    const handleStart = () => {
        if (isEditing) {
            const newTotal = minutes * 60 * 1000 + seconds * 1000;
            totalTimeRef.current = newTotal;
            setTimeLeft(newTotal);
            setIsEditing(false);
        }

        if (!isRunning) {
            startTimeRef.current = Date.now();
            endTimeRef.current = Date.now() + timeLeft;
        }

        setIsRunning(prev => !prev);
    };


    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(totalTimeRef.current);
        startTimeRef.current = null;
        endTimeRef.current = null;
    };


    const handleEdit = () => {
        setIsRunning(false);
        setIsEditing(true);
    };

    const displayMinutes = Math.floor(timeLeft / 60000);
    const displaySeconds = Math.floor((timeLeft % 60000) / 1000);
    const displayMs = Math.floor((timeLeft % 1000) / 10);

    const progress = (timeLeft / totalTimeRef.current) * 100;

    return (
        <div
            className="relative w-full h-48 bg-gradient-to-br from-stone-800/20 to-stone-900/30 backdrop-blur-xl border border-stone-700/20 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Racing stripes background */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-1/4 w-1 h-full bg-stone-400 transform -skew-x-12" />
                <div className="absolute top-0 right-1/4 w-1 h-full bg-stone-400 transform -skew-x-12" />
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute blur-3xl opacity-20 w-3/4 h-3/4 bg-gradient-to-br from-stone-600/30 to-stone-600/30 rounded-full" />
            </div>

            {/* Main content */}
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6">

                {/* Timer display */}
                <div className="relative mb-0">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={minutes}
                                onChange={(e) => setMinutes(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
                                className="[appearance:textfield] w-16 bg-stone-800/60 border border-stone-600/40 rounded-lg px-2 py-1 text-3xl font-bold text-stone-100 text-center focus:outline-none focus:border-stone-500/60"
                                min="0"
                                max="99"
                            />
                            <span className="text-3xl font-bold text-stone-400">:</span>
                            <input
                                type="number"
                                value={seconds}
                                onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                                className="[appearance:textfield] w-16 bg-stone-800/60 border border-stone-600/40 rounded-lg px-2 py-1 text-3xl font-bold text-stone-100 text-center focus:outline-none focus:border-stone-500/60"
                                min="0"
                                max="59"
                            />
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Time display with racing style */}
                            <div className="text-[clamp(40px,8vw,42px)] pr-4 font-extrabold italic font-pixelify bg-gradient-to-br from-stone-100 via-stone-300 to-stone-400 bg-clip-text text-transparent tracking-wider">
                                {String(displayMinutes).padStart(2, '0')}
                                <span className="text-stone-400/60">:</span>
                                {String(displaySeconds).padStart(2, '0')}
                                {/* <span className="text-[0.4em] text-stone-500/60">
                                    .{String(displayMs).padStart(2, '0')}
                                </span> */}
                            </div>
                        </div>
                    )}
                </div>

                {/* Depleting progress bar */}
                <div className="w-full ">
                    {/* Background track */}
                    <div className="relative h-1 bg-stone-800/40 rounded-full overflow-hidden border border-stone-700/30">
                        {/* Progress fill with racing aesthetic */}
                        <div
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-stone-300 via-stone-400 to-stone-500 transition-all duration-100 ease-linear"
                            style={{
                                width: `${progress}%`,
                                filter: 'drop-shadow(0 0 4px rgba(168, 162, 158, 0.4))',
                            }}
                        >
                            {/* Shine effect on progress bar */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stone-200/20 to-transparent transform -skew-x-12" />
                        </div>

                        {/* Notches on the bar (like racing lap markers) */}
                        <div className="absolute inset-0 flex justify-between px-1">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="w-px h-full bg-stone-700/20" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Control buttons - only show on hover */}
                <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 transition-opacity duration-300 ${isHovered || isEditing ? 'opacity-100' : 'opacity-0'}`}>
                    {!isEditing && (
                        <button
                            onClick={handleEdit}
                            className="relative px-6 py-2 font-bold text-sm text-stone-300 italic tracking-wide overflow-hidden group"
                        >
                            <div className="absolute mx-1 inset-0 bg-stone-700/40 transform -skew-x-12 border-l-2 border-r-2 border-stone-600/40 group-hover:bg-stone-700/60 transition-colors" />
                            <span className="relative">SET</span>
                        </button>
                    )}

                    <button
                        onClick={handleStart}
                        className="relative px-8 py-2 font-bold text-sm text-stone-100 italic tracking-wide overflow-hidden group"
                    >
                        <div className="absolute mx-1 inset-0 bg-gradient-to-r from-stone-600/60 to-stone-600/60 transform -skew-x-12 border-l-2 border-r-2 border-stone-500/40 group-hover:from-stone-600/80 group-hover:to-stone-600/80 transition-colors" />
                        <span className="relative">{isRunning ? 'PAUSE' : isEditing ? 'START' : 'RESUME'}</span>
                    </button>

                    {!isEditing && (
                        <button
                            onClick={handleReset}
                            className="relative px-6 py-2 font-bold text-sm text-stone-300 italic tracking-wide overflow-hidden group"
                        >
                            <div className="absolute mx-1 inset-0 bg-stone-700/40 transform -skew-x-12 border-l-2 border-r-2 border-stone-600/40 group-hover:bg-stone-700/60 transition-colors" />
                            <span className="relative">RESET</span>
                        </button>
                    )}
                </div>

                {/* Racing checkered flag accent */}
                <div className="absolute top-4 right-4 w-8 h-8 opacity-10">
                    <div className="grid grid-cols-4 grid-rows-4 w-full h-full transform rotate-12">
                        {[...Array(16)].map((_, i) => (
                            <div
                                key={i}
                                className={`${(Math.floor(i / 4) + i) % 2 === 0 ? 'bg-stone-100' : 'bg-stone-900'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Speed lines when running */}
                {isRunning && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute h-0.5 bg-gradient-to-r from-transparent via-stone-500/20 to-transparent animate-speed-line"
                                style={{
                                    top: `${20 + i * 15}%`,
                                    animationDelay: `${i * 0.3}s`,
                                    width: '200%',
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes speed-line {
                    0% {
                        transform: translateX(-100%) skewX(-12deg);
                        opacity: 0;
                    }
                    50% {
                        opacity: 0.3;
                    }
                    100% {
                        transform: translateX(50%) skewX(-12deg);
                        opacity: 0;
                    }
                }
                .animate-speed-line {
                    animation: speed-line 1.5s linear infinite;
                }
            `}</style>
        </div>
    );
};