'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type ProgressVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'gradient'
  | 'striped';

export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  showLabel?: boolean;
  showPercentage?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  className?: string;
  barClassName?: string;
  labelClassName?: string;
  indeterminate?: boolean;
  color?: string;
  backgroundColor?: string;
}

const variantConfig: Record<
  ProgressVariant,
  {
    barClass: string;
    bgClass: string;
  }
> = {
  default: {
    barClass: 'bg-primary',
    bgClass: 'bg-primary/20',
  },
  success: {
    barClass: 'bg-success',
    bgClass: 'bg-success/20',
  },
  warning: {
    barClass: 'bg-warning',
    bgClass: 'bg-warning/20',
  },
  destructive: {
    barClass: 'bg-destructive',
    bgClass: 'bg-destructive/20',
  },
  gradient: {
    barClass: 'bg-gradient-to-r from-primary via-purple-500 to-pink-500',
    bgClass: 'bg-muted',
  },
  striped: {
    barClass: 'bg-primary',
    bgClass: 'bg-primary/20',
  },
};

const sizeConfig = {
  xs: {
    height: 'h-1',
    text: 'text-xs',
    spacing: 'mb-1',
  },
  sm: {
    height: 'h-2',
    text: 'text-xs',
    spacing: 'mb-1',
  },
  md: {
    height: 'h-3',
    text: 'text-sm',
    spacing: 'mb-2',
  },
  lg: {
    height: 'h-4',
    text: 'text-sm',
    spacing: 'mb-2',
  },
};

export function ProgressBar({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  showPercentage = false,
  label,
  animated = true,
  striped = false,
  className,
  barClassName,
  labelClassName,
  indeterminate = false,
  color,
  backgroundColor,
}: ProgressBarProps) {
  const config = variantConfig[variant];
  const sizeClasses = sizeConfig[size];

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const displayLabel = label || `${Math.round(percentage)}%`;

  const stripedPattern = striped || variant === 'striped';

  return (
    <div className={cn('w-full', className)}>
      {/* Label and Percentage */}
      {(showLabel || showPercentage) && (
        <div className={cn('flex items-center justify-between', sizeClasses.spacing)}>
          {showLabel && (
            <span
              className={cn('font-medium theme-text-primary', sizeClasses.text, labelClassName)}
            >
              {displayLabel}
            </span>
          )}
          {showPercentage && (
            <span className={cn('font-medium theme-text-secondary', sizeClasses.text)}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar Container */}
      <div
        className={cn(
          'relative overflow-hidden rounded-full',
          sizeClasses.height,
          backgroundColor || config.bgClass
        )}
      >
        {/* Progress Bar Fill */}
        {indeterminate ? (
          <motion.div
            className={cn(
              'absolute top-0 left-0 h-full rounded-full',
              color || config.barClass,
              stripedPattern && 'bg-stripes',
              barClassName
            )}
            style={{ width: '30%' }}
            animate={{
              x: ['-100%', '400%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ) : (
          <motion.div
            className={cn(
              'h-full rounded-full relative overflow-hidden',
              color || config.barClass,
              stripedPattern && 'bg-stripes',
              barClassName
            )}
            initial={animated ? { width: 0 } : { width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={
              animated
                ? {
                    duration: 0.8,
                    ease: 'easeOut',
                    delay: 0.1,
                  }
                : undefined
            }
          >
            {/* Striped Animation */}
            {stripedPattern && (
              <motion.div
                className="absolute inset-0 bg-stripes-animated"
                animate={{
                  x: ['0%', '100%'],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            )}

            {/* Shine Effect */}
            {animated && !indeterminate && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  duration: 1.5,
                  delay: 0.5,
                  ease: 'easeInOut',
                }}
              />
            )}
          </motion.div>
        )}

        {/* Pulse Effect for Active Progress */}
        {animated && percentage > 0 && percentage < 100 && !indeterminate && (
          <motion.div
            className={cn(
              'absolute top-0 right-0 h-full w-1 rounded-full',
              color || config.barClass,
              'opacity-60'
            )}
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>

      {/* Additional Info */}
      {value !== undefined && max !== undefined && !showPercentage && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs theme-text-secondary">
            {value} / {max}
          </span>
        </div>
      )}
    </div>
  );
}

// Multi-step Progress Bar
export interface MultiStepProgressProps {
  steps: Array<{
    label: string;
    completed: boolean;
    active?: boolean;
  }>;
  className?: string;
  size?: ProgressSize;
  variant?: ProgressVariant;
}

export function MultiStepProgress({
  steps,
  className,
  size = 'md',
  variant = 'default',
}: MultiStepProgressProps) {
  const config = variantConfig[variant];
  const sizeClasses = sizeConfig[size];

  const completedSteps = steps.filter(step => step.completed).length;
  const percentage = (completedSteps / steps.length) * 100;

  return (
    <div className={cn('w-full', className)}>
      {/* Steps */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <motion.div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 theme-transition',
                step.completed
                  ? `${config.barClass} border-transparent text-white`
                  : step.active
                    ? `border-primary bg-primary/10 text-primary`
                    : `border-muted bg-background theme-text-secondary`
              )}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {step.completed ? '✓' : index + 1}
            </motion.div>
            <span
              className={cn(
                'mt-2 text-center max-w-[80px] leading-tight',
                sizeClasses.text,
                step.completed || step.active
                  ? 'theme-text-primary font-medium'
                  : 'theme-text-secondary'
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <ProgressBar value={percentage} variant={variant} size={size} animated showPercentage />
    </div>
  );
}

// Circular Progress
export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: ProgressVariant;
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'default',
  showLabel = true,
  label,
  className,
  animated = true,
}: CircularProgressProps) {
  const config = variantConfig[variant];
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="theme-text-secondary opacity-20"
        />

        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={config.barClass.replace('bg-', 'text-')}
          initial={animated ? { strokeDashoffset: circumference } : undefined}
          animate={{ strokeDashoffset }}
          transition={animated ? { duration: 1, ease: 'easeOut' } : undefined}
          style={{
            strokeDasharray,
            strokeDashoffset: animated ? undefined : strokeDashoffset,
          }}
        />
      </svg>

      {/* Label */}
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold theme-text-primary">
              {label || `${Math.round(percentage)}%`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
