interface GoalDetailsProps {
    goal: { title: string };
    onUpdate: (goal: any) => void;
    isFullscreen: boolean;
}

export default function GoalDetails({ goal, onUpdate, isFullscreen }: GoalDetailsProps) {
    return (
        <div className="space-y-4 flex flex-col gap-0 mt-4">
            {isFullscreen && (
                <h4 className="text-lg font-semibold">{goal.title}</h4>)}

            <textarea
                placeholder="Write notes…"
                className="w-full bg-transparent border border-stone-600 rounded-lg p-3 focus:outline-none"
            />

            <div className="text-sm text-stone-400">
                Subtasks, metadata, etc. coming next
            </div>
        </div>
    );
}
