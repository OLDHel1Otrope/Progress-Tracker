interface PageContainerProps {
    title: string;
    index: number;
    color: string;
    isActive: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

export default function PageContainer({
    title,
    index,
    color,
    isActive,
    onToggle,
    children,
}: PageContainerProps) {
    return (
        <div
            className="fixed left-0 top-0 h-screen min-h-0 h-full flex flex-col"
            style={{
                width: "1920px",
                transform: isActive ? `translateX(-${60}px)` : `translateX(-${1850 + 10 * index}px)`,
                transition: "transform 0.3s ease",
                zIndex: 10 + index,
                backgroundColor: color,
                boxShadow: "2px 4px 8px rgba(0,0,0,0.2)",
            }}
        >
            <div className="h-full p-6 text-white min-h-0">{children}</div>

            <div
                onClick={onToggle}
                className="absolute bg-stone-800 cursor-pointer flex items-center justify-center"
                style={{
                    width: "50px",
                    height: "190px",

                    top: `${index * 150}px`,

                    right: "-50px",
                    backgroundColor: color,

                    clipPath: "polygon(0 0, 100% 15%, 100% 85%, 0 100%)",

                }}
            >
                <span
                    className="text-stone-400 text-md font-semibold select-none"
                    style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",

                    }}
                >
                    {title}
                </span>
            </div>
        </div>
    );
}
