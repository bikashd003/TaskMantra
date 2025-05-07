import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X, Search, Loader2 } from 'lucide-react';

interface Option {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
  [key: string]: any;
}

interface MultiSelectProps {
  options?: Option[];
  selectedValues?: Option[];
  onChange: (selected: Option[]) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  creatable?: boolean;
  maxItems?: number;
  label?: string;
  error?: string;
  className?: string;
  itemRenderer?: (option: Option, meta: { isSelected: boolean }) => React.ReactNode;
  groupBy?: string;
  onBlur?: () => void;
  placement?: 'top' | 'bottom';
}

// Main MultiSelect component
export const MultiSelect: React.FC<MultiSelectProps> = ({
  options = [],
  selectedValues = [],
  onChange,
  placeholder = 'Select options...',
  disabled = false,
  loading = false,
  searchable = true,
  clearable = true,
  creatable = false,
  maxItems,
  label,
  error,
  className = '',
  itemRenderer,
  groupBy,
  onBlur,
  placement = 'bottom',
}) => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Process options to handle grouping if needed
  const processedOptions = groupBy
    ? Object.entries(
        options.reduce<Record<string, Option[]>>((groups, option) => {
          const groupKey = option[groupBy] || 'Other';
          if (!groups[groupKey]) groups[groupKey] = [];
          groups[groupKey].push(option);
          return groups;
        }, {})
      )
    : null;

  // Filter options based on search
  const getFilteredOptions = () => {
    let filteredOptions = options;

    if (searchValue) {
      filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    return filteredOptions;
  };

  // Check if an option is selected
  const isSelected = (value: string) => {
    return selectedValues.some(item => item.value === value);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (onBlur) onBlur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Scroll to focused option in dropdown
  useEffect(() => {
    if (focusedOptionIndex >= 0 && optionsRef.current) {
      const options = optionsRef.current.querySelectorAll('[role="option"]');
      if (options[focusedOptionIndex]) {
        options[focusedOptionIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [focusedOptionIndex]);

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchValue('');
      setFocusedOptionIndex(-1);
    }
  };

  // Toggle selection of an option
  const toggleOption = (option: Option) => {
    const isOptionSelected = isSelected(option.value);
    let newSelectedValues: Option[];

    if (isOptionSelected) {
      newSelectedValues = selectedValues.filter(item => item.value !== option.value);
    } else {
      // Check if we're at max items
      if (maxItems && selectedValues.length >= maxItems) {
        newSelectedValues = [...selectedValues.slice(1), option];
      } else {
        newSelectedValues = [...selectedValues, option];
      }
    }

    onChange(newSelectedValues);
  };

  // Create and add a new option
  const createOption = () => {
    if (!searchValue.trim()) return;

    const newOption: Option = {
      label: searchValue.trim(),
      value: `custom-${Date.now()}-${searchValue.trim()}`,
    };

    // Add to selected values
    const newSelectedValues = [...selectedValues, newOption];
    onChange(newSelectedValues);

    // Reset search
    setSearchValue('');
  };

  // Clear all selections
  const clearSelections = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  // Remove a single selected item
  const removeItem = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    onChange(selectedValues.filter(item => item.value !== value));
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const filteredOptions = getFilteredOptions();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedOptionIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        setFocusedOptionIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;

      case 'Enter':
        e.preventDefault();
        if (isOpen) {
          if (focusedOptionIndex >= 0 && filteredOptions[focusedOptionIndex]) {
            toggleOption(filteredOptions[focusedOptionIndex]);
          } else if (
            creatable &&
            searchValue &&
            !filteredOptions.some(o => o.label.toLowerCase() === searchValue.toLowerCase())
          ) {
            createOption();
          }
        } else {
          setIsOpen(true);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;

      case 'Tab':
        setIsOpen(false);
        break;

      case 'Backspace':
        if (!searchValue && selectedValues.length > 0) {
          onChange(selectedValues.slice(0, -1));
        }
        break;

      default:
        break;
    }
  };

  // Render each option
  const renderOption = (option: Option, index: number) => {
    const isOptionSelected = isSelected(option.value);
    const isFocused = focusedOptionIndex === index;

    return (
      <div
        key={option.value}
        role="option"
        aria-selected={isOptionSelected}
        className={`
          flex items-center px-3 py-2 text-sm cursor-pointer transition-colors
          ${isOptionSelected ? 'bg-blue-50 text-blue-800' : 'hover:bg-gray-100'}
          ${isFocused ? 'bg-gray-100' : ''}
          ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => !option.disabled && toggleOption(option)}
      >
        <div className="flex-shrink-0 w-5 h-5 mr-2">
          {isOptionSelected && <Check className="w-4 h-4 text-blue-600" />}
        </div>

        {itemRenderer ? (
          itemRenderer(option, { isSelected: isOptionSelected })
        ) : (
          <span className="flex-grow truncate">{option.label}</span>
        )}

        {option.description && (
          <span className="ml-2 text-xs text-gray-400">{option.description}</span>
        )}
      </div>
    );
  };

  // Render option groups
  const renderGroups = () => {
    return processedOptions?.map(([groupName, groupOptions]) => (
      <div key={groupName} className="mb-2">
        <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50">{groupName}</div>
        {groupOptions.map((option, idx) => renderOption(option, idx))}
      </div>
    ));
  };

  // Calculate dropdown position classes based on placement
  const getDropdownPositionClasses = () => {
    switch (placement) {
      case 'top':
        return 'bottom-full mb-1';
      case 'bottom':
      default:
        return 'top-full mt-1';
    }
  };

  // Render the entire component
  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Label if provided */}
      {label && <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>}

      {/* Main input container */}
      <div
        className={`
          flex items-center flex-wrap min-h-10 p-1 pl-3 border rounded-md transition-all
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}
          ${error ? 'border-red-500 ring-2 ring-red-100' : ''}
        `}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        role="combobox"
      >
        {/* Selected items */}
        <div className="flex flex-wrap flex-grow gap-1">
          {selectedValues.length === 0 ? (
            <span className="py-1 text-gray-400">{placeholder}</span>
          ) : (
            <>
              {selectedValues.map(item => (
                <div
                  key={item.value}
                  className="
                    flex items-center gap-1 px-2 py-1 m-px text-sm bg-blue-100 
                    text-blue-800 rounded-md transition-all hover:bg-blue-200
                  "
                >
                  <span className="truncate max-w-40">{item.label}</span>
                  {!disabled && (
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800 focus:outline-none"
                      onClick={e => removeItem(e, item.value)}
                      aria-label={`Remove ${item.label}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Search input - visible when dropdown is open */}
          {isOpen && searchable && (
            <input
              ref={searchInputRef}
              type="text"
              className="flex-grow px-1 py-1 text-sm bg-transparent border-none outline-none"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onClick={e => e.stopPropagation()}
              placeholder="Search..."
              disabled={disabled}
            />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center ml-auto">
          {loading && <Loader2 className="w-4 h-4 mr-1 text-gray-400 animate-spin" />}

          {clearable && selectedValues.length > 0 && !disabled && (
            <button
              type="button"
              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={clearSelections}
              aria-label="Clear all selected items"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="w-6 h-6 flex items-center justify-center">
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && <div className="mt-1 text-sm text-red-500">{error}</div>}

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={`
            absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg 
            max-h-60 overflow-y-auto py-1 mt-1 animate-in fade-in duration-200
            ${getDropdownPositionClasses()}
          `}
          ref={optionsRef}
          role="listbox"
          aria-multiselectable="true"
        >
          {/* Search field for larger dropdown */}
          {searchable && getFilteredOptions().length > 10 && (
            <div className="sticky top-0 px-3 py-2 bg-white border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-8 pr-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  placeholder="Search options..."
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  onClick={e => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Options list */}
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              <span className="ml-2 text-gray-500">Loading options...</span>
            </div>
          ) : (
            <>
              {getFilteredOptions().length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {searchValue ? 'No matching options' : 'No options available'}

                  {/* Create option button */}
                  {creatable && searchValue && (
                    <button
                      type="button"
                      className="flex items-center px-3 py-2 mt-1 w-full text-sm text-left text-blue-600 hover:bg-blue-50 rounded-md"
                      onClick={createOption}
                    >
                      Create {searchValue}
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Render options with or without groups */}
                  {groupBy ? renderGroups() : getFilteredOptions().map(renderOption)}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// const MultiSelectDemo = () => {
//   const [selectedFruits, setSelectedFruits] = useState([]);
//   const [selectedUsers, setSelectedUsers] = useState([]);
//   const [selectedTags, setSelectedTags] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);

//   const fruits = [
//     { value: 'apple', label: 'Apple', category: 'Everyday' },
//     { value: 'banana', label: 'Banana', category: 'Everyday' },
//     { value: 'orange', label: 'Orange', category: 'Citrus' },
//     { value: 'grape', label: 'Grape', category: 'Berries' },
//     { value: 'strawberry', label: 'Strawberry', category: 'Berries' },
//     { value: 'blueberry', label: 'Blueberry', category: 'Berries' },
//     { value: 'lemon', label: 'Lemon', category: 'Citrus' },
//     { value: 'lime', label: 'Lime', category: 'Citrus' },
//     { value: 'pear', label: 'Pear', category: 'Everyday' },
//     { value: 'peach', label: 'Peach', category: 'Stone Fruits' },
//     { value: 'plum', label: 'Plum', category: 'Stone Fruits' },
//     { value: 'cherry', label: 'Cherry', category: 'Stone Fruits' },
//   ];

//   const users = [
//     { value: '1', label: 'John Doe', description: 'Developer', avatar: '👨‍💻' },
//     { value: '2', label: 'Jane Smith', description: 'Designer', avatar: '👩‍🎨' },
//     { value: '3', label: 'Bob Johnson', description: 'Manager', avatar: '👨‍💼' },
//     { value: '4', label: 'Alice Brown', description: 'Marketing', avatar: '👩‍💼' },
//     { value: '5', label: 'Chris Wilson', description: 'Support', avatar: '👨‍🔧' },
//   ];

//   // Simulate loading state
//   const handleLoadingDemo = () => {
//     setIsLoading(true);
//     setTimeout(() => {
//       setIsLoading(false);
//     }, 1500);
//   };

//   // Custom renderer for user options
//   const userRenderer = (option) => (
//     <div className="flex items-center">
//       <span className="mr-2 text-lg">{option.avatar}</span>
//       <div>
//         <div className="font-medium">{option.label}</div>
//         <div className="text-xs text-gray-500">{option.description}</div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
//       <h1 className="text-2xl font-bold mb-6 text-gray-800">MultiSelect Component</h1>

//       <div className="space-y-6">
//         {/* Basic example */}
//         <div>
//           <h2 className="text-lg font-semibold mb-2 text-gray-700">Basic Example</h2>
//           <MultiSelect
//             options={fruits}
//             selectedValues={selectedFruits}
//             onChange={setSelectedFruits}
//             placeholder="Select fruits..."
//             label="Select Fruits"
//           />
//           <div className="mt-2 text-sm text-gray-500">
//             Selected: {selectedFruits.length > 0
//               ? selectedFruits.map(f => f.label).join(', ')
//               : 'None'}
//           </div>
//         </div>

//         {/* Grouped example */}
//         <div>
//           <h2 className="text-lg font-semibold mb-2 text-gray-700">Grouped by Category</h2>
//           <MultiSelect
//             options={fruits}
//             selectedValues={selectedFruits}
//             onChange={setSelectedFruits}
//             placeholder="Select fruits..."
//             groupBy="category"
//           />
//         </div>

//         {/* Custom rendering */}
//         <div>
//           <h2 className="text-lg font-semibold mb-2 text-gray-700">Custom Item Renderer</h2>
//           <MultiSelect
//             options={users}
//             selectedValues={selectedUsers}
//             onChange={setSelectedUsers}
//             placeholder="Select team members..."
//             itemRenderer={userRenderer}
//           />
//         </div>

//         {/* Loading state */}
//         <div>
//           <h2 className="text-lg font-semibold mb-2 text-gray-700">Loading State</h2>
//           <button
//             className="mb-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//             onClick={handleLoadingDemo}
//           >
//             Simulate Loading
//           </button>
//           <MultiSelect
//             options={fruits}
//             selectedValues={selectedFruits}
//             onChange={setSelectedFruits}
//             placeholder="Select fruits..."
//             loading={isLoading}
//           />
//         </div>

//         {/* Creatable */}
//         <div>
//           <h2 className="text-lg font-semibold mb-2 text-gray-700">Creatable Tags</h2>
//           <MultiSelect
//             options={[
//               { value: 'react', label: 'React' },
//               { value: 'vue', label: 'Vue' },
//               { value: 'angular', label: 'Angular' },
//               { value: 'svelte', label: 'Svelte' },
//             ]}
//             selectedValues={selectedTags}
//             onChange={setSelectedTags}
//             placeholder="Select or create tags..."
//             creatable={true}
//           />
//         </div>

//         {/* With error */}
//         <div>
//           <h2 className="text-lg font-semibold mb-2 text-gray-700">With Error</h2>
//           <MultiSelect
//             options={fruits}
//             selectedValues={[]}
//             onChange={() => {}}
//             placeholder="Select required options..."
//             error="This field is required"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MultiSelectDemo;
