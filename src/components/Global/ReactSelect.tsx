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
      <ChevronDown size={18} className="text-muted-foreground" />
    </components.DropdownIndicator>
  );
};

// Custom clear indicator
const ClearIndicator = (props: any) => {
  return (
    <components.ClearIndicator {...props}>
      <X size={16} className="text-muted-foreground hover:text-destructive transition-colors" />
    </components.ClearIndicator>
  );
};

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
  // Basic styles
  const customStyles = {
    control: (base: any) => ({
      ...base,
      borderColor: error ? 'hsl(var(--destructive))' : 'hsl(var(--input))',
      boxShadow: error ? '0 0 0 1px hsl(var(--destructive))' : base.boxShadow,
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
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 100,
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
      {label && <label className="text-sm font-medium block">{label}</label>}

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
        className="react-select-container"
        classNamePrefix="react-select"
      />

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}

      {helperText && !error && <div className="text-xs text-muted-foreground">{helperText}</div>}
    </div>
  );
};

export default ReactSelect;
