'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" />;
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative w-9 h-9 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-all duration-300 flex items-center justify-center group"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{
          scale: theme === 'dark' ? 0 : 1,
          rotate: theme === 'dark' ? 90 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Sun className="h-4 w-4 text-foreground/90 group-hover:text-foreground" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          scale: theme === 'dark' ? 1 : 0,
          rotate: theme === 'dark' ? 0 : -90,
        }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Moon className="h-4 w-4 text-foreground/90 group-hover:text-foreground" />
      </motion.div>
    </motion.button>
  );
}
