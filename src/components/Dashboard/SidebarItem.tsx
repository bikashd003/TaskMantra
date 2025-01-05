"use client";
import Link from 'next/link';
import React from 'react';

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    badge?: string | number;
    isExpanded: boolean;
    isActive: boolean;
    path: string;
}

export function SidebarItem({ icon: Icon,
    label,
    badge,
    isExpanded,
    isActive,
    path }: SidebarItemProps) {
    return (
        <Link
            href={path}
            className={`
            flex items-center h-12 px-3 my-1 rounded-lg
            transition-colors duration-200
            ${isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }
        `}
        >
            <Icon className="h-5 w-5 min-w-[20px]" />

            {isExpanded ? (
                <span className="ml-3">{label}</span>
            ) : (
                <div className="
          absolute left-full ml-6 px-2 py-1 bg-gray-900 text-white
          rounded-md text-sm whitespace-nowrap opacity-0 invisible
          group-hover:opacity-100 group-hover:visible
          transition-all duration-200
        ">
                    {label}
                </div>
            )}

            {badge && (
                <span className={`
          ml-auto ${isExpanded ? '' : 'hidden'}
          px-2 py-0.5 text-xs rounded-full
          ${typeof badge === 'string' ? 'bg-blue-500' : 'bg-red-500'}
        `}>
                    {badge}
                </span>
            )}
        </Link>
    );
}