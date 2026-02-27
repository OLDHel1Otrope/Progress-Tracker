"use client"

import { Tag, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface WidgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode,
    title: string,
    hideFooter?: boolean
}

export const WidgetModal = ({
    isOpen,
    onClose,
    title,
    hideFooter = false,
    children
}: WidgetModalProps) => {

    useEffect(() => {
        function handleEsc(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }

        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!isOpen) return null;
    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="
                    w-full max-w-md
                    bg-gradient-to-br from-stone-800/95 to-stone-900/95
                    border border-stone-700/50
                    rounded-2xl
                    shadow-[0_20px_80px_rgba(0,0,0,0.6),inset_0_0_15px_rgba(0,0,0,0.3)]
                    overflow-hidden
                "
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-700/30 bg-stone-800/40">
                    <div className="flex items-center gap-2">
                        <Tag size={18} className="text-stone-400" />
                        <h3 className="text-lg font-semibold text-stone-200">
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-stone-700/60 transition-all duration-200 text-stone-400 hover:text-stone-200"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {children}

                </div>

                {/* Footer */}
                {!hideFooter && <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-700/30 bg-stone-800/40">
                    <button
                        onClick={onClose}
                        className="
                            px-5 py-2 rounded-xl
                            text-stone-400 font-medium
                            hover:bg-stone-700/40
                            transition-all duration-200
                        "
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => { }}
                        disabled={false}
                        className="
                            px-6 py-2 rounded-xl
                            bg-stone-200 text-stone-900
                            font-semibold tracking-wide
                            hover:bg-stone-100
                            disabled:opacity-40 disabled:cursor-not-allowed
                            transition-all duration-200
                            shadow-lg shadow-stone-900/20
                        "
                    >
                        Update
                    </button>
                </div>}
            </div>
        </div>,
        document.body
    )
}