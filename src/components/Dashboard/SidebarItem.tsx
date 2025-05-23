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
            ${isActive ? 'sidebar-item-active' : 'sidebar-item'}
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
              fixed left-14 ml-2 px-2.5 py-1.5 sidebar-tooltip
              rounded-md text-xs font-medium whitespace-nowrap opacity-0 invisible
              group-hover:opacity-100 group-hover:visible
              theme-transition z-50
            "
            >
              {label}
            </div>
          )}

          {badge && (
            <span
              className={`
                ml-auto text-xs ${isExpanded ? '' : 'hidden'}
                ${typeof badge === 'string' ? 'sidebar-badge-primary px-2 rounded-md' : 'sidebar-badge-secondary px-2  rounded-md'}
              `}
            >
              {badge}
            </span>
          )}

          {isExpanded && subItems && (
            <div className="ml-auto">
              {isOpen ? (
                <ChevronUp className="h-4 w-4 sidebar-chevron" />
              ) : (
                <ChevronDown className="h-4 w-4 sidebar-chevron" />
              )}
            </div>
          )}
        </Link>
      ) : (
        <div
          className={`
            flex items-center h-10 px-3 my-1 rounded-lg
            ${isActive ? 'sidebar-item-active' : 'sidebar-item'}
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
              fixed left-14 ml-2 px-2.5 py-1.5 sidebar-tooltip
              rounded-md text-xs font-medium whitespace-nowrap opacity-0 invisible
              group-hover:opacity-100 group-hover:visible
              theme-transition z-50
            "
            >
              {label}
            </div>
          )}

          {badge && (
            <span
              className={`
                ml-auto ${isExpanded ? '' : 'hidden'}
                ${typeof badge === 'string' ? 'sidebar-badge-primary' : 'sidebar-badge-secondary'}
              `}
            >
              {badge}
            </span>
          )}

          {isExpanded && subItems && (
            <div className="ml-auto">
              {isOpen ? (
                <ChevronUp className="h-4 w-4 sidebar-chevron" />
              ) : (
                <ChevronDown className="h-4 w-4 sidebar-chevron" />
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
              className="overflow-hidden group-hover:block pl-2 border-l sidebar-sub-item ml-4 mt-1"
            >
              {subItems.map(subItem => (
                <Link
                  key={subItem.label}
                  href={subItem.path}
                  className={`
                    pl-8 block py-2 text-sm
                    truncate rounded-lg
                    ${pathname === subItem.path ? 'sidebar-sub-item-active' : 'sidebar-sub-item'}
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
