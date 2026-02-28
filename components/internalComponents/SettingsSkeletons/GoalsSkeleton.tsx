export const GoalsSkeleton = () => (
    <div className="relative w-full h-20 bg-stone-900 border border-stone-700/20 rounded-xl overflow-hidden ">
        <div className="flex flex-col gap-1.5 p-3 ">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="h-2 bg-stone-700/30  rounded-md w-full"
                />
            ))}
        </div>
    </div >
)