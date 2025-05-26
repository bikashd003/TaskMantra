'use client';
import React, { useEffect } from 'react';
import {
  Home,
  MessageSquare,
  Settings,
  X,
  SquareChartGantt,
  ClipboardCheck,
  Calendar,
  ServerCog,
  Bell,
  BarChart3,
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { UserProfile } from './UserProfile';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { useQuery } from '@tanstack/react-query';
import { ProjectService } from '@/services/Project.service';
import { useProjectStore } from '@/stores/projectsStore';
import { useSidebarStore } from '@/stores/sidebarStore';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const { isExpanded, setIsExpanded } = useSidebarStore();
  const pathname = usePathname();
  const { projects, setProjects } = useProjectStore();

  const { data } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await ProjectService.getProjects();
      return response;
    },
  });

  useEffect(() => {
    if (data?.projects) {
      setProjects(data.projects);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const menuItems = [
    {
      label: 'Main',
      items: [
        { icon: Home, label: 'Home', path: '/home' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        {
          icon: SquareChartGantt,
          label: 'Projects',
          subItems: [
            { label: 'Create Project +', path: '/projects' },
            ...(projects?.map((project: any) => ({
              label: project?.name,
              path: `/projects/${project?._id}`,
            })) || []),
          ],
        },
      ],
    },
    {
      label: 'Work',
      items: [
        { icon: ClipboardCheck, label: 'Tasks', path: '/tasks' },
        { icon: Calendar, label: 'Calendar', path: '/calendar' },
        { icon: SquareChartGantt, label: 'Timeline', path: '/timeline' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics' },
      ],
    },
    {
      label: 'Settings',
      items: [
        {
          icon: MessageSquare,
          label: 'Feedback',
          path: '/feedback',
        },
        { icon: ServerCog, label: 'Integrations', path: '/integrations', badge: 'BETA' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/80 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`
                    sidebar sidebar-container
                    top-0 left-0 z-50 h-full
                    flex flex-col theme-shadow-md border-r
                    ${isExpanded ? '' : 'collapsed'}
                    ${isMobileOpen ? 'mobile-open' : ''}
                `}
      >
        {/* Mobile Close Button */}
        <button
          className="absolute top-4 right-4 p-1.5 rounded-full theme-button-ghost md:hidden"
          onClick={onMobileClose}
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5 theme-text-secondary" />
        </button>
        <Logo isExpanded={isExpanded} />

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto theme-scrollbar">
          {menuItems.map(group => (
            <div key={group.label}>
              {isExpanded && <div className="sidebar-section-label px-2 mb-2.5">{group.label}</div>}
              <div className="space-y-1">
                {group.items.map((item: any) => (
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
        </div>

        <UserProfile isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      </aside>
    </>
  );
}
