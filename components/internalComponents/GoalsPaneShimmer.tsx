export function GoalsShimmer() {
    const weeks = [
        { days: [3, 1, 4] },
        { days: [2, 3] },
        { days: [4, 1] },
        { days: [1] },
    ];

    return (
        <div className="flex h-full flex-col overflow-y-scroll gap-2 px-2 py-2">
            {weeks.map((mw, wi) => (
                <div key={wi} className="w-full flex flex-row"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>

                    <div className="sticky top-0 self-start flex items-end justify-end shrink-0 w-7 py-4 h-fit">
                        <div className="w-2 h-16 rounded-sm animate-pulse bg-stone-800/60" />
                    </div>

                    <div className="flex flex-col w-full gap-1 py-1">
                        {mw.days.map((goalCount, di) => (
                            <div key={di} className="w-full flex flex-row">

                                <div className="sticky top-0 self-start flex items-end justify-end shrink-0 w-10 py-3 h-fit">
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="w-2 h-6 rounded-sm animate-pulse bg-stone-800/60" />
                                        <div className="w-2 h-4 rounded-sm animate-pulse bg-stone-800/40" />
                                    </div>
                                </div>

                                <div className="flex flex-col w-full gap-px py-px">
                                    {Array.from({ length: goalCount }).map((_, gi) => (
                                        <div key={gi} className="w-full flex flex-row items-center gap-3 px-3 py-2.5">
                                            <div className="w-4 h-4 rounded-full shrink-0 animate-pulse bg-stone-800/60" />
                                            <div className="animate-pulse bg-stone-800/60 rounded-sm h-3"
                                                style={{ width: `${40 + Math.random() * 40}%` }} />
                                            <div className="ml-auto w-10 h-3 rounded-sm animate-pulse bg-stone-800/40 shrink-0" />
                                        </div>
                                    ))}
                                </div>

                            </div>
                        ))}
                    </div>

                </div>
            ))}
        </div>
    );
}