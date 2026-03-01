"use client"

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from "@dnd-kit/core";

import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
    useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { useEffect, useMemo, useState } from "react";
import { GripVertical } from "lucide-react";
import { reorderEisenHower } from "@/lib/api/quadrants";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Goal = {
    id: string;
    title: string;
};

type MatrixQuadrant = "urgent-important" | "not-urgent-important" | "urgent-not-important" | "not-urgent-not-important" | "unclassified";

export default function EisenhowerMatrix({ goalsUC }: { goalsUC: any[] }) {

    const [goals, setGoals] = useState<ReturnType<typeof buildGoals>>(
        () => buildGoals(goalsUC)
    );

    useEffect(() => {
        setGoals(buildGoals(goalsUC));
    }, [goalsUC]);

    console.log(goals)


    const queryClient = useQueryClient();

    const reorderMutation = useMutation({
        mutationFn: (updates: [number, number | null, number][]) => reorderEisenHower(updates),
        onMutate: async (updates) => {
            await queryClient.cancelQueries({
                queryKey: ["goals", "today"],
            });

            const prev = queryClient.getQueryData<Goal[]>([
                "goals",
                "today",
            ]);

            queryClient.setQueryData<Goal[]>(
                ["goals", "today"],
                (old) => {
                    if (!old) return old;

                    const updatesMap = new Map(
                        updates.map(([id, quadrant, position]) => [id, { quadrant, position }])
                    );

                    return old.map(goal => {
                        const update = updatesMap.get(goal.id as any);
                        if (update) {
                            return { ...goal, ...update };
                        }
                        return goal;
                    });
                }
            );

            return { prev };
        },
        onError: (err, _, ctx) => {
            if (ctx?.prev) {
                queryClient.setQueryData(
                    ["goals", "today"],
                    ctx.prev
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["goals", "today"],
            });
        },
    });


    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over) {
            setActiveId(null);
            return;
        }
        const activeContainer = findContainer(active.id);
        const overContainer = over.id.includes("-droppable")
            ? over.id.replace("-droppable", "") as MatrixQuadrant
            : findContainer(over.id);

        if (!activeContainer || !overContainer) {
            setActiveId(null);
            return;
        }

        // Map quadrant names to numbers
        const quadrantToNumber = (quadrant: string): number | null => {
            switch (quadrant) {
                case 'urgent-important': return 0;
                case 'not-urgent-important': return 1;
                case 'urgent-not-important': return 2;
                case 'not-urgent-not-important': return 3;
                case 'unclassified': return null;
                default: return null;
            }
        };

        const updates: [number, number | null, number][] = [];

        if (activeContainer !== overContainer) {
            const activeItems = [...goals[activeContainer]];
            const overItems = [...goals[overContainer]];
            const activeIndex = activeItems.findIndex((item) => item.id === active.id);
            const overIndex = overItems.findIndex((item) => item.id === over.id);
            const [movedItem] = activeItems.splice(activeIndex, 1);

            if (overIndex >= 0) {
                overItems.splice(overIndex, 0, movedItem);
            } else {
                overItems.push(movedItem);
            }

            activeItems.forEach((item, index) => {
                updates.push([item.id, quadrantToNumber(activeContainer), index]);
            });

            overItems.forEach((item, index) => {
                updates.push([item.id, quadrantToNumber(overContainer), index]);
            });
        } else {
            const items = [...goals[activeContainer]];
            const activeIndex = items.findIndex((item) => item.id === active.id); // Changed
            const overIndex = items.findIndex((item) => item.id === over.id); // Changed
            const reordered = arrayMove(items, activeIndex, overIndex);

            reordered.forEach((item, index) => {
                updates.push([item.id, quadrantToNumber(activeContainer), index]);
            });
        }

        setGoals(prev => {
            const next = structuredClone(prev);

            if (activeContainer !== overContainer) {
                const activeItems = next[activeContainer];
                const overItems = next[overContainer];

                const fromIndex = activeItems.findIndex(i => i.id === active.id); // Changed
                const toIndex = overItems.findIndex(i => i.id === over.id); // Changed

                const [moved] = activeItems.splice(fromIndex, 1);

                overItems.splice(toIndex >= 0 ? toIndex : overItems.length, 0, moved);
            } else {
                const items = next[activeContainer];
                const from = items.findIndex(i => i.id === active.id); // Changed
                const to = items.findIndex(i => i.id === over.id); // Changed
                next[activeContainer] = arrayMove(items, from, to);
            }

            return next;
        });

        // sync server
        reorderMutation.mutate(updates);

        setActiveId(null);
    };

    const findContainer = (id: string): MatrixQuadrant | undefined => {
        if (id in goals) {
            return id as MatrixQuadrant;
        }

        return Object.keys(goals).find((key) =>
            goals[key as MatrixQuadrant].some((item) => item.id === id)
        ) as MatrixQuadrant | undefined;
    };

    const activeGoal = activeId
        ? Object.values(goals)
            .flat()
            .find((goal) => goal.id === activeId)
        : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-0.5 w-[85vw] h-[85vh] p-6 pb-2 ml-16 pointer-events-auto">
                <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-0.5">
                    <MatrixQuadrant
                        id="urgent-important"
                        title="Urgent & Important"
                        goals={goals["urgent-important"]}
                    />
                    <MatrixQuadrant
                        id="not-urgent-important"
                        title="Not Urgent & Important"
                        goals={goals["not-urgent-important"]}
                    />
                    <MatrixQuadrant
                        id="urgent-not-important"
                        title="Urgent & Not Important"
                        goals={goals["urgent-not-important"]}
                    />
                    <MatrixQuadrant
                        id="not-urgent-not-important"
                        title="Not Urgent & Not Important"
                        goals={goals["not-urgent-not-important"]}
                    />
                </div>

                <div className="w-96 rounded-r-2xl bg-gradient-to-br from-stone-800/20 to-stone-900/30  backdrop-blur-xl overflow-hidden">
                    <div className="px-4 py-3 ">
                        <h3 className="font-xs text-stone-500 italic">Unclassified</h3>
                        <p className="text-xs text-stone-600 italic">Drag to categorize</p>
                    </div>
                    <MatrixQuadrant
                        id="unclassified"
                        title=""
                        goals={goals["unclassified"]}
                        isList
                    />
                </div>
            </div>

            <DragOverlay>
                {activeGoal ? (
                    <div className="group flex items-center gap-1 p-2 rounded-xs bg-stone-800/90 shadow-2xl  cursor-grabbing">
                        <div className="text-stone-600">
                            <GripVertical size={16} />
                        </div>
                        <span className="text-sm text-stone-300 font-medium">{activeGoal.title}</span>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}


function MatrixQuadrant({
    id,
    title,
    goals,
    isList = false,
}: {
    id: MatrixQuadrant;
    title: string;
    goals: Goal[];
    isList?: boolean;
}) {
    const { setNodeRef, isOver } = useSortable({
        id: `${id}-droppable`,
        data: { type: "container" },
    });

    return (
        <div
            ref={setNodeRef}
            className={` ${!isList ? " bg-gradient-to-br backdrop-blur-xl from-stone-800/20 to-stone-900/30" : " bg-none border-none"}  overflow-hidden flex flex-col 
                ${isOver ? "border-stone-500/50" : ""}
                ${id == "urgent-important" ? "rounded-tl-2xl" : ""}
                ${id == "urgent-not-important" ? "rounded-bl-2xl" : ""}
        `}
        >
            {!isList && (
                <div className="px-4 py-2 ">
                    <h3 className="italic text-xs text-stone-500">{title}</h3>
                </div>
            )}

            <SortableContext items={goals.map((g) => g.id)} strategy={verticalListSortingStrategy}>
                <div className={`flex flex-col gap-0.5 p-3 overflow-y-auto ${isList ? "max-h-[calc(100vh-120px)]" : "flex-1"}`}>
                    {goals.map((goal) => (
                        <GoalCard key={goal.id} goal={goal} />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}

function GoalCard({ goal }: { goal: Goal }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: goal.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`group flex items-center gap-1 p-2 rounded-sm bg-stone-800/40  transition-all cursor-grab active:cursor-grabbing ${isDragging ? "shadow-lg z-5000" : "hover:bg-stone-700/40"
                }`}
        >
            <div className="opacity-0 group-hover:opacity-100 text-stone-600 hover:text-stone-300 transition-opacity">
                <GripVertical size={16} />
            </div>
            <span className="text-sm text-stone-400 font-semibold">{goal.title}</span>
        </div>
    );
}

function buildGoals(goalsUC: any[]) {
    const classified = {
        'urgent-important': [],
        'not-urgent-important': [],
        'urgent-not-important': [],
        'not-urgent-not-important': [],
        'unclassified': []
    } as Record<MatrixQuadrant, any[]>;

    const numberToQuadrant = (num: number | null): MatrixQuadrant => {
        switch (num) {
            case 0: return 'urgent-important';
            case 1: return 'not-urgent-important';
            case 2: return 'urgent-not-important';
            case 3: return 'not-urgent-not-important';
            default: return 'unclassified';
        }
    };

    goalsUC.forEach(goal => {
        classified[numberToQuadrant(goal.equadrant)].push(goal);
    });

    Object.values(classified).forEach(list =>
        list.sort((a, b) =>
            (a.eposition ?? Number.MAX_SAFE_INTEGER) -
            (b.eposition ?? Number.MAX_SAFE_INTEGER)
        )
    );

    return classified;
}
