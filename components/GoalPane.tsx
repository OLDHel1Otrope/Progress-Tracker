import { useDeleteGoal } from "@/hooks/useDeleteGoal";
import { AddRecurrenceModal } from "./AddRecurrenceModal";
import MenuItem from "./internalComponents/MenuItem";
import { Dispatch, RefObject, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { extractTags, Goal, removeTags } from "./internalComponents/GoalItem";
import { Calendar, ChevronRight, Ellipsis, Loader2, LoaderCircle, Plus, ScanFace, Search, X } from "lucide-react";
import GoalDetails from "./internalComponents/GoalDetails";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateGoalApi } from "@/lib/api/goals";
import { WidgetModal } from "./internalComponents/widgets/WidgetModal";
import DateSelection from "./internalComponents/DateSelection";
import { getRecurrance } from "@/lib/api/recurrance";
import { useGoals } from "@/hooks/useGoals";

const group = ["monthly", "weekly"]
const type = ["all", "priority", "completed", "incomplete", "recurrence"]
const dateDuration = ["between", "from", "until", "on"]

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
    setSelected: Dispatch<SetStateAction<string>>;
    list: string[];
    listName: string;
    listLoading?: boolean;
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
            <ChipSelect ref={dropdownRef} isOpen={durationToggle} list={dateDuration} selected={duration} setOpen={setDurationToggle} setSelected={setDuration} listName="dateDuration" />
            <div className="bg-stone-700 p-1 px-4 rounded-lg  font-semibold">
                {formatDateDMY(selectedDates?.[0])}
            </div>
            {duration === "between" &&
                <>
                    and
                    < div className="bg-stone-700 p-1 px-4 rounded-lg italic font-semibold">
                        {formatDateDMY(selectedDates?.[1])}
                    </div>
                </>
            }
        </div >
    );
}

