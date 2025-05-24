'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  height?: string;
  delay?: number;
  className?: string;
  headerActions?: React.ReactNode;
  loading?: boolean;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  icon: Icon,
  children,
  height = 'h-[300px]',
  delay = 0,
  className,
  headerActions,
  loading = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn('h-full', className)}
    >
      <Card className="theme-surface-elevated theme-shadow-md h-full glow-on-hover theme-transition">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {Icon && (
                <div className="h-8 w-8 theme-surface-elevated rounded-lg flex items-center justify-center theme-shadow-sm">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              )}
              <div>
                <CardTitle className="text-lg font-semibold theme-text-primary flex items-center gap-2">
                  {title}
                </CardTitle>
                {description && (
                  <CardDescription className="theme-text-secondary">{description}</CardDescription>
                )}
              </div>
            </div>
            {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className={cn('w-full flex items-center justify-center', height)}>
              <div className="loading-skeleton w-full h-full rounded-lg" />
            </div>
          ) : (
            <ScrollArea className={height}>
              <div className={cn('w-full', height)}>{children}</div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Section header component for analytics sections
interface SectionHeaderProps {
  title: string;
  icon: LucideIcon;
  description?: string;
  actions?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  icon: Icon,
  description,
  actions,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 theme-surface-elevated rounded-lg flex items-center justify-center theme-shadow-sm">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold theme-text-primary">{title}</h2>
          {description && <p className="text-sm theme-text-secondary">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

export default ChartCard;
