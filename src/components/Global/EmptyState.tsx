'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  FileText,
  Users,
  Calendar,
  Inbox,
  Database,
  FolderOpen,
  Image,
  MessageSquare,
  Bell,
  Settings,
  Plus,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type EmptyStateType =
  | 'search'
  | 'no-data'
  | 'no-results'
  | 'empty-folder'
  | 'no-tasks'
  | 'no-projects'
  | 'no-users'
  | 'no-notifications'
  | 'no-messages'
  | 'no-files'
  | 'no-images'
  | 'error'
  | 'offline'
  | 'maintenance'
  | 'custom';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  icon?: React.ReactNode;
}

export interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: EmptyStateAction[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showBackground?: boolean;
}

const emptyStateConfig: Record<
  EmptyStateType,
  {
    title: string;
    description: string;
    icon: React.ReactNode;
  }
> = {
  search: {
    title: 'No search results',
    description: "Try adjusting your search terms or filters to find what you're looking for.",
    icon: <Search className="w-full h-full" />,
  },
  'no-data': {
    title: 'No data available',
    description: "There's no data to display at the moment. Check back later or try refreshing.",
    icon: <Database className="w-full h-full" />,
  },
  'no-results': {
    title: 'No results found',
    description:
      "Your search didn't return any results. Try different keywords or clear your filters.",
    icon: <Search className="w-full h-full" />,
  },
  'empty-folder': {
    title: 'This folder is empty',
    description: 'Start by adding some files or creating new content in this folder.',
    icon: <FolderOpen className="w-full h-full" />,
  },
  'no-tasks': {
    title: 'No tasks yet',
    description: 'Create your first task to get started with project management.',
    icon: <FileText className="w-full h-full" />,
  },
  'no-projects': {
    title: 'No projects found',
    description: 'Start by creating your first project to organize your work.',
    icon: <FolderOpen className="w-full h-full" />,
  },
  'no-users': {
    title: 'No team members',
    description: 'Invite team members to collaborate on your projects.',
    icon: <Users className="w-full h-full" />,
  },
  'no-notifications': {
    title: 'No notifications',
    description: "You're all caught up! New notifications will appear here.",
    icon: <Bell className="w-full h-full" />,
  },
  'no-messages': {
    title: 'No messages',
    description: 'Start a conversation or wait for new messages to appear.',
    icon: <MessageSquare className="w-full h-full" />,
  },
  'no-files': {
    title: 'No files uploaded',
    description: 'Upload your first file to get started.',
    icon: <FileText className="w-full h-full" />,
  },
  'no-images': {
    title: 'No images found',
    description: 'Upload some images to see them displayed here.',
    icon: <Image className="w-full h-full" />,
  },
  error: {
    title: 'Something went wrong',
    description: 'We encountered an error while loading this content. Please try again.',
    icon: <RefreshCw className="w-full h-full" />,
  },
  offline: {
    title: "You're offline",
    description: 'Check your internet connection and try again.',
    icon: <RefreshCw className="w-full h-full" />,
  },
  maintenance: {
    title: 'Under maintenance',
    description: "This feature is temporarily unavailable. We'll be back soon!",
    icon: <Settings className="w-full h-full" />,
  },
  custom: {
    title: 'Empty',
    description: 'No content available.',
    icon: <Inbox className="w-full h-full" />,
  },
};

const sizeConfig = {
  sm: {
    container: 'py-8',
    icon: 'w-12 h-12',
    title: 'text-base',
    description: 'text-sm',
    maxWidth: 'max-w-sm',
  },
  md: {
    container: 'py-12',
    icon: 'w-16 h-16',
    title: 'text-lg',
    description: 'text-sm',
    maxWidth: 'max-w-md',
  },
  lg: {
    container: 'py-16',
    icon: 'w-20 h-20',
    title: 'text-xl',
    description: 'text-base',
    maxWidth: 'max-w-lg',
  },
};

export function EmptyState({
  type = 'no-data',
  title,
  description,
  icon,
  actions = [],
  className,
  size = 'md',
  animated = true,
  showBackground = true,
}: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const sizeClasses = sizeConfig[size];

  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayIcon = icon || config.icon;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizeClasses.container,
        className
      )}
      variants={animated ? containerVariants : undefined}
      initial={animated ? 'hidden' : undefined}
      animate={animated ? 'visible' : undefined}
    >
      {/* Background Pattern */}
      {showBackground && (
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="bg-grid-pattern w-full h-full" />
        </div>
      )}

      {/* Icon */}
      <motion.div
        className={cn(
          'relative mb-6 rounded-full theme-surface flex items-center justify-center theme-shadow-sm',
          sizeClasses.icon,
          'p-4'
        )}
        variants={animated ? itemVariants : undefined}
      >
        <div className="theme-text-secondary">{displayIcon}</div>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 theme-transition" />
      </motion.div>

      {/* Content */}
      <motion.div
        className={cn('space-y-3', sizeClasses.maxWidth)}
        variants={animated ? itemVariants : undefined}
      >
        <h3 className={cn('font-semibold theme-text-primary', sizeClasses.title)}>
          {displayTitle}
        </h3>

        <p className={cn('theme-text-secondary leading-relaxed', sizeClasses.description)}>
          {displayDescription}
        </p>
      </motion.div>

      {/* Actions */}
      {actions.length > 0 && (
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-3 mt-8"
          variants={animated ? itemVariants : undefined}
        >
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              onClick={action.onClick}
              className={cn('min-w-[120px]', index === 0 && 'theme-button-primary')}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
        </motion.div>
      )}

      {/* Floating elements for visual interest */}
      {animated && showBackground && (
        <>
          <motion.div
            className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full"
            animate={{
              y: [0, -10, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: 0,
            }}
          />
          <motion.div
            className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-secondary/20 rounded-full"
            animate={{
              y: [0, -8, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 1,
            }}
          />
          <motion.div
            className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-accent/30 rounded-full"
            animate={{
              y: [0, -6, 0],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: 2,
            }}
          />
        </>
      )}
    </motion.div>
  );
}
