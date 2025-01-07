import { Button } from "../ui/button";

export default function TasksStep({ onNext }: { onNext: (data: unknown) => void }) {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Tasks</h2>
            <p className="text-gray-600">
                Manage tasks for this project. You can add, edit, and organize
                tasks.
            </p>
            <Button className="mt-4">Add Task</Button>
        </div>
    )
}
