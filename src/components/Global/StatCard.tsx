'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'primary' | 'success' | 'destructive' | 'warning' | 'secondary';
  delay?: number;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

const variantStyles = {
  primary: {
    text: 'text-primary',
    bg: 'bg-primary',
    foreground: 'text-primary-foreground',
  },
  success: {
    text: 'text-success',
    bg: 'bg-success',
    foreground: 'text-success-foreground',
  },
  destructive: {
    text: 'text-destructive',
    bg: 'bg-destructive',
    foreground: 'text-destructive-foreground',
  },
  warning: {
    text: 'text-warning',
    bg: 'bg-warning',
    foreground: 'text-warning-foreground',
  },
  secondary: {
    text: 'text-secondary-foreground',
    bg: 'bg-secondary',
    foreground: 'text-secondary-foreground',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  variant = 'primary',
  delay = 0,
  className,
  trend,
  subtitle,
}) => {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -2, scale: 1.02 }}
      className={cn('group', className)}
    >
      <Card className="overflow-hidden theme-surface-elevated theme-shadow-md hover-reveal theme-transition h-full border-0 bg-gradient-to-br from-card to-card/50">
        <CardContent className="p-6 relative">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />

          {/* Hover gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 theme-transition" />

          <div className="relative z-10 flex justify-between items-start">
            <div className="flex-1">
              <p className={cn('text-sm font-medium mb-2', styles.text)}>{title}</p>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-bold theme-text-primary tracking-tight">{value}</p>
                {trend && (
                  <span
                    className={cn(
                      'text-xs font-semibold px-2.5 py-1 rounded-full border',
                      trend.isPositive
                        ? 'bg-success/10 text-success border-success/20'
                        : 'bg-destructive/10 text-destructive border-destructive/20'
                    )}
                  >
                    {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs theme-text-secondary mt-2 font-medium">{subtitle}</p>
              )}
            </div>

            <div
              className={cn(
                'h-16 w-16 rounded-2xl flex items-center justify-center theme-shadow-lg group-hover:scale-110 group-hover:rotate-3 theme-transition relative overflow-hidden',
                styles.bg
              )}
            >
              {/* Icon background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <Icon className={cn('h-8 w-8 relative z-10', styles.foreground)} />
            </div>
          </div>

          {/* Subtle glow effect */}
          <div
            className={cn(
              'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 theme-transition blur-2xl',
              styles.bg
            )}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Grid container for stat cards
interface StatCardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5;
  className?: string;
}

export const StatCardGrid: React.FC<StatCardGridProps> = ({ children, columns = 4, className }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
  };

  return <div className={cn('grid gap-4', gridCols[columns], className)}>{children}</div>;
};

export default StatCard;
