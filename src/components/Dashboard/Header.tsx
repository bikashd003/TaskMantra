import React from 'react';
import { Plus, Bell, Settings } from 'lucide-react';
import { SearchBar } from './SearchBar';

const Header = () => {
    const handleSearch = (query: string) => {
        console.log('Searching for:', query)
        // Implement your search logic here
    }
    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2 px-4 lg:px-8 pt-4 lg:pt-4">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Onyx web design project</h1>
                <p className="text-gray-500 mt-1">Dashboard design for Onyx Agency</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:gap-6 w-full lg:w-auto">
                <SearchBar
                    placeholder="Search for anything..."
                    onSearch={handleSearch}
                    className="overflow-hidden"
                />

                <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors">
                    <Plus size={20} />
                    <span className="hidden sm:inline">Add new task</span>
                </button>

                <div className="flex items-center gap-2">
                    <Bell size={20} />
                    <Settings size={20} />
                </div>
            </div>
        </div>
    );
};

export default Header;