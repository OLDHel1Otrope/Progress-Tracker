export default function MenuItem({ children, onClick, danger, disabled }: any) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={`
        w-full px-3 py-2 text-left text-sm
        transition-colors

        ${disabled ? "opacity-50 cursor-not-allowed" : ""}

        ${danger
                    ? "text-red-400 hover:bg-red-500/10"
                    : "hover:bg-stone-700"}
      `}
        >
            {children}
        </button>
    );
}
