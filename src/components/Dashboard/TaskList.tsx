import React from 'react';
import { MoreHorizontal, CheckCircle } from 'lucide-react';

const TaskList = () => {
    const tasks = [
        { id: 1, title: 'Navigation bar', description: 'Design and implement top nav', completed: true },
        { id: 2, title: 'Auth function', description: 'Implement user authentication', completed: true },
        { id: 3, title: 'About page', description: 'Create about page and HTML', completed: false },
        { id: 4, title: 'Create database', description: 'Database for data of customers', completed: false },
    ];

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg overflow-y-auto max-h-[45vh]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Today&apos;s Tasks</h2>
                <button className="text-sm text-gray-500 hover:text-gray-700">Today ▼</button>
            </div>

            <div className="space-y-4">
                {tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${task.completed ? 'bg-emerald-100 text-emerald-500' : 'bg-blue-100 text-blue-500'}`}>
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-700">{task.title}</h3>
                                <p className="text-sm text-gray-500">{task.description}</p>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal size={24} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskList;