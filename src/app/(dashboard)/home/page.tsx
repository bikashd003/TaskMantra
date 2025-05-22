import { ActivityChart } from '@/components/Dashboard/ActivityChart';
import { ProjectProgress } from '@/components/Dashboard/ProjectProgress';
import TaskList from '@/components/Dashboard/TaskList';
import Timeline from '@/components/Dashboard/Timeline';

const page = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 h-full auto-rows-min theme-transition">
      <div className="sm:col-span-1 md:col-span-2 md:row-span-2 h-full">
        <ProjectProgress />
      </div>

      <div className="sm:col-span-1 md:col-span-2 md:row-span-2 h-full">
        <TaskList />
      </div>

      <div className="sm:col-span-2 md:col-span-2 md:row-span-5 h-full">
        <Timeline />
      </div>

      <div className="md:col-span-4 md:row-span-3 h-full flex flex-col">
        <ActivityChart />
      </div>
    </div>
  );
};

export default page;
