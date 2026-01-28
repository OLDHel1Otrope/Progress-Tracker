"use client";

import CalendarPage from "@/components/CalenderPage";

export default function Calendar() {
  return (
    <CalendarPage />
  )
} 

// todos
// create data models done
// fix ui/ux
// add autocomplete for #tags when adding goals/tasks in DayModal
// ability to delete goals/tasks in DayModal
// ability to add links
// ability to reschedule the goals, by one day, uncompleted goals will be rescheduled to next day automatically
// add some beautiful graphic to indicate progress/completion of goals/tasks on each day cell in calendar
// add search facility to search for goals/tasks across days
// add streak feature to motivate consistent goal completion
// draggable goals/tasks to reorder priority
// add monthly report section to show stats, charts, progress summary etc.
// add a quick notes section on the home page, easy way to jot down thoughts this can also be opened in its own model
// integrate with backend to fetch and display actual events/tasks
// maybe integrate with calendar APIs like Google Calendar or Apple Calendar for syncing events
