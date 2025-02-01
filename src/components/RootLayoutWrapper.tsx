'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';

export default function RootLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SettingsProvider>
        <div className="min-h-screen bg-base-100">
          {children}
        </div>
      </SettingsProvider>
    </AuthProvider>
  );
} 