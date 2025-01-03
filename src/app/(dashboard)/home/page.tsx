import { ActivityChart } from "@/components/Dashboard/ActivityChart"
import { ProjectProgress } from "@/components/Dashboard/ProjectProgress"

const page = () => {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-4 space-y-6">
                <ProjectProgress />
                {/* <TaskList /> */}
            </div>

            <div className="xl:col-span-8 space-y-6">
                {/* <Timeline /> */}
                <ActivityChart />
            </div>
        </div>
    )
}

export default page