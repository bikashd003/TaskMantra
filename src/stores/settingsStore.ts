import { create } from 'zustand';
import { SettingService } from '@/services/Setting.service';

interface SettingsStore {
  theme: string;
  isLoading: boolean;
  setTheme: (theme: string) => void;
  fetchThemeFromDB: () => Promise<void>;
  updateThemeInDB: (theme: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>(set => ({
  theme: 'dark',
  isLoading: false,
  setTheme: (theme: string) => set({ theme }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),

  fetchThemeFromDB: async () => {
    try {
      set({ isLoading: true });
      const response = await SettingService.getGeneralSettings();
      const theme = response?.general?.appearance?.theme || 'dark';
      set({ theme, isLoading: false });
    } catch (error) {
      set({ theme: 'dark', isLoading: false });
    }
  },

  updateThemeInDB: async (theme: string) => {
    try {
      set({ isLoading: true });
      await SettingService.updateTheme(theme);
      set({ theme, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
