'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SpinnerVariant =
  | 'default'
  | 'dots'
  | 'pulse'
  | 'bars'
  | 'ring'
  | 'dual-ring'
  | 'wave'
  | 'bounce';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface LoadingSpinnerProps {
  variant?: SpinnerVariant;
  size?: SpinnerSize;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'muted';
  className?: string;
  label?: string;
  showLabel?: boolean;
  fullScreen?: boolean;
  overlay?: boolean;
}

const sizeConfig = {
  xs: { size: 'w-3 h-3', text: 'text-xs', gap: 'gap-1' },
  sm: { size: 'w-4 h-4', text: 'text-sm', gap: 'gap-2' },
  md: { size: 'w-6 h-6', text: 'text-base', gap: 'gap-2' },
  lg: { size: 'w-8 h-8', text: 'text-lg', gap: 'gap-3' },
  xl: { size: 'w-12 h-12', text: 'text-xl', gap: 'gap-4' },
};

const colorConfig = {
  primary: 'text-primary',
  secondary: 'text-secondary-foreground',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
  muted: 'text-muted-foreground',
};

// Default Spinner (Lucide icon)
const DefaultSpinner = ({ size, color }: { size: string; color: string }) => (
  <Loader2 className={cn(size, color, 'animate-spin')} />
);

// Dots Spinner
const DotsSpinner = ({ size, color }: { size: string; color: string }) => {
  const dotSize = size.includes('w-3')
    ? 'w-1 h-1'
    : size.includes('w-4')
      ? 'w-1.5 h-1.5'
      : size.includes('w-6')
        ? 'w-2 h-2'
        : size.includes('w-8')
          ? 'w-2.5 h-2.5'
          : 'w-3 h-3';

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className={cn(dotSize, 'rounded-full', color.replace('text-', 'bg-'))}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};

// Pulse Spinner
const PulseSpinner = ({ size, color }: { size: string; color: string }) => (
  <motion.div
    className={cn(size, 'rounded-full border-2', color.replace('text-', 'border-'))}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [1, 0.5, 1],
    }}
    transition={{
      duration: 1,
      repeat: Infinity,
    }}
  />
);

// Bars Spinner
const BarsSpinner = ({ size, color }: { size: string; color: string }) => {
  const barWidth = size.includes('w-3')
    ? 'w-0.5'
    : size.includes('w-4')
      ? 'w-0.5'
      : size.includes('w-6')
        ? 'w-1'
        : size.includes('w-8')
          ? 'w-1'
          : 'w-1.5';

  return (
    <div className={cn('flex items-end space-x-1', size)}>
      {[0, 1, 2, 3].map(i => (
        <motion.div
          key={i}
          className={cn(barWidth, 'rounded-sm', color.replace('text-', 'bg-'))}
          animate={{
            height: ['20%', '100%', '20%'],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};

// Ring Spinner
const RingSpinner = ({ size, color }: { size: string; color: string }) => (
  <div className={cn(size, 'relative')}>
    <div
      className={cn(
        'absolute inset-0 rounded-full border-2 border-transparent',
        color.replace('text-', 'border-t-'),
        'animate-spin'
      )}
    />
    <div
      className={cn(
        'absolute inset-0 rounded-full border-2',
        color.replace('text-', 'border-').replace('border-', 'border-') + '/20'
      )}
    />
  </div>
);

// Dual Ring Spinner
const DualRingSpinner = ({ size, color }: { size: string; color: string }) => (
  <div className={cn(size, 'relative')}>
    <div
      className={cn(
        'absolute inset-0 rounded-full border-2 border-transparent',
        color.replace('text-', 'border-t-'),
        'animate-spin'
      )}
    />
    <div
      className={cn(
        'absolute inset-1 rounded-full border-2 border-transparent',
        color.replace('text-', 'border-b-'),
        'animate-spin',
        '[animation-direction:reverse]'
      )}
    />
  </div>
);

// Wave Spinner
const WaveSpinner = ({ size, color }: { size: string; color: string }) => {
  const dotSize = size.includes('w-3')
    ? 'w-1 h-1'
    : size.includes('w-4')
      ? 'w-1 h-1'
      : size.includes('w-6')
        ? 'w-1.5 h-1.5'
        : size.includes('w-8')
          ? 'w-2 h-2'
          : 'w-2.5 h-2.5';

  return (
    <div className="flex space-x-1">
      {[0, 1, 2, 3, 4].map(i => (
        <motion.div
          key={i}
          className={cn(dotSize, 'rounded-full', color.replace('text-', 'bg-'))}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};

// Bounce Spinner
const BounceSpinner = ({ size, color }: { size: string; color: string }) => {
  const ballSize = size.includes('w-3')
    ? 'w-2 h-2'
    : size.includes('w-4')
      ? 'w-3 h-3'
      : size.includes('w-6')
        ? 'w-4 h-4'
        : size.includes('w-8')
          ? 'w-5 h-5'
          : 'w-6 h-6';

  return (
    <div className="flex space-x-1">
      {[0, 1].map(i => (
        <motion.div
          key={i}
          className={cn(ballSize, 'rounded-full', color.replace('text-', 'bg-'))}
          animate={{
            y: [0, -16, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};

const spinnerComponents = {
  default: DefaultSpinner,
  dots: DotsSpinner,
  pulse: PulseSpinner,
  bars: BarsSpinner,
  ring: RingSpinner,
  'dual-ring': DualRingSpinner,
  wave: WaveSpinner,
  bounce: BounceSpinner,
};

export function LoadingSpinner({
  variant = 'default',
  size = 'md',
  color = 'primary',
  className,
  label = 'Loading...',
  showLabel = false,
  fullScreen = false,
  overlay = false,
}: LoadingSpinnerProps) {
  const sizeClasses = sizeConfig[size];
  const colorClass = colorConfig[color];
  const SpinnerComponent = spinnerComponents[variant];

  const spinnerContent = (
    <div className={cn('flex flex-col items-center justify-center', sizeClasses.gap, className)}>
      <SpinnerComponent size={sizeClasses.size} color={colorClass} />
      {showLabel && (
        <motion.p
          className={cn('theme-text-secondary font-medium', sizeClasses.text)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {label}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center',
          overlay ? 'bg-background/80 backdrop-blur-sm' : 'bg-background'
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {spinnerContent}
      </motion.div>
    );
  }

  if (overlay) {
    return (
      <motion.div
        className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {spinnerContent}
      </motion.div>
    );
  }

  return spinnerContent;
}
