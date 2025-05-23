'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Shield,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusType =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'pending'
  | 'active'
  | 'inactive'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'draft'
  | 'published'
  | 'archived'
  | 'priority-high'
  | 'priority-medium'
  | 'priority-low'
  | 'trending-up'
  | 'trending-down'
  | 'neutral';

export type BadgeVariant = 'default' | 'outline' | 'filled' | 'dot' | 'pill';
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface StatusBadgeProps {
  status: StatusType;
  variant?: BadgeVariant;
  size?: BadgeSize;
  label?: string;
  showIcon?: boolean;
  animated?: boolean;
  pulse?: boolean;
  className?: string;
  onClick?: () => void;
  customIcon?: React.ReactNode;
  customColor?: string;
}

const statusConfig: Record<
  StatusType,
  {
    label: string;
    icon: React.ReactNode;
    colorClass: string;
    bgClass: string;
    borderClass: string;
  }
> = {
  success: {
    label: 'Success',
    icon: <CheckCircle className="w-full h-full" />,
    colorClass: 'text-success',
    bgClass: 'bg-success/20',
    borderClass: 'border-success/30',
  },
  warning: {
    label: 'Warning',
    icon: <AlertCircle className="w-full h-full" />,
    colorClass: 'text-warning',
    bgClass: 'bg-warning/20',
    borderClass: 'border-warning/30',
  },
  error: {
    label: 'Error',
    icon: <XCircle className="w-full h-full" />,
    colorClass: 'text-destructive',
    bgClass: 'bg-destructive/20',
    borderClass: 'border-destructive/30',
  },
  info: {
    label: 'Info',
    icon: <AlertCircle className="w-full h-full" />,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/20',
    borderClass: 'border-primary/30',
  },
  pending: {
    label: 'Pending',
    icon: <Clock className="w-full h-full" />,
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted/50',
    borderClass: 'border-muted',
  },
  active: {
    label: 'Active',
    icon: <Play className="w-full h-full" />,
    colorClass: 'text-success',
    bgClass: 'bg-success/20',
    borderClass: 'border-success/30',
  },
  inactive: {
    label: 'Inactive',
    icon: <Pause className="w-full h-full" />,
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted/50',
    borderClass: 'border-muted',
  },
  processing: {
    label: 'Processing',
    icon: <RotateCcw className="w-full h-full animate-spin" />,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/20',
    borderClass: 'border-primary/30',
  },
  completed: {
    label: 'Completed',
    icon: <CheckCircle className="w-full h-full" />,
    colorClass: 'text-success',
    bgClass: 'bg-success/20',
    borderClass: 'border-success/30',
  },
  cancelled: {
    label: 'Cancelled',
    icon: <XCircle className="w-full h-full" />,
    colorClass: 'text-destructive',
    bgClass: 'bg-destructive/20',
    borderClass: 'border-destructive/30',
  },
  draft: {
    label: 'Draft',
    icon: <Minus className="w-full h-full" />,
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted/50',
    borderClass: 'border-muted',
  },
  published: {
    label: 'Published',
    icon: <Zap className="w-full h-full" />,
    colorClass: 'text-success',
    bgClass: 'bg-success/20',
    borderClass: 'border-success/30',
  },
  archived: {
    label: 'Archived',
    icon: <Shield className="w-full h-full" />,
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted/50',
    borderClass: 'border-muted',
  },
  'priority-high': {
    label: 'High Priority',
    icon: <Star className="w-full h-full" />,
    colorClass: 'text-destructive',
    bgClass: 'bg-destructive/20',
    borderClass: 'border-destructive/30',
  },
  'priority-medium': {
    label: 'Medium Priority',
    icon: <Star className="w-full h-full" />,
    colorClass: 'text-warning',
    bgClass: 'bg-warning/20',
    borderClass: 'border-warning/30',
  },
  'priority-low': {
    label: 'Low Priority',
    icon: <Star className="w-full h-full" />,
    colorClass: 'text-success',
    bgClass: 'bg-success/20',
    borderClass: 'border-success/30',
  },
  'trending-up': {
    label: 'Trending Up',
    icon: <TrendingUp className="w-full h-full" />,
    colorClass: 'text-success',
    bgClass: 'bg-success/20',
    borderClass: 'border-success/30',
  },
  'trending-down': {
    label: 'Trending Down',
    icon: <TrendingDown className="w-full h-full" />,
    colorClass: 'text-destructive',
    bgClass: 'bg-destructive/20',
    borderClass: 'border-destructive/30',
  },
  neutral: {
    label: 'Neutral',
    icon: <Minus className="w-full h-full" />,
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted/50',
    borderClass: 'border-muted',
  },
};

