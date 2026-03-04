import { useDeleteGoal } from "@/hooks/useDeleteGoal";
import { AddRecurrenceModal } from "./AddRecurrenceModal";
import MenuItem from "./internalComponents/MenuItem";
import { Dispatch, RefObject, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { extractTags, Goal, removeTags } from "./internalComponents/GoalItem";
import { Calendar, ChevronRight, Ellipsis, Plus, ScanFace, Search, X } from "lucide-react";
import GoalDetails from "./internalComponents/GoalDetails";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGoalApi } from "@/lib/api/goals";
import { WidgetModal } from "./internalComponents/widgets/WidgetModal";
import DateSelection from "./internalComponents/DateSelection";

const group = ["monthly", "weekly"]
const type = ["all", "priority", "completed", "incomplete", "Recurrence"]
const dateDuration = ["between", "from", "until"]

interface DateRangeDisplayProps {
    selectedDates: (Date | string | null)[];
    duration: string;
    setDuration: Dispatch<SetStateAction<string>>
}

interface ChipSelectProps {
    ref: RefObject<HTMLDivElement | null>;
    setOpen: Dispatch<SetStateAction<boolean>>;
    isOpen: boolean;
    selected: string | null;
    setSelected: Dispatch<SetStateAction<string>>
    list: string[]
}

export function formatDateDMY(date: Date | string | null | undefined): string {
    if (!date) return "Select Date";

    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
}

function DateRangeDisplay({ selectedDates, duration, setDuration }: DateRangeDisplayProps) {
    const [durationToggle, setDurationToggle] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null);

    return (
        <div className="text-sm flex flex-row gap-2 items-center" onClick={(e) => e.stopPropagation}>
            <ChipSelect ref={dropdownRef} isOpen={durationToggle} list={dateDuration} selected={duration} setOpen={setDurationToggle} setSelected={setDuration} />
            <div className="bg-stone-700 p-1 px-2 rounded  font-semibold">
                {formatDateDMY(selectedDates?.[0])}
            </div>
            {duration === "between" &&
                <>
                    to
                    < div className="bg-stone-700 p-1 px-2 rounded italic font-semibold">
                        {formatDateDMY(selectedDates?.[1])}
                    </div>
                </>
            }
        </div >
    );
}

