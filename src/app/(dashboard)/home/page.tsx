import { ActivityChart } from "@/components/Dashboard/ActivityChart"
import { ProjectProgress } from "@/components/Dashboard/ProjectProgress"
import TaskCalendar from "@/components/Dashboard/TaskCalendar"
import TaskList from "@/components/Dashboard/TaskList"
import Timeline from "@/components/Dashboard/Timeline"

const page = () => {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-4 space-y-4 h-fit">
                <ProjectProgress />
                <div className="w-full h-fit">
                    <TaskList />
                </div>
            </div>

            <div className="xl:col-span-8 space-y-4">
                <TaskCalendar />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="w-full h-fit">
                        <ActivityChart />
                    </div>
                    <div className="w-full h-fit">
                        <Timeline />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page