const sizeConfig = {
  xs: {
    container: 'h-5 px-1.5 text-xs',
    icon: 'w-2.5 h-2.5',
    dot: 'w-1.5 h-1.5',
    gap: 'gap-1',
  },
  sm: {
    container: 'h-6 px-2 text-xs',
    icon: 'w-3 h-3',
    dot: 'w-2 h-2',
    gap: 'gap-1.5',
  },
  md: {
    container: 'h-7 px-2.5 text-sm',
    icon: 'w-3.5 h-3.5',
    dot: 'w-2.5 h-2.5',
    gap: 'gap-2',
  },
  lg: {
    container: 'h-8 px-3 text-sm',
    icon: 'w-4 h-4',
    dot: 'w-3 h-3',
    gap: 'gap-2',
  },
};

export function StatusBadge({
  status,
  variant = 'default',
  size = 'sm',
  label,
  showIcon = true,
  animated = false,
  pulse = false,
  className,
  onClick,
  customIcon,
  customColor,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses = sizeConfig[size];

  const displayLabel = label || config.label;
  const icon = customIcon || config.icon;

  const getVariantClasses = () => {
    const baseClasses = 'inline-flex items-center font-medium rounded-full theme-transition';

    switch (variant) {
      case 'outline':
        return cn(
          baseClasses,
          'border bg-transparent',
          customColor
            ? `text-[${customColor}] border-[${customColor}]/30`
            : `${config.colorClass} ${config.borderClass}`
        );
      case 'filled':
        return cn(
          baseClasses,
          'border-transparent text-white',
          customColor ? `bg-[${customColor}]` : config.colorClass.replace('text-', 'bg-')
        );
      case 'dot':
        return cn(
          baseClasses,
          'bg-transparent border-transparent',
          customColor ? `text-[${customColor}]` : config.colorClass
        );
      case 'pill':
        return cn(
          baseClasses,
          'rounded-full',
          customColor
            ? `${customColor} bg-[${customColor}]/20`
            : `${config.colorClass} ${config.bgClass}`
        );
      default:
        return cn(
          baseClasses,
          customColor
            ? `text-[${customColor}] bg-[${customColor}]/20`
            : `${config.colorClass} ${config.bgClass}`
        );
    }
  };

  const badgeContent = (
    <>
      {variant === 'dot' ? (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'rounded-full',
              sizeClasses.dot,
              customColor ? `bg-[${customColor}]` : config.colorClass.replace('text-', 'bg-'),
              pulse && 'animate-pulse'
            )}
          />
          <span>{displayLabel}</span>
        </div>
      ) : (
        <div className={cn('flex items-center', sizeClasses.gap)}>
          {showIcon && (
            <div className={cn(sizeClasses.icon, animated && 'animate-pulse')}>{icon}</div>
          )}
          <span>{displayLabel}</span>
        </div>
      )}
    </>
  );

  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      className={cn(
        getVariantClasses(),
        sizeClasses.container,
        onClick && 'cursor-pointer hover:scale-105 active:scale-95',
        pulse && 'animate-pulse',
        className
      )}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      initial={animated ? { opacity: 0, scale: 0.8 } : undefined}
      animate={animated ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {badgeContent}
    </Component>
  );
}
