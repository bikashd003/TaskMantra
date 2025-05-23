'use client';

import React from 'react';
import { useThemeSync } from '@/hooks/useThemeSync';

export function ThemeSyncProvider({ children }: { children: React.ReactNode }) {
  // This will automatically fetch and sync theme on mount
  useThemeSync();

  return <>{children}</>;
}
