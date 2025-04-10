import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
  position?: 'center' | 'top';
  preventScroll?: boolean;
}

const sizeClasses = {
  sm: 'w-full max-w-sm',
  md: 'w-full max-w-md',
  lg: 'w-full max-w-lg',
  xl: 'w-full max-w-xl',
  full: 'w-[95vw] h-[95vh]'
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  size = 'md',
  showCloseButton = true,
  closeOnOutsideClick = true,
  position = 'center',
  preventScroll = true
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (preventScroll && isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, preventScroll]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 h-full w-full"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />
          <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="min-h-full flex items-center justify-center p-4">
              <motion.div
                role="dialog"
                aria-modal="true"
                initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? -20 : 0 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? -20 : 0 }}
                transition={{ 
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className={cn(
                  sizeClasses[size],
                  'relative transform overflow-hidden',
                  'bg-white dark:bg-gray-900',
                  'rounded-lg shadow-[0_0_50px_-12px_rgb(0,0,0,0.25)]',
                  'border border-gray-200 dark:border-gray-800',
                  className
                )}
              >
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={cn(
                      'absolute right-4 top-4 z-10',
                      'p-2 rounded-full',
                      'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                      'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
                      'transition-colors duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                    )}
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                <div className="p-6">
                  {children}
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;