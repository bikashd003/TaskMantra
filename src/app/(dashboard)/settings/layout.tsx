import React from 'react';
import { SidebarNav } from '@/components/Settings/sidebar-nav';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="w-full relative flex gap-8 px-2 py-4 md:py-6 md:px-4 theme-surface-elevated theme-shadow-sm rounded-lg max-h-[calc(100vh-96px)] overflow-hidden">
      <div className="max-w-[240px] flex-shrink-0 theme-shadow-sm rounded-lg h-full">
        <SidebarNav />
      </div>
      <ScrollArea className="flex-1 theme-scrollbar">{children}</ScrollArea>
    </div>
  );
}
