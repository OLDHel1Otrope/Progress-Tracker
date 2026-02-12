// create all of these with in mind that its not for fixed size, the widgets can be resized as the user pleases in the future
//from the modal all the data will be set and 
export const DayCounterWidget = ({
    targetDate,
    toFrom,
}: {
    targetDate: string;
    toFrom: boolean;
}) => {
    const setDate = new Date(targetDate);
    const now = new Date();

    if (isNaN(setDate.getTime())) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-800/20 to-stone-900/30 backdrop-blur-xl border border-stone-700/20 rounded-2xl">
                <div className="text-red-500/80 font-pixelify text-sm">Invalid date</div>
            </div>
        );
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const elapsedDays = Math.floor(
        (now.getTime() - setDate.getTime()) / msPerDay
    );
    const displayDays = toFrom ? elapsedDays : -elapsedDays;

    return (
        <div className="relative w-full h-full bg-gradient-to-br from-stone-800/20 to-stone-900/30 backdrop-blur-xl border border-stone-700/20 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            {/* Racing stripes background */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-1/4 w-1 h-full bg-stone-400 transform -skew-x-12" />
                <div className="absolute top-0 right-1/4 w-1 h-full bg-stone-400 transform -skew-x-12" />
            </div>

            {/* Glow effect behind number */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute blur-3xl opacity-20 w-3/4 h-3/4 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-full" />
            </div>

            {/* Main content */}
            <div className="relative w-full h-full flex flex-col items-center justify-center p-3">
                {/* Big number with racing style */}
                <div className="relative">
                    {/* Shadow/outline effect */}
                    {/* <div
                        className="absolute inset-0 text-[clamp(80px,20vw,260px)] font-extrabold italic font-pixelify text-stone-900/40 blur-sm"
                        style={{ transform: 'translate(4px, 4px)' }}
                    >
                        {displayDays}
                    </div> */}

                    {/* Main number */}
                    <div className="relative pr-8 text-[clamp(80px,20vw,260px)] font-extrabold italic font-pixelify bg-gradient-to-br from-stone-100 via-stone-300 to-stone-400 bg-clip-text text-transparent">
                        {displayDays}
                    </div>
                </div>

                {/* Label with racing flag aesthetic */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] backdrop-blur-sm">
                    {/* Angled background bar */}
                    <div className="absolute inset-0 bg-stone-800/60  transform -skew-x-6 border-l-2 border-r-2 border-stone-600/40" />

                    {/* Text */}
                    <div className="relative px-4 py-1.5 font-semibold text-[clamp(8px,1.5vw,14px)] text-stone-300 italic tracking-wide text-center">
                       {displayDays} DAYS {toFrom ? 'SINCE' : 'UNTIL'} {setDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                    </div>
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
            </div>
        </div>
    );
};

// export const PomodoroTimer = () => {
//     return (
//         <div>render the countdown here</div>
//     )
// }

// export const ArticleShortcutWidget = () => {
//     return (
//         <div>render the note image, and click to go to article edit directly</div>
//     )
// }

// export const ProgressDisplayWidget = () => {
//     return (
//         <div>show some beautiful ui</div>
//     )
// }