import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

interface LogoProps {
    isExpanded: boolean;
    setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

const Logo = ({ isExpanded, setIsExpanded }: LogoProps) => {
    return (
        <div className={`flex items-center justify-between px-4 py-2 border-b border-gray-700/50 ${isExpanded ? '' : 'flex-col items-center'} `}>
            <div className="flex items-center">
                {/* Logo Icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg transform hover:scale-105 transition-all duration-300">
                    <Image
                        src="/logo_transparent.png"
                        alt="Logo"
                        width={40}
                        height={40}
                        className="filter drop-shadow-md"
                    />
                </div>

                {/* Logo Text */}
                <div
                    className={`
                        ml-4 overflow-hidden transition-all duration-300 ease-in-out
                        ${isExpanded ? 'w-40 opacity-100' : 'w-0 opacity-0'}
                    `}
                >
                    <h1 className="font-['Outfit'] font-bold text-xl bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                        TaskMantra
                    </h1>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-300 shadow-md -ml-2"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
                {isExpanded ? (
                    <ChevronLeft className="h-5 w-5 text-gray-300" />
                ) : (
                        <ChevronRight className="h-5 w-5 text-gray-300" />
                )}
            </button>
        </div>
    );
};

export default Logo;