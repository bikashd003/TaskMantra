import React, { useState, useCallback } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
    placeholder?: string
    onSearch: (query: string) => void
    className?: string
}

export const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = 'Search...',
    onSearch,
    className = '',
}) => {
    const [query, setQuery] = useState('')

    const handleSearch = useCallback(() => {
        onSearch(query)
    }, [query, onSearch])

    const handleClear = useCallback(() => {
        setQuery('')
        onSearch('')
    }, [onSearch])

    const handleKeyPress = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                handleSearch()
            }
        },
        [handleSearch]
    )

    return (
        <div className={`relative ${className}`}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyUp={handleKeyPress}
                placeholder={placeholder}
                className="w-full py-2 pl-10 pr-10 text-sm text-gray-700 bg-white border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ease-in-out 
                "
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search
                    className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors duration-300 overflow-hidden"
                    onClick={handleSearch}
                />
            </div>
            {query && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <X
                        className="w-5 h-5 text-gray-400 cursor-pointer hover:text-red-500 transition-colors duration-300"
                        onClick={handleClear}
                    />
                </div>
            )}
        </div>
    )
}

