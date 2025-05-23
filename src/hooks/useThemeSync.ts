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

  useEffect(() => {
    fetchThemeFromDB();
  }, [fetchThemeFromDB]);

  useEffect(() => {
    if (dbTheme && dbTheme !== nextTheme) {
      setNextTheme(dbTheme);
    }
  }, [dbTheme, nextTheme, setNextTheme]);

  const changeTheme = useCallback(
    async (newTheme: string) => {
      try {
        setNextTheme(newTheme);
        setStoreTheme(newTheme);
        await updateThemeInDB(newTheme);
      } catch (error) {
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
