import { getRecurrance } from "@/lib/api/recurrance";
import { useMutation, useQuery } from "@tanstack/react-query";
import { X, Tag, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface AddRecurrenceModalProps {
    isOpen: string | null,
    onClose: () => void
}

export const AddRecurrenceModal = ({ isOpen, onClose }: AddRecurrenceModalProps) => {
    const [inputValue, setInputValue] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const userRecurranceTags = useQuery({
        queryKey: ["recurranceTypes"],
        queryFn: getRecurrance
    });

    // userRecurranceTags.refetch()

    const addRecurranceMutation = useMutation({
        mutationFn: ({ goalId, recurrName }: { goalId: string, recurrName: string }) => {
            // addRecurrence(goalId, recurrName)
            return Promise.resolve();
        },
        onSuccess: () => {
            setInputValue("");
            setShowDropdown(false);
        },
        onError: (err) => {
            console.error("Add recurrence failed:", err);
        },
        onSettled: () => {
            onClose();
        },
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target as Node) &&
                !inputRef.current?.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter tags based on input
    const filteredTags = userRecurranceTags?.data?.filter((tag: any) =>
        tag?.group_name?.toLowerCase().includes(inputValue.toLowerCase())
    ) || [];

    const handleSelectTag = (tagName: string) => {
        setInputValue(tagName);
        setShowDropdown(false);
    };

    const handleAddRecurrence = () => {
        if (!inputValue.trim() || !isOpen) return;
        
        addRecurranceMutation.mutate({
            goalId: isOpen,
            recurrName: inputValue.trim()
        });
    };

    if (!isOpen) return null;

    const isExistingTag = userRecurranceTags?.data?.some(
        (tag: any) => tag?.group_name?.toLowerCase() === inputValue?.toLowerCase()
    );

    return (
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
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-700/30 bg-stone-800/40">
                    <div className="flex items-center gap-2">
                        <Tag size={18} className="text-stone-400" />
                        <h3 className="text-lg font-semibold text-stone-200">
                            Add to Recurrence Group
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
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-400">
                            Select or create group
                        </label>
                        
                        <div className="relative">
                            {/* Input field */}
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => {
                                        setInputValue(e.target.value);
                                        setShowDropdown(true);
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    placeholder="Type or select a group..."
                                    className="
                                        w-full px-4 py-3 pr-10
                                        bg-stone-900/60 border border-stone-600/50
                                        rounded-xl
                                        text-stone-200 placeholder:text-stone-600
                                        focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-400/20
                                        transition-all duration-200
                                    "
                                />
                                <ChevronDown 
                                    size={16} 
                                    className={`
                                        absolute right-3 top-1/2 -translate-y-1/2 
                                        text-stone-500 transition-transform duration-200
                                        ${showDropdown ? 'rotate-180' : ''}
                                    `}
                                />
                            </div>

                            {/* Dropdown */}
                            {showDropdown && (
                                <div
                                    ref={dropdownRef}
                                    className="
                                        absolute top-full left-0 right-0 mt-2
                                        bg-stone-900 border border-stone-700/50
                                        rounded-xl shadow-xl
                                        max-h-48 overflow-y-auto
                                        z-10
                                    "
                                >
                                    {userRecurranceTags.isLoading ? (
                                        <div className="px-4 py-3 text-sm text-stone-500 text-center">
                                            Loading...
                                        </div>
                                    ) : filteredTags.length > 0 ? (
                                        <>
                                            {filteredTags.map((tag: any) => (
                                                <button
                                                    key={tag.id}
                                                    onClick={() => handleSelectTag(tag.group_name)}
                                                    className="
                                                        w-full px-4 py-2.5 text-left
                                                        text-stone-300 hover:bg-stone-800/60
                                                        transition-colors duration-150
                                                        border-b border-stone-700/30 last:border-0
                                                        flex items-center gap-2
                                                    "
                                                >
                                                    <Tag size={14} className="text-stone-600" />
                                                    <span className="text-sm">{tag.group_name}</span>
                                                </button>
                                            ))}
                                        </>
                                    ) : inputValue.trim() ? (
                                        <div className="px-4 py-3 text-sm text-stone-500">
                                            <div className="flex items-center gap-2">
                                                <span>Create new group:</span>
                                                <span className="font-semibold text-stone-300">"{inputValue}"</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="px-4 py-3 text-sm text-stone-500 text-center">
                                            No groups yet. Type to create one.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Helper text */}
                        {inputValue.trim() && !isExistingTag && (
                            <p className="text-xs text-stone-500 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                New group will be created
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-700/30 bg-stone-800/40">
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
                        onClick={handleAddRecurrence}
                        disabled={!inputValue.trim() || addRecurranceMutation.isPending}
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
                        {addRecurranceMutation.isPending ? 'Adding...' : 'Add to Group'}
                    </button>
                </div>
            </div>
        </div>
    );
};