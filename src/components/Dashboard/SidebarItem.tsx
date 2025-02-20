"use client";
import Link from 'next/link';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  badge?: string | number;
  isExpanded: boolean;
  isActive: boolean;
  path: string | null;
  subItems?: { label: string; path: string }[];
}

export function SidebarItem({
  icon: Icon,
  label,
  badge,
  isExpanded,
  isActive,
  path,
  subItems,
}: SidebarItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className='relative overflow-hidden'>
      {path ? (
        <Link
          href={path}
          className={`
            flex items-center h-12 px-3 my-1 rounded-lg
            transition-colors duration-200
            ${isActive
              ? 'bg-gray-800 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }
            ${subItems ? 'cursor-pointer' : ''}
          `}
          onClick={subItems ? toggleCollapse : undefined}
        >
          <Icon className="h-5 w-5 min-w-[20px]" />

          {isExpanded ? (
            <span className="ml-3">{label}</span>
          ) : (
            <div className="
              fixed left-14 ml-2 px-2 py-1 bg-gray-900 text-white
              rounded-md text-sm whitespace-nowrap opacity-0 invisible
              group-hover:opacity-100 group-hover:visible
              transition-all duration-200 z-50
            ">
              {label}
            </div>
          )}

          {badge && (
            <span
              className={`
                ml-auto ${isExpanded ? '' : 'hidden'}
                px-2 py-0.5 text-xs rounded-full
                ${typeof badge === 'string' ? 'bg-blue-500' : 'bg-red-500'}
              `}
            >
              {badge}
            </span>
          )}

          {isExpanded && subItems && (
            <div className="ml-auto">
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          )}
        </Link>
      ) : (
        <div
          className={`
            flex items-center h-12 px-3 my-1 rounded-lg
            transition-colors duration-200
            ${isActive
              ? 'bg-gray-800 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }
            ${subItems ? 'cursor-pointer' : ''}
          `}
          onClick={subItems ? toggleCollapse : undefined}
        >
          <Icon className="h-5 w-5 min-w-[20px]" />

          {isExpanded ? (
            <span className="ml-3">{label}</span>
          ) : (
            <div className="
              fixed left-14 ml-2 px-2 py-1 bg-gray-900 text-white
              rounded-md text-sm whitespace-nowrap opacity-0 invisible
              group-hover:opacity-100 group-hover:visible
              transition-all duration-200 z-50
            ">
              {label}
            </div>
          )}

          {badge && (
            <span
              className={`
                ml-auto ${isExpanded ? '' : 'hidden'}
                px-2 py-0.5 text-xs rounded-full
                ${typeof badge === 'string' ? 'bg-blue-500' : 'bg-red-500'}
              `}
            >
              {badge}
            </span>
          )}

          {isExpanded && subItems && (
            <div className="ml-auto">
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          )}
        </div>
      )}

      {/* Sub Items */}
      {isExpanded && subItems && (
        <AnimatePresence>
          {isOpen && subItems && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden group-hover:block"
            >
              {subItems.map((subItem) => (
                <Link
                  key={subItem.label}
                  href={subItem.path}
                  className={`
                    pl-8 block py-2 text-sm
                    truncate
                    transition-colors duration-200 rounded-lg
                    ${pathname === subItem.path
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  {subItem.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
