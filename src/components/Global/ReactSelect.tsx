import React, { useState, useEffect, useRef } from 'react';
import Select, {
  components,
  MultiValue,
  SingleValue,
  ActionMeta,
  StylesConfig,
  GroupBase,
} from 'react-select';
import CreatableSelect from 'react-select/creatable';
import AsyncSelect from 'react-select/async';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Search, Tag, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Option {
  value: string | number;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
  image?: string;
  disabled?: boolean;
  group?: string;
  meta?: Record<string, any>;
}

export interface ReactSelectProps {
  options: Option[];
  value: Option | Option[] | null;
  onChange: (
    _newValue: MultiValue<Option> | SingleValue<Option>,
    _actionMeta: ActionMeta<Option>
  ) => void;
  placeholder?: string;
  isMulti?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  closeMenuOnSelect?: boolean;
  hideSelectedOptions?: boolean;
  menuPlacement?: 'auto' | 'bottom' | 'top';
  menuPosition?: 'absolute' | 'fixed';
  maxMenuHeight?: number;
  minMenuHeight?: number;
  maxMenuWidth?: number;
  noOptionsMessage?: (obj: { inputValue: string }) => string;
  loadingMessage?: (obj: { inputValue: string }) => string;
  formatGroupLabel?: (group: GroupBase<Option>) => React.ReactNode;
  formatOptionLabel?: (option: Option, meta: { context: string }) => React.ReactNode;
  className?: string;
  classNamePrefix?: string;
  variant?: 'default' | 'bordered' | 'filled' | 'underlined' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  error?: string;
  label?: string;
  helperText?: string;
  required?: boolean;
  autoFocus?: boolean;
  name?: string;
  id?: string;
  onBlur?: () => void;
  onFocus?: () => void;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  onInputChange?: (newValue: string, actionMeta: any) => void;
  customStyles?: StylesConfig<Option, boolean>;
  creatable?: boolean;
  async?: boolean;
  loadOptions?: (inputValue: string) => Promise<Option[]>;
  debounceTimeout?: number;
  components?: any;
  defaultMenuIsOpen?: boolean;
  allowCreateWhileLoading?: boolean;
  createOptionPosition?: 'first' | 'last';
  formatCreateLabel?: (inputValue: string) => React.ReactNode;
  onCreateOption?: (inputValue: string) => void;
  inputId?: string;
  getOptionLabel?: (option: Option) => string;
  getOptionValue?: (option: Option) => string;
  filterOption?: ((option: Option, inputValue: string) => boolean) | null;
  menuPortalTarget?: HTMLElement | null;
  isRtl?: boolean;
  getNewOptionData?: (inputValue: string, optionLabel: React.ReactNode) => Option;
  tabIndex?: number;
  tabSelectsValue?: boolean;
  defaultValue?: Option | Option[] | null;
  defaultInputValue?: string;
  openMenuOnFocus?: boolean;
  openMenuOnClick?: boolean;
  escapeClearsValue?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

// Custom dropdown indicator with animation
const DropdownIndicator = (props: any) => {
  const { menuIsOpen } = props.selectProps;

  return (
    <components.DropdownIndicator {...props}>
      <motion.div
        initial={false}
        animate={{ rotate: menuIsOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown size={18} className="text-muted-foreground" />
      </motion.div>
    </components.DropdownIndicator>
  );
};

// Custom clear indicator with animation
const ClearIndicator = (props: any) => {
  return (
    <components.ClearIndicator {...props}>
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <X size={16} className="text-muted-foreground hover:text-destructive transition-colors" />
      </motion.div>
    </components.ClearIndicator>
  );
};

// Custom loading indicator with animation
const LoadingIndicator = (props: any) => {
  return (
    <components.LoadingIndicator {...props}>
      <Loader2 size={18} className="text-muted-foreground animate-spin" />
    </components.LoadingIndicator>
  );
};

// Custom multi-value container with animation
const MultiValueContainer = (props: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.2 }}
    >
      <components.MultiValueContainer {...props} />
    </motion.div>
  );
};

// Custom group heading
const GroupHeading = (props: any) => (
  <components.GroupHeading {...props}>
    <div className="flex items-center gap-1.5 px-1 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      <Tag size={12} />
      {props.children}
    </div>
  </components.GroupHeading>
);

// Custom no options message
const NoOptionsMessage = (props: any) => (
  <components.NoOptionsMessage {...props}>
    <div className="flex items-center justify-center gap-2 text-muted-foreground py-2">
      <Search size={14} />
      <span>{props.children}</span>
    </div>
  </components.NoOptionsMessage>
);

