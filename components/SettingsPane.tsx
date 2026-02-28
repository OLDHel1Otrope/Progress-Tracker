"use client"
import { useAuth } from "@/contexts/authContext";
import { useMemo, useState } from "react"
import { DayCounterSkeleton } from "./internalComponents/SettingsSkeletons/DayCounterSkeleton";
import { TimerSkeleton } from "./internalComponents/SettingsSkeletons/TimerSkeleton";
import { StatsSkeleton } from "./internalComponents/SettingsSkeletons/StatsSkeleton";
import { GripVertical } from "lucide-react";
import { GoalsSkeleton } from "./internalComponents/SettingsSkeletons/GoalsSkeleton";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type SettingKey =
    | "carry_over"
    | "zestify_mode"
    | "auto_place"
    | "focus_mode";

const settingOptions: {
    title: string;
    description: string;
    id: SettingKey;
}[] = [
        {
            title: "Carry Forward",
            description: "Move incomplete goals to next day automatically.",
            id: "carry_over"
        },
        {
            title: "Zestify",
            description: "Unlock game features.",
            id: "zestify_mode"
        },
        {
            title: "Auto-place rewards",
            description: "Place your reward automatically to the galaxy.",
            id: "auto_place"
        },
        {
            title: "Focus Mode",
            description: "Hide distractions and show only today's goals.",
            id: "focus_mode"
        },
    ];

const componentMap: Record<string, React.ReactNode> = {
    goals: <GoalsSkeleton />,
    day_counter: <DayCounterSkeleton />,
    timer: <TimerSkeleton />,
    stats: <StatsSkeleton />,
};

interface HomeOrderItem {
    id: string;
    active: boolean;
    position: number;
}

interface SortableHomeItemProps {
    item: HomeOrderItem;
    onToggle: (id: string) => void;
}

function SortableHomeItem({ item, onToggle }: SortableHomeItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="w-[400px] h-24 bg-stone-800 rounded-xl rounded-l-2xl flex flex-row p-0.5"
        >
            <div className="w-10 h-full flex flex-col items-center justify-center gap-3">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle(item.id);
                    }}
                    className={`
                        w-4 h-4 rounded-[4px] border flex items-center justify-center
                        transition-all duration-200 cursor-pointer
                        ${item.active
                            ? "bg-stone-600 border-stone-600"
                            : "border-stone-500 hover:border-stone-300"
                        }
                    `}
                >
                    {item.active && (
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
                </button>
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing"
                >
                    <GripVertical size={18} className="text-stone-400" />
                </div>
            </div>
            <div className="flex-1">
                {componentMap[item.id]}
            </div>
        </div>
    );
}

export const SettingsPane = () => {
    const { user, updateUserDetails } = useAuth();

    const SettingData = useMemo(() => {
        return settingOptions.map((s) => ({
            ...s,
            value: user?.[s.id] ?? false
        }));
    }, [user]);

    const [homeOrder, setHomeOrder] = useState<HomeOrderItem[]>(
        user?.home_order || [
            { id: "goals", active: true, position: 1 },
            { id: "day_counter", active: true, position: 2 },
            { id: "timer", active: true, position: 3 },
            { id: "stats", active: true, position: 4 },
        ]
    );

    useMemo(() => {
        if (user?.home_order) {
            setHomeOrder(user.home_order);
        }
    }, [user?.home_order]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = homeOrder.findIndex((item) => item.id === active.id);
        const newIndex = homeOrder.findIndex((item) => item.id === over.id);

        const newOrder = arrayMove(homeOrder, oldIndex, newIndex).map((item, index) => ({
            ...item,
            position: index + 1,
        }));

        setHomeOrder(newOrder);

        updateUserDetails({ home_order: newOrder });
    };

    const handleToggle = (id: string) => {
        const newOrder = homeOrder.map((item) =>
            item.id === id ? { ...item, active: !item.active } : item
        );

        setHomeOrder(newOrder);

        updateUserDetails({ home_order: newOrder });
    };

    const sortedHomeOrder = useMemo(() => {
        return [...homeOrder].sort((a, b) => a.position - b.position);
    }, [homeOrder]);

    return (
        <div className="flex flex-row items-center justify-center h-[95vh] min-h-0 ">
            <div className="w-3/5 rounded-2xl bg-stone-800/20  border border-stone-700/20 backdrop-blur-xl  overflow-hidden ">
                <div className="p-3 flex flex-col  pointer-events-auto">
                    {SettingData.map((item, i) => (
                        <button
                            key={i}
                            onClick={() =>
                                updateUserDetails({ [item.id]: !item.value })
                            }
                            className={`
                                group w-full flex flex-row gap-3 items-start p-3
                                transition-colors duration-200
                                hover:bg-stone-800/60
                                 ${i === 0 ? "rounded-t-xl" : ""}
                            `}
                        >
                            <div className="flex-shrink-0 mt-2">
                                <div
                                    className={`
                                        w-4 h-4 rounded-[4px] border flex items-center justify-center
                                        transition-all duration-200
                                        ${item.value
                                            ? "bg-stone-600 border-stone-600"
                                            : "border-stone-500 hover:border-stone-300"
                                        }
                                    `}
                                >
                                    {item.value && (
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
                    <div className="w-full flex flex-col items-center gap-3 p-3 bg-stone-800/10 h-96 rounded-b-xl">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={sortedHomeOrder.map(item => item.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {sortedHomeOrder.map((item) => (
                                    <SortableHomeItem
                                        key={item.id}
                                        item={item}
                                        onToggle={handleToggle}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>
            </div>
        </div>
    );
};