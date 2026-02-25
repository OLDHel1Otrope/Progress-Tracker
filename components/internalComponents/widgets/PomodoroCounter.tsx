"use client"
import { useState, useEffect, useRef } from 'react';

export const PomodoroTimer = () => {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60 * 1000);
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
        }, 50);

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
            className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)] border border-stone-700/30"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="absolute inset-0">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-stone-800/20 to-stone-900/30 transition-all duration-100 ease-linear"
                    style={{
                        clipPath: `inset(0 ${100 - progress}% 0 0)`
                    }}
                />

                <div
                    className="absolute inset-0 bg-gradient-to-br from-stone-700/10 to-stone-800/70 transition-all duration-100 ease-linear"
                    style={{
                        clipPath: `inset(0 0 0 ${progress}%)`,
                        boxShadow: 'inset 0 0 40px rgba(168, 162, 158, 0.1)'
                    }}
                />

                <div
                    className="absolute inset-y-0 w-1 bg-gradient-to-b from-transparent via-stone-700/40 to-transparent transition-all duration-100 ease-linear"
                    style={{
                        left: `${progress}%`,
                        filter: 'blur(2px)'
                    }}
                />
            </div>

            <div className="absolute top-0 left-1/4 w-px h-full bg-stone-600/20 transform -skew-x-12" />
            <div className="absolute top-0 right-1/4 w-px h-full bg-stone-600/20 transform -skew-x-12" />


            <div className="relative w-full h-full flex flex-col items-center justify-center p-6">

                <div className="flex-1 flex items-center justify-center">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={minutes}
                                onChange={(e) => setMinutes(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
                                className="[appearance:textfield] w-24 font-semibold bg-stone-800/80 border border-stone-600/40 rounded-xl px-3 py-2 text-4xl font-pixelify text-stone-100 text-center focus:outline-none focus:border-stone-400/60 backdrop-blur-sm"
                                min="0"
                                max="99"
                            />
                            <span className="text-4xl font-bold text-stone-400">:</span>
                            <input
                                type="number"
                                value={seconds}
                                onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                                className="[appearance:textfield] w-24 font-semibold bg-stone-800/80 border border-stone-600/40 rounded-xl px-3 py-2 text-4xl font-pixelify text-stone-100 text-center focus:outline-none focus:border-stone-400/60 backdrop-blur-sm"
                                min="0"
                                max="59"
                            />
                        </div>
                    ) : (
                        <div className="text-[clamp(48px,10vw,64px)] font-extrabold italic font-pixelify bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300 bg-clip-text text-transparent tracking-wider drop-shadow-lg">
                            {String(displayMinutes).padStart(2, '0')}
                            <span className="text-stone-400/60">:</span>
                            {String(displaySeconds).padStart(2, '0')}
                            <span className="text-[0.35em] text-stone-500/60">
                                .{String(displayMs).padStart(2, '0')}
                            </span>
                        </div>
                    )}
                </div>

                <div className={`flex gap-2 transition-opacity duration-300 ${isHovered || isEditing || isRunning ? 'opacity-100' : 'opacity-0'} `}>
                    {!isEditing && (
                        <button
                            onClick={handleEdit}
                            className={`
                                px-4 py-2 rounded-lg
                                bg-stone-700/40 hover:bg-stone-600/50
                                border border-stone-600/40
                                text-stone-300 hover:text-stone-100
                                text-xs font-semibold tracking-wide
                                transition-all duration-200
                                backdrop-blur-sm
                            `}
                        >
                            SET
                        </button>
                    )}

                    <button
                        onClick={handleStart}
                        className={`
                            px-6 py-2 rounded-lg
                            bg-stone-600/60 hover:bg-stone-500/70
                            border border-stone-500/50
                            text-stone-100
                            text-xs font-bold tracking-wide
                            transition-all duration-200
                            backdrop-blur-sm
                            shadow-lg shadow-stone-900/20
                        `}
                    >
                        {isRunning ? 'PAUSE' : isEditing ? 'START' : 'RESUME'}
                    </button>

                    {!isEditing && (
                        <button
                            onClick={handleReset}
                            className={`
                                px-4 py-2 rounded-lg
                                bg-stone-700/40 hover:bg-stone-600/50
                                border border-stone-600/40
                                text-stone-300 hover:text-stone-100
                                text-xs font-semibold tracking-wide
                                transition-all duration-200
                                backdrop-blur-sm
                            `}
                        >
                            RESET
                        </button>
                    )}
                </div>

                <div className="absolute top-4 right-4 w-6 h-6 opacity-5">
                    <div className="grid grid-cols-4 grid-rows-4 w-full h-full transform rotate-12">
                        {[...Array(16)].map((_, i) => (
                            <div
                                key={i}
                                className={`${(Math.floor(i / 4) + i) % 2 === 0 ? 'bg-stone-100' : 'bg-stone-900'}`}
                            />
                        ))}
                    </div>
                </div>

                {isRunning && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute h-px bg-gradient-to-r from-transparent via-stone-400/20 to-transparent animate-speed-line"
                                style={{
                                    top: `${25 + i * 20}%`,
                                    animationDelay: `${i * 0.4}s`,
                                    width: '150%',
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes speed-line {
                    0% {
                        transform: translateX(-100%) skewX(-15deg);
                        opacity: 0;
                    }
                    50% {
                        opacity: 0.4;
                    }
                    100% {
                        transform: translateX(80%) skewX(-15deg);
                        opacity: 0;
                    }
                }
                .animate-speed-line {
                    animation: speed-line 2s linear infinite;
                }
            `}</style>
        </div>
    );
};