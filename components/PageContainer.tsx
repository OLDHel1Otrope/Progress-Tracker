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
                width: "100vw",

                transform: isActive
                    ? "translateX(-2vw)" // small visible edge when open
                    : `translateX(calc(-96.7vw - ${ 0.4*index}vw))`,

                transition: "transform 0.3s ease",
                zIndex: 10 + index,
                backgroundColor: color,
                boxShadow: "2px 4px 8px rgba(0,0,0,0.2)",
            }}
        >
            <div className="flex-1 min-h-0 p-6 text-white overflow-hidden">{children}</div>

            <div
                onClick={onToggle}
                className="absolute cursor-pointer"
                style={{
                    width: "35px",
                    height: "190px",
                    top: `${index * 150}px`,
                    right: "-35px",
                }}
            >
                <svg
                    viewBox="0 0 13.22 108.66"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute inset-0 w-full h-full "
                    style={{ fill: color }}
                    preserveAspectRatio="none"
                >
                    <path d="M0 0 C0 5.03 13 10.06 13 17.1 V91.56 C13 98.6 0 103.63 0 108.66 Z" />
                </svg>

                <span
                    className="absolute inset-0 flex items-center justify-center
               text-stone-500 text-sm italic font-semibold select-none z-10 mr-1"
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
