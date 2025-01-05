import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface LogoProps {
    isExpanded: boolean;
    setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

const Logo = ({ isExpanded, setIsExpanded }: LogoProps) => {
    return (
        <div className={`flex items-center justify-between px-4 py-5 border-b border-gray-700/50 ${isExpanded ? '' : 'flex-col items-center'} `}>
            <div className="flex items-center">
                {/* Logo Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                    <span className="text-xl font-bold text-white">TM</span>
                </div>

                {/* Logo Text */}
                <div
                    className={`
                        ml-3 overflow-hidden transition-all duration-300 ease-in-out
                        ${isExpanded ? 'w-32 opacity-100' : 'w-0 opacity-0'}
                    `}
                >
                    <h1 className="font-['Outfit'] font-bold text-xl bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                        TaskMantra
                    </h1>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                className="hidden md:flex items-center justify-center w-6 h-6 rounded-lg
                     transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
                {isExpanded ? (
                    <ChevronLeft className="h-6 w-6 text-gray-400" />
                ) : (
                    <ChevronRight className="h-6 w-6 text-gray-400" />
                )}
            </button>
        </div>
    );
};

export default Logo;