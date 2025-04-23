import React, { useState, useEffect, ReactNode } from 'react';
import { X, Heart, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '../ui/scroll-area';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  onFavorite?: () => void;
  className?: string;
}

export const RightSidebar = ({
  isOpen,
  onClose,
  title = 'Details',
  children,
  onEdit,
  onDelete,
  onFavorite,
  className,
}: SidebarProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsClosing(true);
      const timer = setTimeout(() => setIsClosing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    onFavorite?.();
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();

    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-black/10"
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 200,
            }}
            className={cn(
              'fixed right-4 top-4 bottom-4 w-[450px] max-w-[calc(100vw-32px)] bg-white shadow-[0_0_15px_rgba(0,0,0,0.1)] border-l border-gray-200/70 rounded-lg',
              className
            )}
            onClick={e => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between px-6 py-4 border-b border-gray-200/70"
            >
              <h2 className="text-lg font-medium text-gray-900">{title}</h2>
              <div className="flex items-center gap-2">
                {onFavorite && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleFavorite}
                    className={cn(
                      'hover:bg-gray-100/80 transition-colors',
                      isFavorited && 'text-red-500'
                    )}
                  >
                    <Heart className={cn('h-5 w-5', isFavorited && 'fill-current')} />
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onEdit}
                    className="hover:bg-gray-100/80 transition-colors"
                  >
                    <Edit className="h-5 w-5" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDelete}
                    className="hover:bg-gray-100/80 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-gray-100/80 transition-colors"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
            <ScrollArea className="p-6 overflow-auto h-[calc(100%-73px)]">{children}</ScrollArea>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RightSidebar;
