import React from 'react';
import Select, { components, MultiValue, SingleValue, ActionMeta } from 'react-select';

interface Option {
    value: string | number;
    label: string;
}

interface Props {
    options: Option[];
    value: Option | Option[] | null;
    onChange: (_newValue: MultiValue<Option> | SingleValue<Option>, _actionMeta: ActionMeta<Option>) => void;
    placeholder?: string;
    isMulti?: boolean;
}

const DropdownIndicator = (props: any) => {
    return (
        <components.DropdownIndicator {...props}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                />
            </svg>
        </components.DropdownIndicator>
    );
};

const ReusableSelect: React.FC<Props> = ({
    options,
    value,
    onChange,
    placeholder,
    isMulti = false,
}) => {
    return (
        <Select
            className="react-select-container"
            classNamePrefix="react-select"
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder || 'Select an option'}
            components={{ DropdownIndicator }}
            isMulti={isMulti}
        />
    );
};

export default ReusableSelect;
