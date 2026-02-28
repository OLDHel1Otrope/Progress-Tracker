"use client"

import { getStats } from "@/lib/api/calender";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const StatsDisplay = ({ todayRate }: { todayRate: number }) => {
    const stats = useQuery({
        queryFn: getStats,
        queryKey: ["stats"],
    });

    const avg = useMemo(() => {
        const data = stats?.data ?? [];

        const totalFromStats = data.reduce((acc, item) => {
            const value = parseFloat(item?.completion_percentage ?? 0);
            return acc + (isNaN(value) ? 0 : value);
        }, 0);

        const safeTodayRate = Number(todayRate * 100) || 0;

        const totalCount = data.length + 1;

        if (totalCount === 0) return 0;

        return (totalFromStats + safeTodayRate) / totalCount;
    }, [stats?.data, todayRate]);

    return (
        <div className="relative w-full h-48 bg-gradient-to-br from-stone-800/20 to-stone-900/30 backdrop-blur-xl border border-stone-700/20 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-1/4 w-px h-full bg-stone-200 transform -skew-x-12" />
                <div className="absolute top-0 right-1/4 w-px h-full bg-stone-200 transform -skew-x-12" />
            </div>

            {/* Stats bars */}
            <div className="relative w-full h-[100%] flex items-end gap-[1px] ">
                <div
                    className="absolute left-0 right-0 border-t border-dashed border-stone-400/30 transition-all duration-300"
                    style={{ bottom: `${avg}%` }}
                >
                    <span className="absolute right-4 -top-2 text-[10px] font-pixelify text-stone-400/70">
                        AVG {avg}%
                    </span>
                </div>
                {stats?.data?.map((p, i) => (
                    <div
                        key={i}
                        className="max-w-0.5 w-[1px] relative flex-1 group transition-all duration-300 hover:scale-105"
                        style={{ height: `${parseFloat(p.completion_percentage)}%` }}
                    >
                        {/* Bar */}
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-700 via-stone-600 to-stone-500 rounded-t-sm shadow-[0_0_10px_rgba(120,113,108,0.3)]">
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-stone-400/20 to-transparent opacity-50" />
                        </div>

                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                            <div className="bg-stone-900/90 backdrop-blur-sm border border-stone-700/50 rounded-lg px-2 py-1 whitespace-nowrap">
                                <span className="text-xs font-pixelify text-stone-200">{p.completion_percentage}%</span>
                            </div>
                        </div>
                    </div>
                ))}
                <div
                    key={"today"}
                    className="max-w-0.5 w-[1px] relative flex-1 group transition-all duration-300 hover:scale-105"
                    style={{ height: `${todayRate * 100}%` }}
                >
                    {/* Bar */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-700 via-stone-600 to-stone-500 rounded-t-sm shadow-[0_0_10px_rgba(120,113,108,0.3)]">
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-stone-400/20 to-transparent opacity-50" />
                    </div>


                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 pointer-events-none">
                        <div className="pulse-glow" />
                    </div>


                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        <div className="bg-stone-900/90 backdrop-blur-sm border border-stone-700/50 rounded-lg px-2 py-1 whitespace-nowrap">
                            <span className="text-xs font-pixelify text-stone-200">{todayRate * 100}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid lines */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between ">
                {[0, 25, 50, 75, 100].map((line) => (
                    <div key={line} className="w-full h-px bg-stone-700/10" />
                ))}
            </div>

            <div className="absolute top-2 right-4 font-pixelify font-semibold text-[10px] text-stone-500 italic tracking-wide">
                COMPLETION RATE
            </div>
        </div>
    );
};

// "use client"

// export const StatsDisplay = () => {
//     const randomData = [34, 67, 34, 76, 87, 100, 32, 40, 76, 80, 90, 100, 45, 78, 92, 65, 88, 73, 95, 58, 82, 69, 91, 77, 84, 63, 96, 71, 89, 55, 40];
//     const avg = Math.round(
//         randomData.reduce((a, b) => a + b, 0) / randomData.length
//     );

//     return (
//         <div className="relative w-full h-48 bg-gradient-to-br from-stone-800/20 to-stone-900/30 backdrop-blur-xl border border-stone-700/20 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
//             {/* Racing stripes background */}
//             <div className="absolute inset-0 opacity-5">
//                 <div className="absolute top-0 left-1/4 w-px h-full bg-stone-200 transform -skew-x-12" />
//                 <div className="absolute top-0 right-1/4 w-px h-full bg-stone-200 transform -skew-x-12" />
//             </div>

//             {/* Glow effect */}
//             {/* <div className="absolute inset-0 flex items-center justify-center">
//                 <div className="absolute blur-3xl opacity-20 w-3/4 h-3/4 bg-gradient-to-br from-rose-600/20 to-rose-800/20 rounded-full" />
//             </div> */}

//             {/* Stats bars */}
//             <div className="relative w-full h-[100%] flex items-end gap-[1px] ">
//                 <div
//                     className="absolute left-0 right-0 border-t border-dashed border-rose-400/30"
//                     style={{ bottom: `${avg}%` }}
//                 >
//                     <span className="absolute right-4 -top-2 text-[10px] font-pixelify text-rose-400/70">
//                         AVG {avg}%
//                     </span>
//                 </div>
//                 {randomData.map((p, i) => (
//                     <div
//                         key={i}
//                         className="max-w-0.5 w-[1px] relative flex-1 group transition-all duration-300 hover:scale-105"
//                         style={{ height: `${p}%` }}
//                     >
//                         {/* Bar */}
//                         <div className="absolute inset-0 bg-gradient-to-t from-rose-700 via-rose-600 to-rose-500 rounded-t-sm shadow-[0_0_10px_rgba(225,29,72,0.3)]">
//                             <div className="absolute inset-0 bg-gradient-to-t from-transparent via-rose-400/20 to-transparent opacity-50" />
//                         </div>

//                         {i === randomData.length - 1 && (
//                             <div className="absolute -top-0 left-1/2 -translate-x-1/2 pointer-events-none">
//                                 <div className="pulse-glow" />
//                             </div>
//                         )}

//                         {/* Tooltip */}
//                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
//                             <div className="bg-stone-900/90 backdrop-blur-sm border border-stone-700/50 rounded-lg px-2 py-1 whitespace-nowrap">
//                                 <span className="text-xs font-pixelify text-stone-200">{p}%</span>
//                             </div>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* Grid lines */}
//             <div className="absolute inset-0 pointer-events-none flex flex-col justify-between ">
//                 {[0, 25, 50, 75, 100].map((line) => (
//                     <div key={line} className="w-full h-px bg-stone-700/10" />
//                 ))}
//             </div>

//             {/* Checkered flag accent */}
//             {/* <div className="absolute top-4 right-4 w-6 h-6 opacity-10">
//                 <div className="grid grid-cols-4 grid-rows-4 w-full h-full transform rotate-12">
//                     {[...Array(16)].map((_, i) => (
//                         <div
//                             key={i}
//                             className={`${(Math.floor(i / 4) + i) % 2 === 0 ? 'bg-stone-100' : 'bg-stone-900'}`}
//                         />
//                     ))}
//                 </div>
//             </div> */}

//             {/* Label */}
//             <div className="absolute top-2 right-4 font-pixelify font-semibold text-[10px] text-stone-500 italic tracking-wide">
//                 COMPLETION RATE
//             </div>
//         </div>
//     );
// };