export function ChipSelect({ ref, setOpen, isOpen, selected, setSelected, list, listName, listLoading = false }: ChipSelectProps) {
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
    }, [ref, setOpen]);
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
                    {listLoading ? (
                        <div className="flex items-center justify-center h-10">
                            <div className="w-4 h-4 rounded-full  relative">
                                <div className="absolute inset-0 border-2 border-stone-300 border-t-stone-300/10 rounded-full animate-spin"></div>
                            </div>
                        </div>
                    ) : (
                        list.map((item) => (
                            <div
                                key={item}
                                onClick={() => {
                                    setSelected(item);
                                    setOpen(false);
                                    if (listName === "dateDuration") return
                                    const params = new URLSearchParams(window.location.search)

                                    params.set(listName, item)

                                    window.history.replaceState(
                                        {},
                                        "",
                                        `${window.location.pathname}?${params}`
                                    )
                                }}
                                className={`px-4 py-2 not-italic font-semibold text-sm cursor-pointer transition-colors capitalize
                                        ${selected === item
                                        ? "bg-stone-800 text-white"
                                        : "text-stone-400 hover:bg-stone-800/60 hover:text-white"
                                    }`}
                            >
                                {item}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

export default function GoalPane() {
    const [searchText, setSearchText] = useState('')

    const [selectedGroup, setSelectedGroup] = useState("monthly")
    const [openGroup, setOpenGroup] = useState(false);
    const dropDownGroupRef = useRef<HTMLDivElement>(null)

    const [selectedType, setSelectedType] = useState("all")
    const [openType, setOpenType] = useState(false);
    const dropdownTypeRef = useRef<HTMLDivElement>(null);

    const [selectedRecurrence, setSelectedRecurrence] = useState("all")
    const [openRecurrence, setOpenRecurrence] = useState(false);
    const dropdownRecurrenceRef = useRef<HTMLDivElement>(null);

    const [selectedDates, setSelectedDates] = useState<Date[]>([])
    const [showDateModal, setShowDateModal] = useState(false)
    const [duration, setDuration] = useState("between")


    const [editingGoalText, setEditingGoalText] = useState<Goal | null>(null);

    const userRecurranceTags = useQuery({
        queryKey: ["recurranceTypes"],
        queryFn: getRecurrance
    });


    // change this to callback if onlyone is selected
    const handleDateToggle = useCallback((date: Date) => {

        if (duration !== "between") {
            setSelectedDates([date]);
            return;
        }

        setSelectedDates((prev) => {
            if (!prev[0] || prev[1]) {
                return [date];
            }

            if (date < prev[0]) {
                return [date, prev[0]];
            }

            return [prev[0], date];
        });

    }, [duration]);


    useEffect(() => {
        const params = new URLSearchParams(window.location.search)

        params.delete("between")
        params.delete("from")
        params.delete("until")
        params.delete("on")

        const d1 = formatDateDMY(selectedDates?.[0])
        const d2 = formatDateDMY(selectedDates?.[1])

        if (!d1) return
        if (!selectedDates[0]) return

        if (duration === "between") {
            params.set("from", d1)
            if (!d2) return
            params.set("until", d2)

        } else if (duration === "from") {
            params.set("from", d1)

        } else if (duration === "until") {
            params.set("until", d1)

        } else {
            params.set("on", d1)
        }

        window.history.replaceState(
            {},
            "",
            `${window.location.pathname}?${params.toString()}`
        )

    }, [duration, selectedDates])

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

    const hookResponse = useGoals()


    console.log("groupedGoals",hookResponse.groupedGoals)


    useEffect(() => {//get all the details from from url 

    }, [])

    return (
        <div className="flex flex-col gap-0 w-full h-full">
            <div className="w-full h-20 py-5  font-semibold  flex flex-row">
                <ChipSelect ref={dropdownTypeRef} isOpen={openType} selected={selectedType} setOpen={setOpenType} setSelected={setSelectedType} list={type} listName="type" />
                {selectedType === "recurrence" &&
                    <ChipSelect
                        ref={dropdownRecurrenceRef}
                        isOpen={openRecurrence}
                        selected={selectedRecurrence}
                        setOpen={setOpenRecurrence}
                        setSelected={setSelectedRecurrence}
                        list={userRecurranceTags?.data?.map(d => d.group_name)}
                        listLoading={userRecurranceTags.isLoading}
                        listName="recurrence" />

                }
                <div className="ml-auto"></div>
                <ChipSelect ref={dropDownGroupRef} isOpen={openGroup} selected={selectedGroup} setOpen={setOpenGroup} setSelected={setSelectedGroup} list={group} listName="group" />
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
                                onClick={() => {
                                    setSelectedDates([])

                                    const params = new URLSearchParams(window.location.search)
                                    params.delete("between")
                                    params.delete("from")
                                    params.delete("until")
                                    params.delete("on")

                                    window.history.replaceState(
                                        {},
                                        "",
                                        `${window.location.pathname}?${params.toString()}`
                                    )
                                }} />
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
                <div className="mr-2  italic font-light text-stone-400 flex-row flex items-center gap-2 px-4 py-2 rounded-full
                                bg-gradient-to-br from-stone-800/80 to-stone-900/80
                                border border-stone-700/30
                                shadow-[inset_0_0_10px_rgba(0,0,0,0.4)]
                                hover:from-stone-700/80 hover:to-stone-800/80
                                transition-all duration-200"
                >
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={searchText}
                            placeholder="Search"
                            onChange={(e) => {
                                setSearchText(e.target.value)
                                const params = new URLSearchParams(window.location.search)

                                params.set("search", e.target.value)

                                window.history.replaceState(
                                    {},
                                    "",
                                    `${window.location.pathname}?${params}`
                                )
                            }

                            }
                            className="bg-transparent text-xl w-80 border-none outline-none text-stone-200 italic"
                        />

                        {searchText === "" ? (
                            <Search strokeWidth={2.5} className="h-4 w-4 text-stone-400" />
                        ) : (
                            <div
                                onClick={() => {
                                    setSearchText("")
                                    const params = new URLSearchParams(window.location.search)

                                    params.delete("search")
                                    window.history.replaceState(
                                        {},
                                        "",
                                        `${window.location.pathname}?${params}`
                                    )
                                }
                                }
                                className="hover:bg-stone-700  rounded cursor-pointer"
                            >
                                <X strokeWidth={2.5} className="h-4 w-4 text-stone-400" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex h-full flex-col  overflow-y-scroll gap-1">
                {hookResponse?.groupedGoals.map(d => (
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
