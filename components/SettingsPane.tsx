"use client"
import { useState } from "react"

const settingOptions = [
    {
        title: "Carry Forward",
        description: "Move incomplete goals to next day automatically."
    },
    {
        title: "Zestify",
        description: "Unlock game features."
    },
    {
        title: "Auto-place rewards",
        description: "Place your reward automatically to the galaxy."
    },
    {
        title: "Focus Mode",
        description: "Hide distractions and show only today's goals."
    }
]

export const SettingsPane = () => {
    const [settingValues, setSettingValues] = useState<boolean[]>([false, false, false, false])

    return (
        <div className="flex flex-row items-center justify-center h-[95vh] min-h-0">
            <div className="w-3/5 rounded-2xl bg-gradient-to-br from-stone-800/20 to-stone-900/30 border border-stone-700/20 backdrop-blur-xl  overflow-hidden">
                <div className="p-3 flex flex-col">
                    {settingOptions.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => setSettingValues(prev => prev.map((value, index) => index === i ? !value : value))}
                            className={`
                                group w-full flex flex-row gap-3 items-start p-3
                                transition-colors duration-200
                                hover:bg-stone-800/60
                                ${i === settingOptions.length - 1 ? "rounded-b-xl" : ""}
                                 ${i === 0 ? "rounded-t-xl" : ""}
                            `}
                        >
                            <div className="flex-shrink-0 mt-0.5">
                                <div
                                    className={`
                                        w-4 h-4 rounded-[4px] border flex items-center justify-center
                                        transition-all duration-200
                                        ${settingValues[i]
                                            ? "bg-blue-600 border-blue-600"
                                            : "border-stone-500 hover:border-stone-300"
                                        }
                                    `}
                                >
                                    {settingValues[i] && (
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="w-3 h-3 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col text-left flex-1 ml-1">
                                <div className="font-bold text-stone-100">
                                    {item.title}
                                </div>
                                <div className="text-xs text-stone-400 mt-1">
                                    {item.description}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}