'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, MoreVertical, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ActionMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  separator?: boolean;
  shortcut?: string;
  submenu?: ActionMenuItem[];
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  trigger?: React.ReactNode;
  triggerClassName?: string;
  menuClassName?: string;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'horizontal' | 'vertical';
  disabled?: boolean;
  closeOnSelect?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const sizeConfig = {
  sm: {
    trigger: 'h-6 w-6',
    menu: 'min-w-[160px]',
    item: 'px-2 py-1.5 text-xs',
    icon: 'w-3 h-3',
  },
  md: {
    trigger: 'h-8 w-8',
    menu: 'min-w-[180px]',
    item: 'px-3 py-2 text-sm',
    icon: 'w-4 h-4',
  },
  lg: {
    trigger: 'h-10 w-10',
    menu: 'min-w-[200px]',
    item: 'px-4 py-2.5 text-sm',
    icon: 'w-4 h-4',
  },
};

const placementConfig = {
  'bottom-start': { origin: 'top-left', transform: 'translate(0, 8px)' },
  'bottom-end': { origin: 'top-right', transform: 'translate(-100%, 8px)' },
  'top-start': { origin: 'bottom-left', transform: 'translate(0, -8px)' },
  'top-end': { origin: 'bottom-right', transform: 'translate(-100%, -8px)' },
  left: { origin: 'center-right', transform: 'translate(-8px, -50%)' },
  right: { origin: 'center-left', transform: 'translate(8px, -50%)' },
};

export function ActionMenu({
  items,
  trigger,
  triggerClassName,
  menuClassName,
  placement = 'bottom-end',
  size = 'md',
  variant = 'horizontal',
  disabled = false,
  closeOnSelect = true,
  onOpenChange,
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const sizeClasses = sizeConfig[size];
  const placementClasses = placementConfig[placement];

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveSubmenu(null);
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      const visibleItems = items.filter(item => !item.separator);

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev => (prev < visibleItems.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev => (prev > 0 ? prev - 1 : visibleItems.length - 1));
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (highlightedIndex >= 0 && visibleItems[highlightedIndex]) {
            handleItemClick(visibleItems[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setActiveSubmenu(null);
          setHighlightedIndex(-1);
          triggerRef.current?.focus();
          break;
        case 'ArrowRight':
          if (highlightedIndex >= 0 && visibleItems[highlightedIndex]?.submenu) {
            setActiveSubmenu(visibleItems[highlightedIndex].id);
          }
          break;
        case 'ArrowLeft':
          setActiveSubmenu(null);
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, highlightedIndex, items]);

  const handleToggle = () => {
    const newOpen = !isOpen;
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);

    if (!newOpen) {
      setActiveSubmenu(null);
      setHighlightedIndex(-1);
    }
  };

  const handleItemClick = (item: ActionMenuItem) => {
    if (item.disabled) return;

    if (item.submenu) {
      setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
      return;
    }

    item.onClick?.();

    if (closeOnSelect) {
      setIsOpen(false);
      setActiveSubmenu(null);
      setHighlightedIndex(-1);
    }
  };

  const defaultTrigger = (
    <Button
      ref={triggerRef}
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={disabled}
      className={cn('p-0', sizeClasses.trigger, triggerClassName)}
      aria-expanded={isOpen}
      aria-haspopup="menu"
    >
      {variant === 'horizontal' ? (
        <MoreHorizontal className={sizeClasses.icon} />
      ) : (
        <MoreVertical className={sizeClasses.icon} />
      )}
    </Button>
  );

  const renderMenuItem = (item: ActionMenuItem, index: number, isSubmenu = false) => {
    if (item.separator) {
      return <div key={`separator-${index}`} className="my-1 border-t theme-border" />;
    }

    const isHighlighted = !isSubmenu && highlightedIndex === index;
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isSubmenuOpen = activeSubmenu === item.id;

    return (
      <div key={item.id} className="relative">
        <motion.button
          className={cn(
            'w-full flex items-center justify-between rounded-md theme-transition',
            sizeClasses.item,
            item.disabled ? 'opacity-50 cursor-not-allowed' : 'theme-hover-surface cursor-pointer',
            item.destructive && !item.disabled && 'text-destructive hover:bg-destructive/10',
            isHighlighted && 'theme-active-primary',
            menuClassName
          )}
          onClick={() => handleItemClick(item)}
          onMouseEnter={() => !isSubmenu && setHighlightedIndex(index)}
          disabled={item.disabled}
          whileHover={!item.disabled ? { scale: 1.02 } : undefined}
          whileTap={!item.disabled ? { scale: 0.98 } : undefined}
        >
          <div className="flex items-center gap-3">
            {item.icon && <div className={cn('flex-shrink-0', sizeClasses.icon)}>{item.icon}</div>}
            <span className="flex-1 text-left">{item.label}</span>
          </div>

          <div className="flex items-center gap-2">
            {item.shortcut && (
              <span className="text-xs theme-text-secondary font-mono">{item.shortcut}</span>
            )}
            {hasSubmenu && (
              <ChevronRight
                className={cn('flex-shrink-0', sizeClasses.icon, isSubmenuOpen && 'rotate-90')}
              />
            )}
          </div>
        </motion.button>

        {/* Submenu */}
        <AnimatePresence>
          {hasSubmenu && isSubmenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute left-full top-0 ml-1 z-10',
                'theme-surface-elevated rounded-lg theme-shadow-lg border theme-border',
                'py-1',
                sizeClasses.menu
              )}
            >
              {item.submenu!.map((subItem, subIndex) => renderMenuItem(subItem, subIndex, true))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="relative inline-block">
      {trigger ? (
        <div onClick={handleToggle} className={triggerClassName}>
          {trigger}
        </div>
      ) : (
        defaultTrigger
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 py-1',
              'theme-surface-elevated rounded-lg theme-shadow-lg border theme-border',
              sizeClasses.menu,
              menuClassName
            )}
            style={{
              transformOrigin: placementClasses.origin,
              ...getPositionStyles(placement),
            }}
          >
            {items.map((item, index) => renderMenuItem(item, index))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getPositionStyles(placement: ActionMenuProps['placement']) {
  switch (placement) {
    case 'bottom-start':
      return { top: '100%', left: 0, marginTop: '4px' };
    case 'bottom-end':
      return { top: '100%', right: 0, marginTop: '4px' };
    case 'top-start':
      return { bottom: '100%', left: 0, marginBottom: '4px' };
    case 'top-end':
      return { bottom: '100%', right: 0, marginBottom: '4px' };
    case 'left':
      return { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '4px' };
    case 'right':
      return { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '4px' };
    default:
      return { top: '100%', right: 0, marginTop: '4px' };
  }
}
