"use client";
import React, { useEffect, useState } from 'react';
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
    const [isMobile, setIsMobile] = useState(false);
    const pathname = usePathname();

    const menuItems = [
        {
            label: "Main",
            items: [
              { icon: Home, label: "Home", path: "/home" },
              {
                icon: SquareChartGantt,
                label: "Projects",
                path: "/projects",
                subItems: [
                  { label: "Project Alpha", path: "/projects/alpha" },
                  { label: "Project Beta", path: "/projects/beta" },
                  { label: "Project Gamma", path: "/projects/gamma" },
                ],
              },
            ],
          },
          {
            label: "Work",
            items: [
              { icon: ClipboardCheck, label: "Tasks", path: "/tasks" },
              { icon: Calendar, label: "Calendar", path: "/calendar" },
            ],
          },
          {
            label: "Settings",
            items: [
              {
                icon: MessageSquare,
                label: "Feedback",
                path: "/feedback",
                badge: "BETA",
              },
              { icon: Settings, label: "Settings", path: "/settings" },
            ],
          },
    ];
    useEffect(() => {
        window.addEventListener('resize', () => {
            if (window.innerWidth < 768) {
                setIsMobile(true);
            } else {
                setIsMobile(false);
            }
        });
        return () => {
            window.removeEventListener('resize', () => {
                if (window.innerWidth < 768) {
                    setIsMobile(true);
                } else {
                    setIsMobile(false);
                }
            });
        }
    }, []);

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
                    ${isMobile ? 'md:w-60 fixed' : ''}
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
                <nav className="flex-1 px-3 py-4 space-y-4">
          {menuItems.map((group) => (
            <div key={group.label}>
              {isExpanded && <div className="text-gray-400 text-xs uppercase font-semibold px-2 mb-2">
                {group.label}
              </div>}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <SidebarItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    badge={item.badge}
                    isExpanded={isExpanded}
                    isActive={pathname === item.path}
                    path={item.path}
                    subItems={item.subItems}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

                <UserProfile isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
            </aside>
        </>
    );
}