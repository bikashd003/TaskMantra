import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

interface LogoProps {
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

const Logo = ({ isExpanded, setIsExpanded }: LogoProps) => {
  return (
    <div className={`flex items-center justify-between px-3 py-3 border-b border-gray-100 `}>
      <div className="flex items-center">
        {/* Logo Icon */}
        <div className="relative group">
          <div className="absolute inset-0 rounded-xl"></div>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl shadow-sm group-hover:shadow-md transform group-hover:scale-105 transition-all duration-300">
            <Image
              src="/logo_transparent.png"
              alt="Logo"
              width={32}
              height={32}
              className="filter drop-shadow-sm"
            />
          </div>
        </div>

        {/* Logo Text */}
        <div
          className={`
                        ml-3 overflow-hidden transition-all duration-300 ease-in-out
                        ${isExpanded ? 'w-40 opacity-100' : 'w-0 opacity-0'}
                    `}
        >
          <h1 className="font-['Outfit'] font-bold text-lg text-gray-800">
            Task<span className="text-primary">Mantra</span>
          </h1>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        className={`hidden md:flex items-center  justify-center w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200 shadow-sm ${isExpanded ? '' : '-ml-1'}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        )}
      </button>
    </div>
  );
};

export default Logo;
