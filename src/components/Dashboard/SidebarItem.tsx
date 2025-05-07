'use client';
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
    <div className="relative overflow-hidden">
      {path ? (
        <Link
          href={path}
          className={`
            flex items-center h-10 px-3 my-1 rounded-lg
            transition-all duration-200
            ${
              isActive
                ? 'bg-primary/10 text-primary font-medium shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }
            ${subItems ? 'cursor-pointer' : ''}
          `}
          onClick={subItems ? toggleCollapse : undefined}
        >
          <Icon className="h-5 w-5 min-w-[20px]" />

          {isExpanded ? (
            <span className="ml-3">{label}</span>
          ) : (
            <div
              className="
              fixed left-14 ml-2 px-2.5 py-1.5 bg-white text-gray-800
              rounded-md text-xs font-medium whitespace-nowrap opacity-0 invisible
              group-hover:opacity-100 group-hover:visible shadow-lg border border-gray-100
              transition-all duration-200 z-50
            "
            >
              {label}
            </div>
          )}

          {badge && (
            <span
              className={`
                ml-auto ${isExpanded ? '' : 'hidden'}
                px-2 py-0.5 text-xs font-medium rounded-full
                ${typeof badge === 'string' ? 'bg-primary/15 text-primary' : 'bg-red-100 text-red-600'}
              `}
            >
              {badge}
            </span>
          )}

          {isExpanded && subItems && (
            <div className="ml-auto">
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </div>
          )}
        </Link>
      ) : (
        <div
          className={`
            flex items-center h-10 px-3 my-1 rounded-lg
            transition-all duration-200
            ${
              isActive
                ? 'bg-primary/10 text-primary font-medium shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }
            ${subItems ? 'cursor-pointer' : ''}
          `}
          onClick={subItems ? toggleCollapse : undefined}
        >
          <Icon className="h-5 w-5 min-w-[20px]" />

          {isExpanded ? (
            <span className="ml-3">{label}</span>
          ) : (
            <div
              className="
              fixed left-14 ml-2 px-2.5 py-1.5 bg-white text-gray-800
              rounded-md text-xs font-medium whitespace-nowrap opacity-0 invisible
              group-hover:opacity-100 group-hover:visible shadow-lg border border-gray-100
              transition-all duration-200 z-50
            "
            >
              {label}
            </div>
          )}

          {badge && (
            <span
              className={`
                ml-auto ${isExpanded ? '' : 'hidden'}
                px-2 py-0.5 text-xs font-medium rounded-full
                ${typeof badge === 'string' ? 'bg-primary/15 text-primary' : 'bg-red-100 text-red-600'}
              `}
            >
              {badge}
            </span>
          )}

          {isExpanded && subItems && (
            <div className="ml-auto">
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
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
              className="overflow-hidden group-hover:block pl-2 border-l border-gray-200 ml-4 mt-1"
            >
              {subItems.map(subItem => (
                <Link
                  key={subItem.label}
                  href={subItem.path}
                  className={`
                    pl-8 block py-2 text-sm
                    truncate
                    transition-all duration-200 rounded-lg
                    ${
                      pathname === subItem.path
                        ? 'bg-primary/5 text-primary font-medium'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
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
