'use client';

import { useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useSettingsStore } from '@/stores/settingsStore';
import { toast } from 'sonner';

export function useThemeSync() {
  const { theme: nextTheme, setTheme: setNextTheme } = useTheme();
  const {
    theme: dbTheme,
    isLoading,
    fetchThemeFromDB,
    updateThemeInDB,
    setTheme: setStoreTheme,
  } = useSettingsStore();

  // Fetch theme from database on mount
  useEffect(() => {
    fetchThemeFromDB();
  }, [fetchThemeFromDB]);

  // Sync next-themes with database theme when database theme changes
  useEffect(() => {
    if (dbTheme && dbTheme !== nextTheme) {
      setNextTheme(dbTheme);
    }
  }, [dbTheme, nextTheme, setNextTheme]);

  // Function to change theme (updates both next-themes and database)
  const changeTheme = useCallback(
    async (newTheme: string) => {
      try {
        // Optimistically update next-themes immediately for better UX
        setNextTheme(newTheme);
        setStoreTheme(newTheme);

        // Update database
        await updateThemeInDB(newTheme);

        toast.success('Theme updated successfully');
      } catch (error) {
        // Revert on error
        setNextTheme(dbTheme);
        setStoreTheme(dbTheme);
        toast.error('Failed to update theme');
      }
    },
    [setNextTheme, setStoreTheme, updateThemeInDB, dbTheme]
  );

  return {
    theme: nextTheme,
    dbTheme,
    isLoading,
    changeTheme,
  };
}
