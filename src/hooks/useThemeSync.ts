'use client';

import { useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuth } from '@/context/AuthProvider';
import { toast } from 'sonner';

export function useThemeSync() {
  const { theme: nextTheme, setTheme: setNextTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const {
    theme: dbTheme,
    isLoading,
    fetchThemeFromDB,
    updateThemeInDB,
    setTheme: setStoreTheme,
  } = useSettingsStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchThemeFromDB();
    }
  }, [fetchThemeFromDB, isAuthenticated]);

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

        if (isAuthenticated) {
          await updateThemeInDB(newTheme);
        }
      } catch (error) {
        const fallbackTheme = dbTheme || 'system';
        setNextTheme(fallbackTheme);
        setStoreTheme(fallbackTheme);
        toast.error('Failed to update theme');
      }
    },
    [setNextTheme, setStoreTheme, updateThemeInDB, dbTheme, isAuthenticated]
  );

  return {
    theme: nextTheme,
    dbTheme,
    isLoading,
    changeTheme,
  };
}
