"use client";
import React, { useState } from 'react';
import {
    Home,
    MessageSquare,
    Settings,
    X,
    SquareChartGantt,
    ClipboardCheck,
    Calendar
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { UserProfile } from './UserProfile';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

interface SidebarProps {
    isMobileOpen: boolean;
    onMobileClose: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const pathname = usePathname();

    const menuItems = [
        { icon: Home, label: 'Home', path: '/home' },
        { icon: SquareChartGantt, label: 'Projects', path: '/projects' },
        { icon: ClipboardCheck, label: 'Tasks', path: '/tasks' },
        { icon: Calendar, label: 'Calendar', path: '/calendar' },
        { icon: MessageSquare, label: 'Feedback', path: '/feedback', badge: 'BETA' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    top-0 left-0 z-50 h-full bg-gray-900 text-white
                    flex flex-col
                    transition-all duration-300 ease-in-out
                    ${isExpanded ? 'w-60' : 'w-[70px]'}
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0
                `}
            >
                {/* Mobile Close Button */}
                <button
                    className="absolute top-4 right-4 p-1 md:hidden"
                    onClick={onMobileClose}
                    aria-label="Close sidebar"
                >
                    <X className="h-6 w-6" />
                </button>
                <Logo isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

                {/* Navigation Items */}
                <nav className="flex-1 px-3 py-4">
                    {menuItems.map((item) => (
                        <SidebarItem
                            key={item.label}
                            icon={item.icon}
                            label={item.label}
                            badge={item.badge}
                            isExpanded={isExpanded}
                            isActive={pathname === item.path}
                            path={item.path}
                        />
                    ))}
                </nav>

                <UserProfile isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
            </aside>
        </>
    );
}