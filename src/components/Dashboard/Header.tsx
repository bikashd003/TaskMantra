import { Bell, UserPlus, Settings } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { Playwrite_IN } from 'next/font/google';
import { Button } from '../ui/button';

const playwrite = Playwrite_IN({
    weight: '400',
})

const Header = () => {
  const [currentTime] = useState(new Date());
  const { session } = useAuth();

  const formatDate = (date:any) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) {
      return 'Good Morning';
    } else if (hour < 18) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  return (
    <header className="flex justify-between items-center p-4 mt-2 bg-white text-black shadow-lg mx-2 rounded-lg">
      <div>
        <h1 className={`${playwrite.className} text-sm font-bold`}>{getGreeting()}, {session?.user?.name}</h1>
        <p className="text-sm">{formatDate(currentTime)}</p>
      </div>
      <div className="flex space-x-4 items-center">
        <Bell className="w-6 h-6 cursor-pointer hover:text-gray-200" />
        <Button variant="ghost" className='border shadow-sm bg-gray-100'>
          <UserPlus className="w-6 h-6 cursor-pointer hover:text-gray-200" />
          Invite
        </Button>
        <Button variant="ghost" className='border shadow-sm bg-gray-100'>
        <Settings className="w-6 h-6 cursor-pointer hover:text-gray-200" />
        Settings
        </Button>
      </div>
    </header>
  );
};

export default Header;