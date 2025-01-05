/* eslint-disable @next/next/no-img-element */
import React from 'react';
import {
    ChevronRight,
} from 'lucide-react';

interface UserProfileProps {
    isExpanded: boolean;
    setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

export function UserProfile({ isExpanded }: UserProfileProps) {
    return (
        <div>
            <div className={`
      p-4 border-b border-gray-700
      flex items-center gap-3
      ${isExpanded ? '' : 'justify-center'}
    `}>
                <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="User avatar"
                    className="w-10 h-10 rounded-full"
                />

                {isExpanded && (
                    <>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-sm font-semibold truncate">John Doe</h2>
                            <p className="text-xs text-gray-400 truncate">john@example.com</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                    </>
                )}
            </div>
        </div>
    );
}