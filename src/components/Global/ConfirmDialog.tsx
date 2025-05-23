'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, CheckCircle, Info, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type ConfirmDialogVariant = 'default' | 'destructive' | 'warning' | 'success' | 'info';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  icon?: React.ReactNode;
  loading?: boolean;
  requireConfirmation?: boolean;
  confirmationText?: string;
  confirmationPlaceholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
  preventClose?: boolean;
}

const variantConfig: Record<
  ConfirmDialogVariant,
  {
    icon: React.ReactNode;
    iconColor: string;
    iconBg: string;
    confirmButtonClass: string;
  }
> = {
  default: {
    icon: <Info className="w-6 h-6" />,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    confirmButtonClass: 'theme-button-primary',
  },
  destructive: {
    icon: <Trash2 className="w-6 h-6" />,
    iconColor: 'text-destructive',
    iconBg: 'bg-destructive/10',
    confirmButtonClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  },
  warning: {
    icon: <AlertTriangle className="w-6 h-6" />,
    iconColor: 'text-warning',
    iconBg: 'bg-warning/10',
    confirmButtonClass: 'bg-warning text-warning-foreground hover:bg-warning/90',
  },
  success: {
    icon: <CheckCircle className="w-6 h-6" />,
    iconColor: 'text-success',
    iconBg: 'bg-success/10',
    confirmButtonClass: 'bg-success text-success-foreground hover:bg-success/90',
  },
  info: {
    icon: <AlertCircle className="w-6 h-6" />,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    confirmButtonClass: 'theme-button-primary',
  },
};

const sizeConfig = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  icon,
  loading = false,
  requireConfirmation = false,
  confirmationText = '',
  confirmationPlaceholder = 'Type to confirm',
  className,
  size = 'md',
  showCloseButton = true,
  preventClose = false,
}: ConfirmDialogProps) {
  const [confirmationInput, setConfirmationInput] = useState('');
  const config = variantConfig[variant];

  const displayIcon = icon || config.icon;
  const isConfirmationValid =
    !requireConfirmation || confirmationInput.toLowerCase() === confirmationText.toLowerCase();

  const handleClose = () => {
    if (loading || preventClose) return;
    setConfirmationInput('');
    onClose();
  };

  const handleConfirm = () => {
    if (!isConfirmationValid || loading) return;
    onConfirm();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dialog */}
          <motion.div
            className={cn(
              'relative w-full theme-surface-elevated rounded-lg theme-shadow-lg border theme-border',
              sizeConfig[size],
              className
            )}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Close Button */}
            {showCloseButton && !preventClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={loading}
                className="absolute top-4 right-4 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}

            {/* Content */}
            <div className="p-6">
              {/* Icon and Title */}
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={cn(
                    'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
                    config.iconBg
                  )}
                >
                  <div className={config.iconColor}>{displayIcon}</div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold theme-text-primary mb-2">{title}</h3>
                  <p className="text-sm theme-text-secondary leading-relaxed">{description}</p>
                </div>
              </div>

              {/* Confirmation Input */}
              {requireConfirmation && (
                <div className="mb-6">
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    Type "{confirmationText}" to confirm:
                  </label>
                  <Input
                    type="text"
                    value={confirmationInput}
                    onChange={e => setConfirmationInput(e.target.value)}
                    placeholder={confirmationPlaceholder}
                    className="theme-input"
                    disabled={loading}
                    autoComplete="off"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading || preventClose}
                  className="theme-button-ghost"
                >
                  {cancelText}
                </Button>

                <Button
                  onClick={handleConfirm}
                  disabled={!isConfirmationValid || loading}
                  className={cn(config.confirmButtonClass, 'min-w-[100px] relative')}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    confirmText
                  )}
                </Button>
              </div>
            </div>

            {/* Loading Overlay */}
            {loading && (
              <motion.div
                className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-lg flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-center gap-3 theme-surface px-4 py-2 rounded-lg theme-shadow">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm theme-text-primary">Processing...</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for easier usage
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Partial<ConfirmDialogProps>>({});

  const openDialog = (dialogConfig: Partial<ConfirmDialogProps>) => {
    setConfig(dialogConfig);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setConfig({});
  };

  const ConfirmDialogComponent = (
    <ConfirmDialog isOpen={isOpen} onClose={closeDialog} onConfirm={() => {}} {...config} />
  );

  return {
    openDialog,
    closeDialog,
    ConfirmDialog: ConfirmDialogComponent,
    isOpen,
  };
}
