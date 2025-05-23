'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'custom';

export type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid';

export interface FormFieldProps {
  id?: string;
  name?: string;
  type?: FieldType;
  label?: string;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  validationState?: ValidationState;
  showValidationIcon?: boolean;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'underlined';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  maxLength?: number;
  rows?: number;
  autoComplete?: string;
  autoFocus?: boolean;
  children?: React.ReactNode; // For custom field types
  options?: Array<{ value: string; label: string }>; // For select type
}

const sizeConfig = {
  sm: {
    input: 'h-8 px-3 text-sm',
    label: 'text-sm',
    helper: 'text-xs',
    icon: 'w-4 h-4',
  },
  md: {
    input: 'h-10 px-3 text-sm',
    label: 'text-sm',
    helper: 'text-xs',
    icon: 'w-4 h-4',
  },
  lg: {
    input: 'h-12 px-4 text-base',
    label: 'text-base',
    helper: 'text-sm',
    icon: 'w-5 h-5',
  },
};

const variantConfig = {
  default: 'theme-input border rounded-md',
  filled: 'bg-muted border-transparent rounded-md focus:bg-background focus:border-border',
  underlined: 'bg-transparent border-0 border-b-2 border-border rounded-none focus:border-primary',
};

export function FormField({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  error,
  helperText,
  required = false,
  disabled = false,
  loading = false,
  validationState = 'idle',
  showValidationIcon = true,
  className,
  inputClassName,
  labelClassName,
  size = 'md',
  variant = 'default',
  leftIcon,
  rightIcon,
  maxLength,
  rows = 4,
  autoComplete,
  autoFocus,
  children,
  options = [],
}: FormFieldProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const sizeClasses = sizeConfig[size];
  const fieldId = id || name || Math.random().toString(36).substr(2, 9);

  const hasError = !!error || validationState === 'invalid';
  const isValid = validationState === 'valid';
  const isValidating = validationState === 'validating';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange?.(newValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const getValidationIcon = () => {
    if (!showValidationIcon) return null;

    if (isValidating) {
      return (
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      );
    }

    if (hasError) {
      return <AlertCircle className={cn(sizeClasses.icon, 'text-destructive')} />;
    }

    if (isValid) {
      return <CheckCircle className={cn(sizeClasses.icon, 'text-success')} />;
    }

    return null;
  };

  const renderInput = () => {
    const baseInputProps = {
      id: fieldId,
      name,
      placeholder,
      value,
      defaultValue,
      onChange: handleInputChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      disabled: disabled || loading,
      maxLength,
      autoComplete,
      autoFocus,
      className: cn(
        variantConfig[variant],
        sizeClasses.input,
        leftIcon && 'pl-10',
        (rightIcon || getValidationIcon() || type === 'password') && 'pr-10',
        hasError && 'border-destructive focus:border-destructive',
        isValid && 'border-success focus:border-success',
        isFocused && 'ring-2 ring-ring ring-offset-2',
        disabled && 'opacity-50 cursor-not-allowed',
        inputClassName
      ),
    };

    switch (type) {
      case 'textarea':
        return <Textarea {...baseInputProps} rows={rows} />;

      case 'select':
        return (
          <select {...baseInputProps} className={cn(baseInputProps.className, 'cursor-pointer')}>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'custom':
        return children;

      default:
        return (
          <Input
            {...baseInputProps}
            type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          />
        );
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      {label && (
        <Label
          htmlFor={fieldId}
          className={cn(
            'font-medium theme-text-primary',
            sizeClasses.label,
            required && "after:content-['*'] after:text-destructive after:ml-1",
            labelClassName
          )}
        >
          {label}
        </Label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-secondary">
            {leftIcon}
          </div>
        )}

        {/* Input Field */}
        {renderInput()}

        {/* Right Icons */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {/* Password Toggle */}
          {type === 'password' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              className="h-auto p-0 theme-text-secondary hover:theme-text-primary"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className={sizeClasses.icon} />
              ) : (
                <Eye className={sizeClasses.icon} />
              )}
            </Button>
          )}

          {/* Custom Right Icon */}
          {rightIcon && <div className="theme-text-secondary">{rightIcon}</div>}

          {/* Validation Icon */}
          {getValidationIcon()}
        </div>

        {/* Loading Overlay */}
        {loading && (
          <motion.div
            className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-md flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </div>

      {/* Helper Text and Error */}
      <AnimatePresence mode="wait">
        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2"
          >
            {hasError && <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />}
            {helperText && !error && (
              <Info className="w-4 h-4 theme-text-secondary flex-shrink-0 mt-0.5" />
            )}
            <p
              className={cn(
                sizeClasses.helper,
                hasError ? 'text-destructive' : 'theme-text-secondary'
              )}
            >
              {error || helperText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character Count */}
      {maxLength && type === 'textarea' && (
        <div className="flex justify-end">
          <span
            className={cn(
              sizeClasses.helper,
              'theme-text-secondary',
              value && String(value).length > maxLength * 0.9 && 'text-warning',
              value && String(value).length >= maxLength && 'text-destructive'
            )}
          >
            {value ? String(value).length : 0} / {maxLength}
          </span>
        </div>
      )}
    </div>
  );
}
