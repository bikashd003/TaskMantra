'use client';

import * as React from 'react';
import { Moon, Sun, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useThemeSync } from '@/hooks/useThemeSync';

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, resolvedTheme } = useTheme();
  const { isLoading, changeTheme } = useThemeSync();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" />;
  }

  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === 'dark';

  const handleThemeToggle = () => {
    const newTheme = isDark ? 'light' : 'dark';
    changeTheme(newTheme);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleThemeToggle}
      disabled={isLoading}
      className="relative w-9 h-9 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-all duration-300 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Toggle theme"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 text-foreground/90 animate-spin" />
      ) : (
        <>
          <motion.div
            initial={false}
            animate={{
              scale: isDark ? 0 : 1,
              rotate: isDark ? 90 : 0,
            }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            <Sun className="h-4 w-4 text-foreground/90 group-hover:text-foreground" />
          </motion.div>
          <motion.div
            initial={false}
            animate={{
              scale: isDark ? 1 : 0,
              rotate: isDark ? 0 : -90,
            }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            <Moon className="h-4 w-4 text-foreground/90 group-hover:text-foreground" />
          </motion.div>
        </>
      )}
    </motion.button>
  );
}
