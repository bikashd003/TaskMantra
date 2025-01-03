import React from 'react';
import { Plus, Bell, Settings } from 'lucide-react';
import Image from 'next/image';

const Header = () => {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 px-4 lg:px-8 pt-4 lg:pt-8">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Onyx web design project</h1>
                <p className="text-gray-500 mt-1">Dashboard design for Onyx Agency</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:gap-6 w-full lg:w-auto">
                {/* <SearchBar /> */}

                <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors">
                    <Plus size={20} />
                    <span className="hidden sm:inline">Add new task</span>
                </button>

                <div className="flex items-center gap-2">
                    <Bell size={20} />
                    <Settings size={20} />
                </div>

                <Image
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40"
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                />
            </div>
        </div>
    );
};

export default Header;