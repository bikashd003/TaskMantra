import React, { useState } from 'react';
import { LayoutDashboard, Calendar, Users, ClipboardList, Menu, X } from 'lucide-react';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out
        w-72 bg-white border-r border-gray-200
        overflow-y-auto
      `}>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-xl">T</span>
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                            TaskFlow
                        </h1>
                    </div>

                    <nav className="space-y-2">
                        <NavItem icon={<LayoutDashboard size={20} />} text="Dashboard" active />
                        <NavItem icon={<ClipboardList size={20} />} text="Projects" />
                        <NavItem icon={<Calendar size={20} />} text="Schedule" />
                        <NavItem icon={<Users size={20} />} text="Teams" />
                    </nav>
                </div>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-30"
                    onClick={toggleSidebar}
                />
            )}
        </>
    );
};

interface NavItemProps {
    icon: React.ReactNode;
    text: string;
    active?: boolean;
}

const NavItem = ({ icon, text, active }: NavItemProps) => (
    <a
        href="#"
        className={`
      flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
      ${active
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                : 'text-gray-600 hover:bg-gray-50'
            }
    `}
    >
        {icon}
        <span className="font-medium">{text}</span>
    </a>
);

export default Sidebar;