// Main component
const ReactSelect = React.forwardRef<any, ReactSelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Select an option',
      isMulti = false,
      isSearchable = true,
      isClearable = true,
      isDisabled = false,
      isLoading = false,
      closeMenuOnSelect = !isMulti,
      hideSelectedOptions = false,
      menuPlacement = 'auto',
      menuPosition = 'absolute',
      maxMenuHeight = 300,
      minMenuHeight = 140,
      maxMenuWidth,
      noOptionsMessage = ({ inputValue }: { inputValue: string }) =>
        inputValue ? `No options found for "${inputValue}"` : 'No options available',
      loadingMessage = ({ inputValue }: { inputValue: string }) =>
        inputValue ? `Loading options for "${inputValue}"...` : 'Loading options...',
      formatGroupLabel,
      formatOptionLabel,
      className = '',
      classNamePrefix = 'react-select',
      variant = 'default',
      size = 'md',
      error,
      label,
      helperText,
      required = false,
      autoFocus = false,
      name,
      id,
      onBlur,
      onFocus,
      onMenuOpen,
      onMenuClose,
      onInputChange,
      customStyles,
      components: customComponents,
      creatable = false,
      async = false,
      loadOptions,
      debounceTimeout = 300,
      defaultMenuIsOpen,
      allowCreateWhileLoading = false,
      createOptionPosition = 'last',
      formatCreateLabel,
      onCreateOption,
      inputId,
      getOptionLabel,
      getOptionValue,
      filterOption,
      menuPortalTarget,
      isRtl = false,
      getNewOptionData,
      tabIndex,
      tabSelectsValue = true,
      defaultValue,
      defaultInputValue,
      openMenuOnFocus = false,
      openMenuOnClick = true,
      escapeClearsValue = false,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
    },
    ref
  ) => {
    const [menuIsOpen, setMenuIsOpen] = useState<boolean | undefined>(defaultMenuIsOpen);
    const selectRef = useRef<any>(null);

    // Forward the ref
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(selectRef.current);
        } else {
          (ref as React.MutableRefObject<any>).current = selectRef.current;
        }
      }
    }, [ref]);

    // Generate class names based on variant and size
    const getContainerClassName = () => {
      const baseClasses = 'relative';
      const variantClasses = {
        default: '',
        bordered: 'select-bordered',
        filled: 'select-filled',
        underlined: 'select-underlined',
        minimal: 'select-minimal',
      };

      const sizeClasses = {
        sm: 'select-sm',
        md: 'select-md',
        lg: 'select-lg',
      };

      return cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        error ? 'select-error' : '',
        className
      );
    };

    // Custom styles merged with user provided styles
    const getStyles = (): StylesConfig<Option, boolean> => {
      const baseStyles: StylesConfig<Option, boolean> = {
        control: (provided, state) => ({
          ...provided,
          backgroundColor: variant === 'filled' ? 'var(--background)' : 'transparent',
          borderColor: error
            ? 'hsl(var(--destructive))'
            : state.isFocused
              ? 'hsl(var(--primary))'
              : variant === 'minimal' || variant === 'underlined'
                ? 'transparent'
                : 'hsl(var(--input))',
          borderWidth: variant === 'underlined' ? '0 0 1px 0' : '1px',
          borderRadius: variant === 'underlined' ? '0' : 'var(--radius)',
          boxShadow: state.isFocused
            ? error
              ? '0 0 0 2px hsla(var(--destructive), 0.2)'
              : '0 0 0 2px hsla(var(--primary), 0.2)'
            : 'none',
          padding: size === 'sm' ? '0 8px' : size === 'lg' ? '4px 12px' : '2px 10px',
          minHeight: size === 'sm' ? '32px' : size === 'lg' ? '44px' : '38px',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: state.isFocused
              ? 'hsl(var(--primary))'
              : error
                ? 'hsl(var(--destructive))'
                : 'hsl(var(--input))',
          },
        }),
        valueContainer: provided => ({
          ...provided,
          padding: size === 'sm' ? '0 4px' : size === 'lg' ? '4px 8px' : '2px 6px',
        }),
        input: provided => ({
          ...provided,
          margin: '0',
          padding: '0',
          color: 'hsl(var(--foreground))',
        }),
        placeholder: provided => ({
          ...provided,
          color: 'hsl(var(--muted-foreground))',
        }),
        singleValue: provided => ({
          ...provided,
          color: 'hsl(var(--foreground))',
        }),
        multiValue: provided => ({
          ...provided,
          backgroundColor: 'hsl(var(--primary) / 0.1)',
          borderRadius: 'calc(var(--radius) - 2px)',
        }),
        multiValueLabel: provided => ({
          ...provided,
          color: 'hsl(var(--primary))',
          padding: '2px 6px 2px 8px',
          fontSize: size === 'sm' ? '0.75rem' : '0.875rem',
        }),
        multiValueRemove: provided => ({
          ...provided,
          color: 'hsl(var(--primary))',
          '&:hover': {
            backgroundColor: 'hsl(var(--destructive) / 0.9)',
            color: 'hsl(var(--destructive-foreground))',
          },
          borderRadius: '0 calc(var(--radius) - 2px) calc(var(--radius) - 2px) 0',
        }),
        menu: provided => ({
          ...provided,
          backgroundColor: 'hsl(var(--popover))',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid hsl(var(--border))',
          zIndex: 100,
          overflow: 'hidden',
          ...(maxMenuWidth ? { width: `${maxMenuWidth}px` } : {}),
        }),
        menuList: provided => ({
          ...provided,
          padding: '4px',
        }),
        option: (provided, state) => ({
          ...provided,
          backgroundColor: state.isSelected
            ? 'hsl(var(--primary) / 0.1)'
            : state.isFocused
              ? 'hsl(var(--accent))'
              : 'transparent',
          color: state.isSelected ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
          cursor: state.isDisabled ? 'not-allowed' : 'pointer',
          opacity: state.isDisabled ? 0.6 : 1,
          borderRadius: 'calc(var(--radius) - 2px)',
          '&:active': {
            backgroundColor: 'hsl(var(--accent))',
          },
        }),
        indicatorSeparator: () => ({
          display: 'none',
        }),
        dropdownIndicator: provided => ({
          ...provided,
          padding: size === 'sm' ? '4px' : size === 'lg' ? '8px' : '6px',
        }),
        clearIndicator: provided => ({
          ...provided,
          padding: size === 'sm' ? '4px' : size === 'lg' ? '8px' : '6px',
        }),
        groupHeading: provided => ({
          ...provided,
          margin: '4px 0',
          fontSize: '0.75rem',
          color: 'hsl(var(--muted-foreground))',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }),
        noOptionsMessage: provided => ({
          ...provided,
          color: 'hsl(var(--muted-foreground))',
        }),
        loadingMessage: provided => ({
          ...provided,
          color: 'hsl(var(--muted-foreground))',
        }),
        menuPortal: provided => ({
          ...provided,
          zIndex: 9999,
        }),
      };

      return customStyles ? { ...baseStyles, ...customStyles } : baseStyles;
    };

    // Combine default components with custom ones
    const selectComponents = {
      DropdownIndicator,
      ClearIndicator,
      MultiValueContainer,
      Option,
      GroupHeading,
      NoOptionsMessage,
      LoadingIndicator,
      ...customComponents,
    };

    // Handle focus events
    const handleFocus = () => {
      if (onFocus) onFocus();
    };

    const handleBlur = () => {
      if (onBlur) onBlur();
    };

    // Common props for all select variants
    const commonProps = {
      ref: selectRef,
      options,
      value,
      onChange,
      isMulti,
      isSearchable,
      isClearable,
      isDisabled,
      isLoading,
      placeholder,
      closeMenuOnSelect,
      hideSelectedOptions,
      menuPlacement,
      menuPosition,
      maxMenuHeight,
      minMenuHeight,
      noOptionsMessage,
      loadingMessage,
      formatGroupLabel,
      formatOptionLabel,
      className: classNamePrefix + '-container',
      classNamePrefix,
      styles: getStyles(),
      components: selectComponents,
      onFocus: handleFocus,
      onBlur: handleBlur,
      menuIsOpen,
      onMenuOpen: () => {
        setMenuIsOpen(true);
        if (onMenuOpen) onMenuOpen();
      },
      onMenuClose: () => {
        setMenuIsOpen(false);
        if (onMenuClose) onMenuClose();
      },
      onInputChange,
      name,
      id: id || inputId,
      autoFocus,
      tabIndex,
      tabSelectsValue,
      defaultValue,
      defaultInputValue,
      isRtl,
      filterOption,
      getOptionLabel,
      getOptionValue,
      menuPortalTarget,
      openMenuOnFocus,
      openMenuOnClick,
      escapeClearsValue,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
    };

    // Determine which Select component to use based on props
    const SelectComponent = (() => {
      if (async && creatable) return AsyncCreatableSelect;
      if (async) return AsyncSelect;
      if (creatable) return CreatableSelect;
      return Select;
    })();

    // Additional props for specific select variants
    const additionalProps = (() => {
      if (async && loadOptions) {
        return {
          loadOptions,
          defaultOptions: true,
          cacheOptions: true,
          debounceTimeout,
        };
      }

      if (creatable) {
        return {
          allowCreateWhileLoading,
          createOptionPosition,
          formatCreateLabel,
          onCreateOption,
          getNewOptionData,
        };
      }

      return {};
    })();

    return (
      <div className={getContainerClassName()}>
        {label && (
          <label
            className={cn(
              'block text-sm font-medium mb-1.5',
              required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : '',
              error ? 'text-destructive' : 'text-foreground'
            )}
            htmlFor={id || inputId}
          >
            {label}
          </label>
        )}

        <SelectComponent {...commonProps} {...additionalProps} />

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5 mt-1.5 text-xs text-destructive"
            >
              <AlertCircle size={12} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {helperText && !error && (
          <div className="mt-1.5 text-xs text-muted-foreground">{helperText}</div>
        )}
      </div>
    );
  }
);

ReactSelect.displayName = 'ReactSelect';

export default ReactSelect;
