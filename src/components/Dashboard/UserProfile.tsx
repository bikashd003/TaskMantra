import React from 'react';
import { signOut } from 'next-auth/react';
import { Avatar } from "@heroui/react";
import {
    ChevronRight,
} from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useAuth } from '@/context/AuthProvider';

interface UserProfileProps {
    isExpanded: boolean;
    setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

export function UserProfile({ isExpanded }: UserProfileProps) {
    const session = useAuth().session;
    return (
        <div>
            <div className={`
      p-4 border-b border-gray-700
      flex items-center gap-3
      ${isExpanded ? '' : 'justify-center'}
    `}>
                <Avatar name={session?.user?.name?.charAt(0)} color="success" isBordered radius='full' size='md' />


                {isExpanded && (
                    <>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-sm font-semibold truncate">{session?.user?.name}</h2>
                            <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
                        </div>
                        <Popover>
                            <PopoverTrigger>                        <ChevronRight className="h-5 w-5 text-gray-400" />
                            </PopoverTrigger>
                            <PopoverContent className='w-fit h-fit p-0'>
                                <button
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-md border border-gray-200 shadow-sm transition-colors duration-200"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sign out
                                </button>
                            </PopoverContent>
                        </Popover>

                    </>
                )}
            </div>
        </div>
    );
}