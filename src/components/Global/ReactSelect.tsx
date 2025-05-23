import React from 'react';
import Select, { components, MultiValue, SingleValue, ActionMeta } from 'react-select';
import { ChevronDown, X, Search, AlertCircle } from 'lucide-react';

export interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface ReactSelectProps {
  options: Option[];
  value: Option | Option[] | null;
  onChange: (
    newValue: MultiValue<Option> | SingleValue<Option>,
    actionMeta?: ActionMeta<Option>
  ) => void;
  placeholder?: string;
  isMulti?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  className?: string;
  error?: string;
  label?: string;
  helperText?: string;
}

// Custom dropdown indicator
const DropdownIndicator = (props: any) => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown size={18} className="theme-text-secondary" />
    </components.DropdownIndicator>
  );
};

// Custom clear indicator
const ClearIndicator = (props: any) => {
  return (
    <components.ClearIndicator {...props}>
      <X size={16} className="theme-text-secondary hover:text-destructive theme-transition" />
    </components.ClearIndicator>
  );
};

// Custom no options message
const NoOptionsMessage = (props: any) => (
  <components.NoOptionsMessage {...props}>
    <div className="flex items-center justify-center gap-2 theme-text-secondary py-2">
      <Search size={14} />
      <span>{props.children}</span>
    </div>
  </components.NoOptionsMessage>
);

// Main component
const ReactSelect = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  isMulti = false,
  isSearchable = true,
  isClearable = true,
  isDisabled = false,
  isLoading = false,
  className = '',
  error,
  label,
  helperText,
}: ReactSelectProps) => {
  // Custom styles using CSS variables for theme compatibility
  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: 'hsl(var(--background))',
      borderColor: error ? 'hsl(var(--destructive))' : 'hsl(var(--border))',
      color: 'hsl(var(--foreground))',
      boxShadow: error
        ? '0 0 0 1px hsl(var(--destructive))'
        : state.isFocused
          ? '0 0 0 2px hsl(var(--ring))'
          : 'none',
      '&:hover': {
        borderColor: error ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
      },
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? 'hsl(var(--primary) / 0.1)'
        : state.isFocused
          ? 'hsl(var(--accent))'
          : 'transparent',
      color: state.isSelected ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
      cursor: 'pointer',
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: 'hsl(var(--popover))',
      border: '1px solid hsl(var(--border))',
      borderRadius: 'calc(var(--radius) - 2px)',
      boxShadow:
        '0 4px 6px -1px hsl(var(--foreground) / 0.1), 0 2px 4px -2px hsl(var(--foreground) / 0.1)',
      zIndex: 100,
    }),
    menuList: (base: any) => ({
      ...base,
      padding: '4px',
    }),
    singleValue: (base: any) => ({
      ...base,
      color: 'hsl(var(--foreground))',
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: 'hsl(var(--secondary))',
      borderRadius: 'calc(var(--radius) - 4px)',
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: 'hsl(var(--secondary-foreground))',
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: 'hsl(var(--secondary-foreground))',
      '&:hover': {
        backgroundColor: 'hsl(var(--destructive))',
        color: 'hsl(var(--destructive-foreground))',
      },
    }),
    placeholder: (base: any) => ({
      ...base,
      color: 'hsl(var(--muted-foreground))',
    }),
    input: (base: any) => ({
      ...base,
      color: 'hsl(var(--foreground))',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
  };

  // Custom components
  const customComponents = {
    DropdownIndicator,
    ClearIndicator,
    NoOptionsMessage,
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-sm font-medium block theme-text-primary">{label}</label>}

      <Select
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isMulti={isMulti}
        isSearchable={isSearchable}
        isClearable={isClearable}
        isDisabled={isDisabled}
        isLoading={isLoading}
        styles={customStyles}
        components={customComponents}
        className="react-select-container theme-transition"
        classNamePrefix="react-select"
      />

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-destructive theme-transition">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}

      {helperText && !error && <div className="text-xs theme-text-secondary">{helperText}</div>}
    </div>
  );
};

export default ReactSelect;
