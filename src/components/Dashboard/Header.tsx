import { UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { Playfair_Display } from 'next/font/google';
import { Button } from '../ui/button';
import { TeamLoggerPopover } from './TeamLogger';
import { useDisclosure } from "@heroui/react";
import InviteModal from './InviteModal';
import { NotificationsPopover } from './NotificationsPopover';

const playwrite = Playfair_Display({
  subsets: ['latin'],
  weight: '400',
})

const Header = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [currentTime, setCurrentTime] = useState(new Date());
  const { session } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="flex justify-between items-center px-4 py-2 bg-white text-black shadow-lg rounded-lg">
      <div>
        <h1 className={`${playwrite.className} text-xl font-bold mb-1`}>{getGreeting()}, {session?.user?.name}</h1>
        <p className="text-sm opacity-80">{formatDate(currentTime)}</p>
      </div>
      <div className="flex space-x-6 items-center">
        <NotificationsPopover />
        <TeamLoggerPopover />
        <Button variant="ghost" size="default" className='border shadow-sm bg-gray-100' onClick={onOpen}>
          <UserPlus className="w-6 h-6 cursor-pointer hover:text-gray-200" />
          Invite
        </Button>
        <InviteModal isOpen={isOpen} onOpenChange={onOpenChange} />
      </div>
    </header>
  );
};

export default Header;
