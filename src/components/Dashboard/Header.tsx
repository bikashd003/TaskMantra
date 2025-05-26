import { UserPlus, PanelRightOpen, PanelLeftOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { Playfair_Display } from 'next/font/google';
import { Button } from '../ui/button';
import { TeamLoggerPopover } from './TeamLogger';
import InviteModal from './InviteModal';
import { NotificationsPopover } from './NotificationsPopover';
import { ThemeToggle } from '../ui/theme-toggle';
import { useSidebarStore } from '@/stores/sidebarStore';

const playwrite = Playfair_Display({
  subsets: ['latin'],
  weight: '400',
});

const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { session } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { isExpanded, setIsExpanded } = useSidebarStore();

  const onOpen = () => {
    setIsOpen(true);
  };

  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="flex justify-between items-center px-4 py-2 theme-surface-elevated theme-shadow-lg rounded-lg">
      <div className="flex items-center gap-4">
        <button
          className={`hidden md:flex items-center justify-center w-6 h-6 rounded-lg logo-toggle-btn hover:bg-primary/10 transition-all duration-300`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <PanelLeftOpen className="h-4 w-4 logo-toggle-icon" />
          ) : (
            <PanelRightOpen className="h-4 w-4 logo-toggle-icon" />
          )}
        </button>
        <div>
          <h1 className={`${playwrite.className} text-xl font-bold mb-1 theme-text-primary`}>
            {getGreeting()}, {session?.user?.name}
          </h1>
          <p className="text-sm theme-text-secondary">{formatDate(currentTime)}</p>
        </div>
      </div>
      <div className="flex gap-4 items-center">
        <NotificationsPopover />
        <ThemeToggle />
        <TeamLoggerPopover />
        <Button
          variant="ghost"
          size="default"
          className="theme-button-secondary theme-shadow-sm"
          onClick={onOpen}
        >
          <UserPlus className="w-6 h-6 cursor-pointer theme-transition" />
          Invite
        </Button>
        <InviteModal isOpen={isOpen} onOpenChange={onOpenChange} />
      </div>
    </header>
  );
};

export default Header;