export function ChipSelect({ ref, setOpen, isOpen, selected, setSelected, list }: ChipSelectProps) {
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                ref.current &&
                !ref.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    return (
        <div className="relative" ref={ref}>
            <div
                onClick={(e) => { setOpen((isOpen) => !isOpen); e.stopPropagation() }}
                className="cursor-pointer mr-2 italic font-light text-stone-400 flex items-center gap-2 px-4 py-2 rounded-full
                                    bg-gradient-to-br from-stone-800/80 to-stone-900/80
                                    border border-stone-700/30
                                    shadow-[inset_0_0_10px_rgba(0,0,0,0.4)]
                                    hover:from-stone-700/80 hover:to-stone-800/80
                                    transition-all duration-200 capitalize"
            >
                {selected}
                <ChevronRight
                    strokeWidth={2.5}
                    className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-90" : ""
                        }`}
                />
            </div>
            {isOpen && (
                <div className="absolute mt-2 w-40 rounded-xl bg-stone-900 border border-stone-700/40 shadow-lg overflow-hidden z-50">
                    {list.map((item) => (
                        <div
                            key={item}
                            onClick={() => {
                                setSelected(item);
                                setOpen(false);
                            }}
                            className={`px-4 py-2 not-italic font-semibold text-sm cursor-pointer transition-colors capitalize
                                            ${selected === item
                                    ? "bg-stone-800 text-white"
                                    : "text-stone-400 hover:bg-stone-800/60 hover:text-white"
                                }`}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )

}

export default function GoalPane() {
    const [selectedGroup, setSelectedGroup] = useState("monthly")
    const [openGroup, setOpenGroup] = useState(false);
    const dropDownGroupRef = useRef<HTMLDivElement>(null)

    const [selectedType, setSelectedType] = useState("all")
    const [openType, setOpenType] = useState(false);
    const dropdownTypeRef = useRef<HTMLDivElement>(null);

    const [selectedDates, setSelectedDates] = useState<Date[]>([])
    const [showDateModal, setShowDateModal] = useState(false)
    const [duration, setDuration] = useState("between")


    const [editingGoalText, setEditingGoalText] = useState<Goal | null>(null);


    // change this to callback if onlyone is selected
    const handleDateToggle = useCallback((date: Date) => {
        if (duration !== "between") {
            setSelectedDates([date])
            return
        }
        if (!selectedDates[0] || selectedDates[1]) {
            setSelectedDates([date]);
        } else {
            if (date < selectedDates[0]) {
                setSelectedDates([date, selectedDates[0]]);
            } else {
                setSelectedDates([selectedDates[0], date]);
            }
        }
    }, [duration])


    const queryClient = useQueryClient();

    const updateGoalMutation = useMutation({
        mutationFn: updateGoalApi,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["goals", "today"],
            });
        },
    });

    const updateGoalText = (updated: Goal) => {
        setEditingGoalText(updated);
    };

    const updateGoalStatus = (updated: Goal) => {
        // updateGoalMutation.mutate(updated);
    }

    return (
        <div className="flex flex-col gap-0 w-full h-full">
            <div className="w-full h-20 py-5  font-semibold  flex flex-row">
                <ChipSelect ref={dropdownTypeRef} isOpen={openType} selected={selectedType} setOpen={setOpenType} setSelected={setSelectedType} list={type} />
                <ChipSelect ref={dropDownGroupRef} isOpen={openGroup} selected={selectedGroup} setOpen={setOpenGroup} setSelected={setSelectedGroup} list={group} />
                <div
                    onClick={(e) => { setShowDateModal((prev) => !prev); e.stopPropagation() }}
                    className="cursor-pointer mr-2 italic font-light text-stone-400 flex items-center gap-2 pr-4 py-2 rounded-full
                                    bg-gradient-to-br from-stone-800/80 to-stone-900/80
                                    border border-stone-700/30
                                    shadow-[inset_0_0_10px_rgba(0,0,0,0.4)]
                                    hover:from-stone-700/80 hover:to-stone-800/80
                                    transition-all duration-200 capitalize"
                >
                    {(selectedDates[0] || selectedDates[1]) && <DateRangeDisplay selectedDates={selectedDates} setDuration={setDuration} duration={duration} />}
                    <Calendar
                        strokeWidth={2.5}
                        className={`h-4 w-4 ml-4`}
                    />
                    {(selectedDates[0] || selectedDates[1]) &&
                        <div onClick={e => e.stopPropagation()} className="hover:bg-stone-700 p-1 rounded">
                            <X
                                strokeWidth={2.5}
                                className={`h-4 w-4`}
                                onClick={() => setSelectedDates([])} />
                        </div>
                    }
                </div>
                <WidgetModal
                    isOpen={showDateModal}
                    onClose={() => setShowDateModal(false)}
                    title={
                        <DateRangeDisplay selectedDates={selectedDates} setDuration={setDuration} duration={duration} />}
                >
                    <DateSelection
                        selectTwo={duration === "between"}
                        selectedDates={selectedDates}
                        onDateToggle={handleDateToggle}
                    />
                </WidgetModal>
                <div className="mr-2 ml-auto italic font-light text-stone-400 flex-row flex items-center gap-2 px-4 py-2 rounded-full
                                bg-gradient-to-br from-stone-800/80 to-stone-900/80
                                border border-stone-700/30
                                shadow-[inset_0_0_10px_rgba(0,0,0,0.4)]
                                hover:from-stone-700/80 hover:to-stone-800/80
                                transition-all duration-200"
                >
                    <input type="text" placeholder="Search" className="bg-transparent text-xl w-80  border-none outline-none text-stone-200 italic" />
                    <Search strokeWidth={2.5} className="h-4 w-4 text-stone-400" />
                </div>
            </div>
            <div className="flex h-full flex-col  overflow-y-scroll gap-1">
                {sampleData.map(d => (
                    <div key={`${d.month}-${d.year}`} className="w-full flex flex-row group">

                        {/* Month label */}
                        <div
                            className="flex items-end justify-end shrink-0 w-9 px-2 py-4 tracking-widest rounded-r-2xl"
                            style={{
                                writingMode: "vertical-rl",
                                transform: "rotate(180deg)",
                                background: "linear-gradient(to top, #0c0a0a, #0a0a0a )",
                                borderRight: "1px solid rgba(255,255,255,0.04)",
                                borderTop: "1px solid rgba(255,255,255,0.04)",
                                borderBottom: "1px solid rgba(255,255,255,0.04)",
                            }}
                        >
                            <span className="text-xs font-mono font-medium"
                                style={{ color: "#4e4e4e", letterSpacing: "0.18em" }}>
                                {monthName(d.month)} {d.year}
                            </span>
                        </div>

                        {/* Goals */}
                        <div className="flex flex-col w-full gap-0.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                            {d.goals.map(g => (
                                <GoalItem2
                                    key={g.id}
                                    goal={g}
                                    updateGoalText={updateGoalText}
                                    updateGoalStatus={updateGoalStatus}
                                />
                            ))}
                        </div>

                    </div>
                ))}
            </div>
        </div >
    )
}


const GoalItem2 = ({
    goal,
    updateGoalText,
    updateGoalStatus,
}: {
    goal: Goal;
    updateGoalText: (updated: Goal) => void;
    updateGoalStatus: (updated: Goal) => void;
}) => {
    const [editing, setEditing] = useState(false);
    const [showAddRecurrenceModal, setShowAddRecurrenceModal] = useState<string | null>(null); //this holds goal's id
    const [localTitle, setLocalTitle] = useState(goal.title)
    const [showMenu, setShowMenu] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

    const menuRef = useRef<HTMLDivElement | null>(null);
    const ellipsisRef = useRef<HTMLButtonElement | null>(null);

    const deleteGoalMutation = useDeleteGoal();

    useEffect(() => {
        setLocalTitle(goal.title);
    }, [goal.title])

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                showMenu &&
                menuRef.current &&
                !menuRef.current.contains(e.target as Node) &&
                ellipsisRef.current &&
                !ellipsisRef.current.contains(e.target as Node)
            ) {
                setShowMenu(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMenu]);


    return (
        <div key={goal.id}
            className={`
    group p-3
    flex flex-col
    transition-colors duration-200
    ${goal.index === 0 ? "rounded-t-xl" : ""}
    ${goal.is_completed
                    ? "bg-stone-800/30"
                    : "bg-[#0c0a0a]"
                }
  `}
        >
            <div className="flex items-center gap-2">

                <button
                    onClick={async () => {
                        updateGoalStatus({ ...goal, is_completed: !goal.is_completed })
                    }
                    }
                    className={`
            w-3 h-3 rounded-[4px] border flex items-center justify-center
            transition-all duration-200
            ${goal.is_completed
                            ? "bg-blue-600 border-blue-600"
                            : "border-stone-500 hover:border-stone-300"
                        }
        `}
                >
                    {goal.is_completed && (
                        <svg
                            viewBox="0 0 24 24"
                            className="w-2 h-2 text-white"
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


                <div className="flex-1 ml-1 pt-0">
                    {editing ? (
                        <input
                            value={localTitle}
                            autoFocus
                            onChange={(e) => {
                                setLocalTitle(e.target.value);

                                updateGoalText({
                                    ...goal,
                                    title: e.target.value,
                                });
                            }}
                            onBlur={() => setEditing(false)}
                            className={`w-full bg-transparent focus:outline-none font-bold
        ${goal.is_completed ? "line-through text-stone-500" : " text-stone-300"}
      `}
                        />
                    ) : (
                        <div
                            onClick={() => setEditing(true)}
                            className={`font-bold cursor-text flex flex-row gap-2
        ${goal.is_completed ? "line-through text-stone-500" : "text-stone-300"}
      `}
                        >
                            {removeTags(goal.title) || (
                                <span className="text-stone-500">Untitled</span>
                            )}

                            {goal.recurrence_group_id && (
                                <button
                                    key={goal.recurrence_group_id}
                                    onClick={() => {
                                        console.log("Clicked tag:", goal.recurrence_group_id);
                                    }}
                                    className="
            px-2 py-[2px] rounded-md text-xs
            border border-stone-200
            text-stone-300
            bg-stone-700/40
            hover:bg-stone-700/60
            transition
          "
                                >
                                    {goal.recurrence_group_id.charAt(0).toUpperCase() + goal.recurrence_group_id.slice(1)}
                                </button>)}

                            {goal?.equadrant == 0 && (
                                <button
                                    key={"important"}
                                    onClick={() => {
                                        console.log("Clicked important tag");
                                    }}
                                    className="
            px-2 py-[2px] rounded-md text-xs
            border border-rose-600
            text-stone-200  font-bold
            bg-rose-700 
            hover:bg-rose-500/60
            transition
          "
                                >
                                    {"P1"}
                                </button>
                            )}
                            {goal?.group_name && (
                                <button
                                    key={"recurr_name"}
                                    onClick={() => {
                                        console.log("Clicked important tag");
                                    }}
                                    className="
            px-2 py-[2px] rounded-md text-xs
            border-stone-600
            border-2
            text-stone-300 capitalize font-bold
            hover:bg-stone-700/60
            transition
          "
                                >
                                    {goal?.group_name}
                                </button>
                            )}

                            {extractTags(goal.title).length > 0 && (
                                <>

                                    {extractTags(goal.title).map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => {
                                                console.log("Clicked tag:", tag);
                                            }}
                                            className="
            px-2 py-[2px] rounded-md text-xs
            border border-stone-600
            text-stone-300
            hover:bg-stone-700/60
            transition
          "
                                        >
                                            {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                        </button>
                                    ))}
                                </>
                            )}

                            {!goal.recurr_id && extractTags(goal.title).length > 0 && (<button
                                onClick={() => {
                                    setShowAddRecurrenceModal(goal.id);
                                    console.log("Clicked tag:", "recurrence");
                                }}
                                className="
            px-2 py-[2px] rounded-md text-xs
            border border-stone-600
            text-stone-300
            hover:bg-stone-700/60
            flex items-center gap-1
            opacity-0
            group-hover:opacity-100
            transition-all duration-200
            translate-x-1
            group-hover:translate-x-0
          "
                            >
                                <Plus width={10} height={10} /> Add Recurrence group
                            </button>)}
                        </div>
                    )}
                </div>
            </div>

            {/* Expanded section */}
            <div
                className={` mx-7
    overflow-hidden
    transition-[max-height,opacity,margin-top] duration-300 ease-out `}
            >
                <GoalDetails
                    isPane
                    goal={goal}
                    onUpdate={updateGoalText}
                    isFullscreen={false}
                />
            </div>
            <div className="flex justify-end mt-0">

                {/* Ellipsis Button */}
                <button
                    ref={ellipsisRef}
                    onClick={(e) => {
                        e.stopPropagation();

                        const rect = e.currentTarget.getBoundingClientRect();

                        setMenuPos({
                            top: rect.top - 10,
                            left: rect.left - 120,
                        });

                        setShowMenu(prev => !prev);
                    }}
                    className=" rounded hover:bg-stone-700/50 transition"
                >
                    <Ellipsis color="#666666" />
                </button>
                {/* Floating Menu (Portal-like) */}
                {showMenu && (
                    <div
                        ref={menuRef}
                        style={{
                            top: menuPos.top + 20,
                            left: menuPos.left + 200,
                        }}
                        className="
          fixed
          z-[9999]
          w-40
          origin-top-right
          animate-menu-in
            rounded-2xl
            bg-gradient-to-br from-stone-800/90 to-stone-900/90
            border border-stone-700/30
            backdrop-blur-xl
            shadow-[0_20px_40px_rgba(0,0,0,0.6)]
            overflow-hidden
        "
                    >
                        <MenuItem onClick={() => setEditing(true)}>
                            Edit
                        </MenuItem>

                        <MenuItem onClick={() => updateGoalStatus({ ...goal, is_completed: true })}>
                            Mark Complete
                        </MenuItem>

                        <MenuItem onClick={() => {
                            const nextDay = new Date(goal.goal_date || "");
                            nextDay.setDate(nextDay.getDate() + 1);
                            updateGoalStatus({
                                ...goal,
                                goal_date: nextDay.toISOString()
                            });
                        }}>
                            Move to next day
                        </MenuItem>

                        <MenuItem
                            danger
                            disabled={deleteGoalMutation.isPending}
                            onClick={() => {
                                deleteGoalMutation.mutate(goal.id);
                            }}
                        >
                            {deleteGoalMutation.isPending ? "Deleting..." : "Delete"}
                        </MenuItem>

                    </div>
                )}
            </div>
            <AddRecurrenceModal isOpen={showAddRecurrenceModal} onClose={() => setShowAddRecurrenceModal(null)} />
        </div>
    );
}

const monthName = (num: number) => ([
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
])[num - 1].toUpperCase()

const sampleData = [
    {
        month: 1,
        year: 2026,
        goals: [
            {
                id: "a1b2c3d4-e5f6-7890-abcd-ef1234567801",
                title: "What language should I select to be able to use all of raylib's features?",
                description: ` I'm not a game developer and I don't plan to be one professionally. But I love games and would like to create some games by myself and maybe even publish them on Steam. I'm also really interested in physics simulations, procedural generation etc.

I'm good with Python too but mostly I use C for my projects. I would like to continue using C to get better at it but since C doesn't have OOP I'm not sure about it. I can try C++ but I really don't like using C++. What do you guys recommend? `,
                position: 1000000,
                is_completed: false,
                added_on: "2026-01-02T08:00:00.000Z",
                equadrant: 1,
                eposition: 1000001,
                goal_date: "2026-01-15",
                recurr_id: null,
                group_name: "Career"
            },
            {
                id: "a1b2c3d4-e5f6-7890-abcd-ef1234567802",
                title: "Read Atomic Habits",
                description: "Finish reading Atomic Habits by James Clear and take structured notes on key takeaways to apply daily.",
                position: 1000002,
                is_completed: false,
                added_on: "2026-01-03T09:00:00.000Z",
                equadrant: 2,
                eposition: 1000002,
                goal_date: "2026-01-20",
                recurr_id: null,
                group_name: "Personal Growth"
            },
            {
                id: "a1b2c3d4-e5f6-7890-abcd-ef1234567803",
                title: "A question about switching compilers",
                description: ` I guess this question is for the programmers who program in C (also) as a hobby.

Have you ever switched compilers because of reasons other than pure necessity? Like, for example, you used GCC and found something so interesting about Clang it made you switch to it as your main compiler? Or you used Clang, tried out MSVC and found something that made you consciously not want to use it? Something that made you choose a compiler because it is the best option for you? I am curious.

I always used GCC. I haven't found anything about Clang that I would personally benefit from. But I haven't found anything that would discourage me from using it. I therefore use GCC because I am used to it, not that I think it is somehow the best option.
On the other hand, I would not like to use MSVC, since (as far as I know) it has to be ran from dedicated console or in Visual Studio. And I don't want to remember extra set of flags. `,
                position: 1000003,
                is_completed: false,
                added_on: "2026-01-05T07:30:00.000Z",
                equadrant: 2,
                eposition: 1000003,
                goal_date: "2026-01-31",
                recurr_id: "rec-morning-run-001",
                group_name: "Health"
            },
            {
                id: "a1b2c3d4-e5f6-7890-abcd-ef1234567804",
                title: "Preface",
                description: `First published in 2000
by Methoδos Publishers (UK),
24 Southwell Road
Bangor, BT20 3AQ
c©2000 by Ivo Düntsch and Günther Gediga.
ISBN 1 903280 001
A CIP record for this book is available from the British Library.
Ivo Düntsch and Günther Gediga’s right to be identified as the authors of this work
has been asserted in accordance with the Copyright Design and Patents Act 1988.
All rights reserved. No part of this publication may be reproduced or transmitted
in any form and by any means, electronic or mechanical, including photocopy,
recording, or any information storage and retrieval system, without permission in
writing from the publisher.
Every effort has been made to trace copyright holders and obtain permission. Any
omissions brought to our attention will be remedied in future editions.
Typeset in Times New Roman 10pt.
Manufactured from camera-ready copy supplied by the authors by
Sächsisches Digitaldruck Zentrum
Tharandter Straße 31-33
D-01159 Dresden
Germany
Methoδos Publishers (UK), Bangor
Methoδos Verlag (D), Bissendorf`,
                position: 1000004,
                is_completed: false,
                added_on: "2026-01-06T10:00:00.000Z",
                equadrant: 0,
                eposition: 1000004,
                goal_date: "2026-01-31",
                recurr_id: null,
                group_name: "Finance"
            }
        ]
    },
    {
        month: 2,
        year: 2026,
        goals: [
            {
                id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
                title: "Complete AWS Cloud Practitioner Certification",
                description: "Study for and pass the AWS Certified Cloud Practitioner exam. Use A Cloud Guru course and practice exams.",
                position: 2000001,
                is_completed: false,
                added_on: "2026-02-01T08:00:00.000Z",
                equadrant: 1,
                eposition: 2000001,
                goal_date: "2026-02-28",
                recurr_id: null,
                group_name: "Career"
            },
            {
                id: "b2c3d4e5-f6a7-8901-bcde-f12345678902",
                title: "Cook Meals at Home 5x Per Week",
                description: "Reduce eating out by meal prepping every Sunday and cooking at home at least 5 days a week throughout February.",
                position: 2000002,
                is_completed: false,
                added_on: "2026-02-01T09:00:00.000Z",
                equadrant: 2,
                eposition: 2000002,
                goal_date: "2026-02-28",
                recurr_id: "rec-meal-prep-002",
                group_name: "Health"
            },
            {
                id: "b2c3d4e5-f6a7-8901-bcde-f12345678903",
                title: "Write 4 Blog Posts on Medium",
                description: "Publish one Medium article per week on topics related to productivity, tech, or personal development.",
                position: 2000003,
                is_completed: false,
                added_on: "2026-02-02T10:00:00.000Z",
                equadrant: 2,
                eposition: 2000003,
                goal_date: "2026-02-28",
                recurr_id: null,
                group_name: "Personal Growth"
            },
            {
                id: "b2c3d4e5-f6a7-8901-bcde-f12345678904",
                title: "Reduce Screen Time to Under 3 Hours/Day",
                description: "Use Screen Time app to monitor and limit recreational screen time. Replace with reading or outdoor activity.",
                position: 2000004,
                is_completed: false,
                added_on: "2026-02-03T07:00:00.000Z",
                equadrant: 0,
                eposition: 2000004,
                goal_date: "2026-02-28",
                recurr_id: "rec-screen-time-003",
                group_name: "Health"
            }
        ]
    },
    {
        month: 3,
        year: 2026,
        goals: [
            {
                id: "c3d4e5f6-a7b8-9012-cdef-123456789001",
                title: "Apply to 10 Senior Developer Roles",
                description: "Research and apply to at least 10 senior frontend or full-stack developer roles on LinkedIn and AngelList.",
                position: 3000001,
                is_completed: false,
                added_on: "2026-03-01T08:00:00.000Z",
                equadrant: 1,
                eposition: 3000001,
                goal_date: "2026-03-31",
                recurr_id: null,
                group_name: "Career"
            },
            {
                id: "c3d4e5f6-a7b8-9012-cdef-123456789002",
                title: "Complete 30-Day Yoga Challenge",
                description: "Follow Adriene's 30-day yoga series on YouTube. Practice every morning for flexibility and mindfulness.",
                position: 3000002,
                is_completed: false,
                added_on: "2026-03-01T07:00:00.000Z",
                equadrant: 2,
                eposition: 3000002,
                goal_date: "2026-03-31",
                recurr_id: "rec-yoga-004",
                group_name: "Health"
            },
            {
                id: "c3d4e5f6-a7b8-9012-cdef-123456789003",
                title: "Build a Budget Tracker App",
                description: "Create a full-stack budget tracker with React frontend and Node.js/PostgreSQL backend. Deploy on Vercel.",
                position: 3000003,
                is_completed: false,
                added_on: "2026-03-02T09:00:00.000Z",
                equadrant: 1,
                eposition: 3000003,
                goal_date: "2026-03-31",
                recurr_id: null,
                group_name: "Career"
            },
            {
                id: "c3d4e5f6-a7b8-9012-cdef-123456789004",
                title: "Call Parents Every Weekend",
                description: "Schedule a standing video call with parents every Saturday at 11am. Prioritize connection and family time.",
                position: 3000004,
                is_completed: false,
                added_on: "2026-03-01T10:00:00.000Z",
                equadrant: 2,
                eposition: 3000004,
                goal_date: "2026-03-31",
                recurr_id: "rec-family-call-005",
                group_name: "Relationships"
            }
        ]
    },
    {
        month: 4,
        year: 2026,
        goals: [
            {
                id: "d4e5f6a7-b8c9-0123-defa-234567890001",
                title: "Land a Job Offer",
                description: "Secure at least one formal job offer from ongoing applications. Negotiate salary and benefits confidently.",
                position: 4000001,
                is_completed: false,
                added_on: "2026-04-01T08:00:00.000Z",
                equadrant: 0,
                eposition: 4000001,
                goal_date: "2026-04-30",
                recurr_id: null,
                group_name: "Career"
            },
            {
                id: "d4e5f6a7-b8c9-0123-defa-234567890002",
                title: "Read 2 Books on Finance",
                description: "Read 'The Psychology of Money' by Morgan Housel and 'Rich Dad Poor Dad' by Robert Kiyosaki.",
                position: 4000002,
                is_completed: false,
                added_on: "2026-04-02T09:00:00.000Z",
                equadrant: 2,
                eposition: 4000002,
                goal_date: "2026-04-30",
                recurr_id: null,
                group_name: "Personal Growth"
            },
            {
                id: "d4e5f6a7-b8c9-0123-defa-234567890003",
                title: "Start Investing in Index Funds",
                description: "Open a brokerage account and make the first SIP contribution to a Nifty 50 index fund. Automate monthly.",
                position: 4000003,
                is_completed: false,
                added_on: "2026-04-01T10:00:00.000Z",
                equadrant: 1,
                eposition: 4000003,
                goal_date: "2026-04-15",
                recurr_id: "rec-sip-006",
                group_name: "Finance"
            },
            {
                id: "d4e5f6a7-b8c9-0123-defa-234567890004",
                title: "Plan a Weekend Trip",
                description: "Organize a 2-day trip to Rishikesh or Coorg with friends. Book accommodation and travel in advance.",
                position: 4000004,
                is_completed: false,
                added_on: "2026-04-03T11:00:00.000Z",
                equadrant: 3,
                eposition: 4000004,
                goal_date: "2026-04-25",
                recurr_id: null,
                group_name: "Relationships"
            }
        ]
    },
    {
        month: 5,
        year: 2026,
        goals: [
            {
                id: "e5f6a7b8-c9d0-1234-efab-345678900001",
                title: "Complete System Design Course",
                description: "Finish the Grokking System Design course and create concise notes on core patterns like sharding, caching, and load balancing.",
                position: 5000001,
                is_completed: false,
                added_on: "2026-05-01T08:00:00.000Z",
                equadrant: 1,
                eposition: 5000001,
                goal_date: "2026-05-31",
                recurr_id: null,
                group_name: "Career"
            },
            {
                id: "e5f6a7b8-c9d0-1234-efab-345678900002",
                title: "Run a 5K Race",
                description: "Sign up for and complete a local 5K run. Target finishing time under 30 minutes after 2 months of training.",
                position: 5000002,
                is_completed: false,
                added_on: "2026-05-02T07:00:00.000Z",
                equadrant: 2,
                eposition: 5000002,
                goal_date: "2026-05-25",
                recurr_id: null,
                group_name: "Health"
            },
            {
                id: "e5f6a7b8-c9d0-1234-efab-345678900003",
                title: "Declutter and Organize Home",
                description: "Go through all belongings using the KonMari method. Donate unused items and reorganize living and workspace.",
                position: 5000003,
                is_completed: false,
                added_on: "2026-05-03T10:00:00.000Z",
                equadrant: 3,
                eposition: 5000003,
                goal_date: "2026-05-15",
                recurr_id: null,
                group_name: "Personal Growth"
            },
            {
                id: "e5f6a7b8-c9d0-1234-efab-345678900004",
                title: "Launch a Side Project on Product Hunt",
                description: "Ship a small SaaS or tool and submit it to Product Hunt. Aim for at least 100 upvotes on launch day.",
                position: 5000004,
                is_completed: false,
                added_on: "2026-05-01T09:00:00.000Z",
                equadrant: 1,
                eposition: 5000004,
                goal_date: "2026-05-31",
                recurr_id: null,
                group_name: "Career"
            }
        ]
    },
    {
        month: 6,
        year: 2026,
        goals: [
            {
                id: "f6a7b8c9-d0e1-2345-fabc-456789000001",
                title: "Settle Into New Job",
                description: "Onboard smoothly at new company, meet teammates, understand codebase, and complete first sprint successfully.",
                position: 6000001,
                is_completed: false,
                added_on: "2026-06-01T08:00:00.000Z",
                equadrant: 1,
                eposition: 6000001,
                goal_date: "2026-06-30",
                recurr_id: null,
                group_name: "Career"
            },
            {
                id: "f6a7b8c9-d0e1-2345-fabc-456789000002",
                title: "Meditate Daily for 30 Days",
                description: "Use the Headspace app to meditate for 10 minutes every morning. Track streaks and journal reflections weekly.",
                position: 6000002,
                is_completed: false,
                added_on: "2026-06-01T07:00:00.000Z",
                equadrant: 2,
                eposition: 6000002,
                goal_date: "2026-06-30",
                recurr_id: "rec-meditation-007",
                group_name: "Health"
            },
            {
                id: "f6a7b8c9-d0e1-2345-fabc-456789000003",
                title: "Review and Rebalance Investment Portfolio",
                description: "Audit all current investments after 3 months of SIPs. Rebalance equity/debt ratio based on performance and goals.",
                position: 6000003,
                is_completed: false,
                added_on: "2026-06-02T10:00:00.000Z",
                equadrant: 2,
                eposition: 6000003,
                goal_date: "2026-06-15",
                recurr_id: null,
                group_name: "Finance"
            },
            {
                id: "f6a7b8c9-d0e1-2345-fabc-456789000004",
                title: "Learn Basic Spanish",
                description: "Complete Duolingo Spanish beginner track and finish the first 2 units of a structured Spanish grammar workbook.",
                position: 6000004,
                is_completed: false,
                added_on: "2026-06-01T09:00:00.000Z",
                equadrant: 3,
                eposition: 6000004,
                goal_date: "2026-06-30",
                recurr_id: "rec-spanish-008",
                group_name: "Personal Growth"
            }
        ]
    }
];