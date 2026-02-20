"use client";
import { Sparkles, Zap } from "lucide-react";
import { useState } from "react";

interface AIChatPromptProps {
    chatText: string;
    setChatText: (text: string) => void;
    isProcessing?: boolean;
    handleAIGenerate: () => void
}

export default function AIChatPrompt({
    chatText,
    setChatText,
    handleAIGenerate,
    isProcessing = false,
}: AIChatPromptProps) {
    const [isFocused, setIsFocused] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (chatText.trim() && !isProcessing) {
                handleAIGenerate();
            }
        }
    };

    return (
        <div className="space-y-3">
            <label className=" text-sm font-medium text-stone-400 tracking-wide flex items-center gap-2">
                <Sparkles size={14} className="text-stone-400" />
                AI Assistant
            </label>
            <div className="relative">
                <div
                    className={`
            relative rounded-2xl overflow-hidden
            bg-gradient-to-br from-stone-900/80 to-stone-800/80
            border-2 transition-all duration-300
            ${isFocused
                            ? 'border-stone-500/60 shadow-[0_0_30px_rgba(180,180,180,0.3)]'
                            : 'border-stone-700/40 shadow-[0_0_20px_rgba(0,0,0,0.2)]'
                        }
          `}
                >
                    <div className="relative">
                        <textarea
                            value={chatText}
                            onChange={(e) => setChatText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            disabled={isProcessing}
                            placeholder="Ask AI to help plan your goals... (Enter to send, Shift+Enter for new line)"
                            rows={3}
                            className={`
                                w-full px-5 py-4
                                bg-transparent
                                text-stone-200 placeholder:text-stone-600
                                focus:outline-none
                                resize-none
                                relative z-10
                                disabled:opacity-60 disabled:cursor-not-allowed
                                `}
                        />
                        {/* Character counter */}
                        {chatText.length > 0 && (
                            <div className="absolute bottom-2 right-3 text-xs text-stone-600 z-10">
                                {chatText.length}/500
                            </div>
                        )}
                    </div>
                </div>
                {/* Status indicator */}
                {isProcessing ? (
                    <div className="flex items-center gap-2 mt-3 px-2">
                        <span className="text-xs text-blue-400 font-medium">
                            Processing...
                        </span>
                    </div>
                ) : chatText.length > 0 ? (
                    <div className="flex items-center gap-2 mt-3 px-2">
                        <span className="text-xs text-stone-500">
                            Press Enter to send
                        </span>
                    </div>
                ) : null}
            </div>
        </div>
    );
}