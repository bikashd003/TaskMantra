import React from 'react';
import { signOut } from 'next-auth/react';
import { Avatar } from "@heroui/react";
import { ChevronRight, LogOut, Wifi, WifiOff } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useAuth } from '@/context/AuthProvider';
import { useNotifications } from '@/hooks/useNotifications';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UserProfileProps {
    isExpanded: boolean;
    setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

export function UserProfile({ isExpanded }: UserProfileProps) {
    const session = useAuth().session;
    const { isConnected } = useNotifications()
    return (
        <div className="border-t border-gray-700/50 shadow-lg relative">
            <div className={`
      px-4 py-2 border-b border-gray-700
      flex items-center gap-4
      ${isExpanded ? '' : 'justify-center'}
    `}>
                <div className="relative">
                    {session?.user?.image && <Avatar src={session?.user?.image} radius='full' size='md' />}
                    {!session?.user?.image && <Avatar name={session?.user?.name?.charAt(0)} color="primary" radius='full' size='md' />}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-gray-800">
                                    {isConnected ? (
                                        <Wifi className="h-3 w-3 text-green-500" />
                                    ) : (
                                        <WifiOff className="h-3 w-3 text-red-500" />
                                    )}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{isConnected ? 'Connected' : 'Disconnected'}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {isExpanded && (
                    <>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-base font-semibold text-white truncate">{session?.user?.name}</h2>
                            <p className="text-xs text-gray-300 truncate">{session?.user?.email}</p>
                        </div>
                        <Popover>
                            <PopoverTrigger>
                                <ChevronRight className="h-6 w-6 text-gray-400 hover:text-white transition-colors duration-200" />
                            </PopoverTrigger>
                            <PopoverContent className='w-fit h-fit p-0'>
                                <button
                                    className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-200 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors duration-200"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                >
                                    <LogOut className="h-5 w-5" />
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