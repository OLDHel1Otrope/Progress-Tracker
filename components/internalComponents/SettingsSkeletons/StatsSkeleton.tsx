export const StatsSkeleton = () => (
    <div className="relative w-full h-20 bg-black-900 border border-stone-700/20 rounded-xl overflow-hidden ">
        <div className="relative flex flex-row items-end h-full px-3 py-2 gap-0.5">
            {[34, 67, 34, 76, 87, 100, 32, 40, 76, 80, 90, 100, 45, 78, 92, 65, 88, 73, 95, 58, 82, 69, 91, 77, 84, 100, 96, 71, 89, 100, 40].map((p, i) => (
                <div
                    key={i}
                    className="flex  transition-all duration-300  bg-stone-700/20 w-1 "
                    style={{ height: `${p}%` }}
                />
            ))}
        </div>
    </div>
)