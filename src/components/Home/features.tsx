import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle, Clock, Calendar, AlertCircle } from 'lucide-react';

const Features = () => {
    const [activeProject, setActiveProject] = useState('Website Redesign');
    const [activeTab, setActiveTab] = useState('Tasks');

    const projects = [
        { name: 'Website Redesign', color: 'from-purple-500 to-pink-500' },
        { name: 'Mobile App', color: 'from-blue-500 to-cyan-500' },
        { name: 'Marketing Campaign', color: 'from-green-500 to-teal-500' },
    ];

    const tasks = [
        { id: 1, title: 'Update user dashboard layout', status: 'completed', date: 'Today' },
        { id: 2, title: 'Implement task filtering', status: 'in-progress', timeLeft: '2h remaining' },
        { id: 3, title: 'API Integration', status: 'upcoming', dueDate: '2 days' },
        { id: 4, title: 'UI Testing', status: 'upcoming', dueDate: '5 days' },
    ];

    return (
        <motion.section
            className="px-4 sm:px-6 relative -mt-10 pb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
        >
            <motion.div
                className="max-w-6xl mx-auto relative shadow-2xl rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-br from-background to-background/80 backdrop-blur-sm"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.4, type: "spring", stiffness: 100 }}
            >
                <div className="flex flex-col md:flex-row h-full">
                    {/* Left sidebar */}
                    <div className="w-full md:w-64 bg-card/30 border-r border-border/50">
                        <div className="p-4 border-b border-border/50">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                    <ChevronRight className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-sm font-semibold">Projects</span>
                            </div>
                        </div>

                        {/* Project list */}
                        <div className="pt-2">
                            {projects.map((project) => (
                                <div
                                    key={project.name}
                                    className={`px-3 py-2 mx-2 rounded-lg cursor-pointer transition-all duration-300 ${activeProject === project.name ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-background/40'}`}
                                    onClick={() => setActiveProject(project.name)}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-5 h-5 bg-gradient-to-br ${project.color} rounded flex items-center justify-center`}>
                                            <div className="w-3 h-3 bg-white/90 rounded-sm"></div>
                                        </div>
                                        <div className="text-xs">
                                            <div className="font-medium">{project.name}</div>
                                            <div className="text-foreground/60 text-xs">In Progress</div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="mt-4 px-4 py-2">
                                <button className="w-full bg-primary/20 hover:bg-primary/30 text-primary font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-300">
                                    + New Project
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main content area */}
                    <div className="flex-1 flex flex-col">
                        <div className="p-4 border-b border-border/50 flex justify-between items-center">
                            <div className="text-lg font-semibold">{activeProject}</div>
                            <div className="flex items-center gap-2 bg-background/40 rounded-full px-3 py-1">
                                <div className="text-xs text-foreground/70">Progress</div>
                                <div className="text-xs font-medium text-green-500">68%</div>
                            </div>
                        </div>

                        <div className="flex border-b border-border/50">
                            {['Tasks', 'Timeline', 'Files'].map((tab) => (
                                <button
                                    key={tab}
                                    className={`px-4 py-2 text-sm font-medium transition-colors duration-300 ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-foreground/70 hover:text-foreground'}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto">
                            <AnimatePresence mode="wait">
                                {activeTab === 'Tasks' && (
                                    <motion.div
                                        key="tasks"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {tasks.map((task) => (
                                            <div key={task.id} className="mb-4 bg-card/30 rounded-lg p-4 hover:bg-card/50 transition-colors duration-300">
                                                <div className="flex items-center gap-3 mb-2">
                                                    {task.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                                    {task.status === 'in-progress' && <Clock className="w-5 h-5 text-yellow-500" />}
                                                    {task.status === 'upcoming' && <Calendar className="w-5 h-5 text-blue-500" />}
                                                    <div className="text-sm font-medium">{task.title}</div>
                                                    {task.status === 'completed' && <div className="text-xs text-foreground/50">{task.date}</div>}
                                                    {task.status === 'in-progress' && <div className="text-xs text-yellow-500">{task.timeLeft}</div>}
                                                    {task.status === 'upcoming' && <div className="text-xs text-blue-500">Due in {task.dueDate}</div>}
                                                </div>
                                                <div className="pl-8 text-sm text-foreground/70">
                                                    {task.status === 'completed' && "Task completed successfully. Great job!"}
                                                    {task.status === 'in-progress' && "Currently working on this task. Keep it up!"}
                                                    {task.status === 'upcoming' && "This task is coming up soon. Get ready!"}
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right sidebar */}
                    <div className="w-full md:w-64 border-l border-border/50 bg-background/20 p-4">
                        <div className="text-sm font-semibold text-foreground/80 mb-3">Project Overview</div>

                        <div className="space-y-3">
                            <div className="bg-card/30 p-3 rounded-lg">
                                <div className="text-xs text-foreground/70 mb-1">Total Tasks</div>
                                <div className="text-2xl font-bold">24</div>
                                <div className="text-xs text-green-500 mt-1">+3 this week</div>
                            </div>
                            <div className="bg-card/30 p-3 rounded-lg">
                                <div className="text-xs text-foreground/70 mb-1">Completed</div>
                                <div className="text-2xl font-bold text-green-500">16</div>
                                <div className="text-xs text-green-500 mt-1">67% completion rate</div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="text-sm font-semibold text-foreground/80 mb-3">Upcoming Deadlines</div>
                            <div className="space-y-2">
                                <div className="bg-card/30 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 text-red-500">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-xs font-medium">API Integration</span>
                                    </div>
                                    <div className="text-xs text-foreground/70 mt-1">Due in 2 days</div>
                                </div>
                                <div className="bg-card/30 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 text-yellow-500">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-xs font-medium">UI Testing</span>
                                    </div>
                                    <div className="text-xs text-foreground/70 mt-1">Due in 5 days</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.section>
    );
};

export default Features;