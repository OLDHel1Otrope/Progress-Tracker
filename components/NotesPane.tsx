"use client";
import { NoteRenderer } from "./internalComponents/noteComponents/NoteRenderer";

export default function NotesPane() {
    return (
        <div className="w-full h-full min-h-0 flex flex-col gap-2 overflow-scroll overflow-x-hidden ml-28 pointer-events-auto">
            <NoteRenderer initialBlocks={sampleNoteData} />
        </div>
    );
}



const sampleNoteData = [
    {
        "id": "n2",
        "type": "dropdown",
        "data": "Road to 50 Push-ups in 10 Weeks (No-Equipment Program)",
        "isOpen": false,
        "children": [
            {
                "id": "p-w1",
                "type": "dropdown",
                "data": "Week 1 – Foundation (Wall & Knee Push-ups)",
                "isOpen": false,
                "children": [
                    { "id": "p-w1-t1", "type": "todo", "data": "Wall push-ups – 3 sets × 15 reps", "checked": false },
                    { "id": "p-w1-t2", "type": "todo", "data": "Knee push-ups – 3 sets × 8 reps", "checked": false },
                    { "id": "p-w1-t3", "type": "todo", "data": "Plank – 3 × 20 seconds", "checked": false },
                    { "id": "p-w1-t4", "type": "todo", "data": "Bodyweight squats – 3 × 15 reps", "checked": false },
                    { "id": "p-w1-t5", "type": "todo", "data": "Stretch chest, shoulders, wrists", "checked": false }
                ]
            },
            {
                "id": "p-w2",
                "type": "dropdown",
                "data": "Week 2 – Knee Push-up Strength",
                "isOpen": false,
                "children": [
                    { "id": "p-w2-t1", "type": "todo", "data": "Knee push-ups – 4 × 10 reps", "checked": false },
                    { "id": "p-w2-t2", "type": "todo", "data": "Incline push-ups (table/bed) – 3 × 10 reps", "checked": false },
                    { "id": "p-w2-t3", "type": "todo", "data": "Plank – 3 × 30 seconds", "checked": false },
                    { "id": "p-w2-t4", "type": "todo", "data": "Glute bridges – 3 × 15 reps", "checked": false }
                ]
            },
            {
                "id": "p-w3",
                "type": "dropdown",
                "data": "Week 3 – Incline Push-ups",
                "isOpen": false,
                "children": [
                    { "id": "p-w3-t1", "type": "todo", "data": "Incline push-ups – 4 × 12 reps", "checked": false },
                    { "id": "p-w3-t2", "type": "todo", "data": "Negative push-ups – 3 × 5 reps", "checked": false },
                    { "id": "p-w3-t3", "type": "todo", "data": "Side plank – 3 × 20 sec per side", "checked": false },
                    { "id": "p-w3-t4", "type": "todo", "data": "Lunges – 3 × 10 per leg", "checked": false }
                ]
            },
            {
                "id": "p-w4",
                "type": "dropdown",
                "data": "Week 4 – First Full Push-ups",
                "isOpen": false,
                "children": [
                    { "id": "p-w4-t1", "type": "todo", "data": "Full push-ups – 5 × 5 reps", "checked": false },
                    { "id": "p-w4-t2", "type": "todo", "data": "Incline push-ups – 3 × 10 reps", "checked": false },
                    { "id": "p-w4-t3", "type": "todo", "data": "Hollow body hold – 3 × 20 sec", "checked": false }
                ]
            },
            {
                "id": "p-w5",
                "type": "dropdown",
                "data": "Week 5 – Volume Build-up",
                "isOpen": false,
                "children": [
                    { "id": "p-w5-t1", "type": "todo", "data": "Full push-ups – 6 × 8 reps", "checked": false },
                    { "id": "p-w5-t2", "type": "todo", "data": "Diamond push-ups (knee if needed) – 3 × 6", "checked": false },
                    { "id": "p-w5-t3", "type": "todo", "data": "Plank shoulder taps – 3 × 20 reps", "checked": false }
                ]
            },
            {
                "id": "p-w6",
                "type": "dropdown",
                "data": "Week 6 – Endurance Focus",
                "isOpen": false,
                "children": [
                    { "id": "p-w6-t1", "type": "todo", "data": "Full push-ups – 4 × 12 reps", "checked": false },
                    { "id": "p-w6-t2", "type": "todo", "data": "Wide push-ups – 3 × 10 reps", "checked": false },
                    { "id": "p-w6-t3", "type": "todo", "data": "Wall sit – 3 × 45 sec", "checked": false }
                ]
            },
            {
                "id": "p-w7",
                "type": "dropdown",
                "data": "Week 7 – Strength + Control",
                "isOpen": false,
                "children": [
                    { "id": "p-w7-t1", "type": "todo", "data": "Slow tempo push-ups – 4 × 10 reps", "checked": false },
                    { "id": "p-w7-t2", "type": "todo", "data": "Pike push-ups – 3 × 8 reps", "checked": false },
                    { "id": "p-w7-t3", "type": "todo", "data": "Leg raises – 3 × 12 reps", "checked": false }
                ]
            },
            {
                "id": "p-w8",
                "type": "dropdown",
                "data": "Week 8 – High Reps Practice",
                "isOpen": false,
                "children": [
                    { "id": "p-w8-t1", "type": "todo", "data": "Full push-ups – 3 × max reps", "checked": false },
                    { "id": "p-w8-t2", "type": "todo", "data": "Explosive push-ups – 3 × 6 reps", "checked": false },
                    { "id": "p-w8-t3", "type": "todo", "data": "Mountain climbers – 3 × 30 sec", "checked": false }
                ]
            },
            {
                "id": "p-w9",
                "type": "dropdown",
                "data": "Week 9 – Test Simulation",
                "isOpen": false,
                "children": [
                    { "id": "p-w9-t1", "type": "todo", "data": "Single-set push-up max test", "checked": false },
                    { "id": "p-w9-t2", "type": "todo", "data": "Push-ups – 2 × 70% of max", "checked": false },
                    { "id": "p-w9-t3", "type": "todo", "data": "Core circuit (plank, hollow, side plank)", "checked": false }
                ]
            },
            {
                "id": "p-w10",
                "type": "dropdown",
                "data": "Week 10 – 50 Push-ups Goal Week",
                "isOpen": false,
                "children": [
                    { "id": "p-w10-t1", "type": "todo", "data": "Light push-ups – 2 × 15 reps (early week)", "checked": false },
                    { "id": "p-w10-t2", "type": "todo", "data": "Rest & mobility work", "checked": false },
                    { "id": "p-w10-t3", "type": "todo", "data": "Final test: 50 push-ups in one set", "checked": false }
                ]
            }
        ]
    }

]