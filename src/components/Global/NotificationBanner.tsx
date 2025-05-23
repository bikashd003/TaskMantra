'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Megaphone,
  Star,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type NotificationVariant =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'announcement'
  | 'feature'
  | 'update';

export type NotificationPosition =
  | 'top'
  | 'bottom'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
}

export interface NotificationBannerProps {
  id?: string;
  variant?: NotificationVariant;
  title?: string;
  message: string;
  position?: NotificationPosition;
  dismissible?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
  onDismiss?: () => void;
  className?: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
  animated?: boolean;
}

const variantConfig: Record<
  NotificationVariant,
  {
    icon: React.ReactNode;
    colorClass: string;
    bgClass: string;
    borderClass: string;
    iconBg: string;
  }
> = {
  info: {
    icon: <Info className="w-5 h-5" />,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10',
    borderClass: 'border-primary/20',
    iconBg: 'bg-primary/15',
  },
  success: {
    icon: <CheckCircle className="w-5 h-5" />,
    colorClass: 'text-success',
    bgClass: 'bg-success/10',
    borderClass: 'border-success/20',
    iconBg: 'bg-success/15',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    colorClass: 'text-warning',
    bgClass: 'bg-warning/10',
    borderClass: 'border-warning/20',
    iconBg: 'bg-warning/15',
  },
  error: {
    icon: <AlertCircle className="w-5 h-5" />,
    colorClass: 'text-destructive',
    bgClass: 'bg-destructive/10',
    borderClass: 'border-destructive/20',
    iconBg: 'bg-destructive/15',
  },
  announcement: {
    icon: <Megaphone className="w-5 h-5" />,
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-50 dark:bg-purple-900/20',
    borderClass: 'border-purple-200 dark:border-purple-800',
    iconBg: 'bg-purple-100 dark:bg-purple-800/30',
  },
  feature: {
    icon: <Star className="w-5 h-5" />,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-900/20',
    borderClass: 'border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-800/30',
  },
  update: {
    icon: <Zap className="w-5 h-5" />,
    colorClass: 'text-orange-600 dark:text-orange-400',
    bgClass: 'bg-orange-50 dark:bg-orange-900/20',
    borderClass: 'border-orange-200 dark:border-orange-800',
    iconBg: 'bg-orange-100 dark:bg-orange-800/30',
  },
};

const positionConfig: Record<
  NotificationPosition,
  {
    containerClass: string;
    motionProps: {
      initial: any;
      animate: any;
      exit: any;
    };
  }
> = {
  top: {
    containerClass: 'top-4 left-1/2 transform -translate-x-1/2',
    motionProps: {
      initial: { opacity: 0, y: -50, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -50, scale: 0.95 },
    },
  },
  bottom: {
    containerClass: 'bottom-4 left-1/2 transform -translate-x-1/2',
    motionProps: {
      initial: { opacity: 0, y: 50, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: 50, scale: 0.95 },
    },
  },
  'top-left': {
    containerClass: 'top-4 left-4',
    motionProps: {
      initial: { opacity: 0, x: -50, scale: 0.95 },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { opacity: 0, x: -50, scale: 0.95 },
    },
  },
  'top-right': {
    containerClass: 'top-4 right-4',
    motionProps: {
      initial: { opacity: 0, x: 50, scale: 0.95 },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { opacity: 0, x: 50, scale: 0.95 },
    },
  },
  'bottom-left': {
    containerClass: 'bottom-4 left-4',
    motionProps: {
      initial: { opacity: 0, x: -50, scale: 0.95 },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { opacity: 0, x: -50, scale: 0.95 },
    },
  },
  'bottom-right': {
    containerClass: 'bottom-4 right-4',
    motionProps: {
      initial: { opacity: 0, x: 50, scale: 0.95 },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { opacity: 0, x: 50, scale: 0.95 },
    },
  },
};

export function NotificationBanner({
  variant = 'info',
  title,
  message,
  position = 'top-right',
  dismissible = true,
  autoHide = false,
  autoHideDelay = 5000,
  persistent = false,
  actions = [],
  onDismiss,
  className,
  icon,
  showIcon = true,
  animated = true,
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const config = variantConfig[variant];
  const posConfig = positionConfig[position];

  const displayIcon = icon || config.icon;

  // Auto-hide functionality
  useEffect(() => {
    if (autoHide && !persistent && autoHideDelay > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoHide, persistent, autoHideDelay]);

  const handleDismiss = () => {
    if (!dismissible && !autoHide) return;

    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 200); // Wait for exit animation
  };

  if (!isVisible) return null;

  return (
    <div className={cn('fixed z-50 max-w-md w-full', posConfig.containerClass)}>
      <AnimatePresence>
        <motion.div
          className={cn(
            'relative overflow-hidden rounded-lg border theme-shadow-lg backdrop-blur-sm',
            config.bgClass,
            config.borderClass,
            className
          )}
          {...(animated ? posConfig.motionProps : {})}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Progress bar for auto-hide */}
          {autoHide && !persistent && (
            <motion.div
              className={cn('absolute top-0 left-0 h-1', config.colorClass.replace('text-', 'bg-'))}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: autoHideDelay / 1000, ease: 'linear' }}
            />
          )}

          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              {showIcon && (
                <div
                  className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                    config.iconBg
                  )}
                >
                  <div className={config.colorClass}>{displayIcon}</div>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                {title && (
                  <h4 className="text-sm font-semibold theme-text-primary mb-1">{title}</h4>
                )}
                <p className="text-sm theme-text-secondary leading-relaxed">{message}</p>

                {/* Actions */}
                {actions.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    {actions.map((action, index) => (
                      <Button
                        key={index}
                        variant={action.variant || 'outline'}
                        size="sm"
                        onClick={action.onClick}
                        className="h-7 px-3 text-xs"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dismiss Button */}
              {dismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="flex-shrink-0 h-6 w-6 p-0 theme-text-secondary hover:theme-text-primary"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Decorative elements */}
          {variant === 'announcement' && (
            <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full transform rotate-45 scale-150" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Notification Manager Hook
export function useNotifications() {
  const [notifications, setNotifications] = useState<
    Array<NotificationBannerProps & { id: string }>
  >([]);

  const addNotification = (notification: Omit<NotificationBannerProps, 'id' | 'onDismiss'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = {
      ...notification,
      id,
      onDismiss: () => removeNotification(id),
    };

    setNotifications(prev => [...prev, newNotification]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const NotificationContainer = () => (
    <>
      {notifications.map(notification => (
        <NotificationBanner key={notification.id} {...notification} />
      ))}
    </>
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    NotificationContainer,
  };
}
