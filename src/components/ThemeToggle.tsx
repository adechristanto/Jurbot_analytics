'use client';

import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useSettings } from '@/contexts/SettingsContext';

export default function ThemeToggle() {
  const { settings, toggleColorMode } = useSettings();
  const isDark = settings.colorMode === 'dark';

  return (
    <button
      onClick={toggleColorMode}
      className={`btn btn-circle ${isDark ? 'btn-ghost' : 'btn-primary'}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <SunIcon className="w-5 h-5" />
      ) : (
        <MoonIcon className="w-5 h-5" />
      )}
    </button>
  );
} 