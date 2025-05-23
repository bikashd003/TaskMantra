'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SearchSuggestion {
  id: string;
  text: string;
  category?: string;
  icon?: React.ReactNode;
  metadata?: string;
}

export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  loading?: boolean;
  debounceMs?: number;
  showSuggestions?: boolean;
  showRecentSearches?: boolean;
  maxSuggestions?: number;
  className?: string;
  inputClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'filled';
  clearable?: boolean;
  autoFocus?: boolean;
}

const sizeClasses = {
  sm: 'h-8 text-sm',
  md: 'h-10 text-sm',
  lg: 'h-12 text-base',
};

const variantClasses = {
  default: 'theme-input border',
  ghost:
    'bg-transparent border-transparent hover:bg-accent/50 focus:bg-background focus:border-border',
  filled: 'bg-muted border-transparent',
};

export function SearchInput({
  placeholder = 'Search...',
  value: controlledValue,
  onChange,
  onSearch,
  onSuggestionSelect,
  suggestions = [],
  recentSearches = [],
  loading = false,
  debounceMs = 300,
  showSuggestions = true,
  showRecentSearches = true,
  maxSuggestions = 8,
  className,
  inputClassName,
  size = 'md',
  variant = 'default',
  clearable = true,
  autoFocus = false,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  // Debounced search
  useEffect(() => {
    if (!onChange) return;

    const timer = setTimeout(() => {
      onChange(value);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, onChange, debounceMs]);

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Combine suggestions and recent searches
  const allSuggestions = React.useMemo(() => {
    const items: (SearchSuggestion & { type: 'suggestion' | 'recent' })[] = [];

    // Add recent searches if enabled and input is empty
    if (showRecentSearches && !value && recentSearches.length > 0) {
      recentSearches.slice(0, 3).forEach(search => {
        items.push({
          id: `recent-${search}`,
          text: search,
          type: 'recent',
          icon: <Clock className="w-4 h-4" />,
          category: 'Recent',
        });
      });
    }

    // Add suggestions
    if (showSuggestions && suggestions.length > 0) {
      suggestions.slice(0, maxSuggestions).forEach(suggestion => {
        items.push({
          ...suggestion,
          type: 'suggestion',
        });
      });
    }

    return items;
  }, [suggestions, recentSearches, value, showSuggestions, showRecentSearches, maxSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
        return;
      }
      if (e.key === 'Enter') {
        onSearch?.(value);
        return;
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev < allSuggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && allSuggestions[highlightedIndex]) {
          handleSuggestionClick(allSuggestions[highlightedIndex]);
        } else {
          onSearch?.(value);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (
    suggestion: SearchSuggestion & { type?: 'suggestion' | 'recent' }
  ) => {
    if (controlledValue === undefined) {
      setInternalValue(suggestion.text);
    }
    onSuggestionSelect?.(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    if (controlledValue === undefined) {
      setInternalValue('');
    }
    onChange?.('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-secondary" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          autoFocus={autoFocus}
          className={cn(
            'pl-10',
            clearable && value && 'pr-10',
            sizeClasses[size],
            variantClasses[variant],
            inputClassName
          )}
        />
        {clearable && value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && allSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 theme-surface-elevated rounded-lg theme-shadow-lg border theme-border max-h-80 overflow-y-auto theme-scrollbar"
          >
            {allSuggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.1, delay: index * 0.02 }}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 cursor-pointer theme-transition',
                  highlightedIndex === index ? 'theme-active-primary' : 'theme-hover-surface',
                  index === 0 && 'rounded-t-lg',
                  index === allSuggestions.length - 1 && 'rounded-b-lg'
                )}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.icon && (
                  <div
                    className={cn(
                      'flex-shrink-0',
                      suggestion.type === 'recent' ? 'theme-text-secondary' : 'text-primary'
                    )}
                  >
                    {suggestion.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="theme-text-primary font-medium truncate">
                      {suggestion.text}
                    </span>
                    {suggestion.category && (
                      <span className="theme-badge-secondary">{suggestion.category}</span>
                    )}
                  </div>
                  {suggestion.metadata && (
                    <p className="text-xs theme-text-secondary mt-1 truncate">
                      {suggestion.metadata}
                    </p>
                  )}
                </div>
                {suggestion.type === 'suggestion' && (
                  <TrendingUp className="w-3 h-3 theme-text-secondary flex-shrink-0" />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
