'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppSettings {
  logo_url?: string;
  company_name: string;
  ai_name: string;
  user_name: string;
  webhook_url: string;
  theme: string;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>, logoFile?: File) => Promise<void>;
  isSaving: boolean;
}

// Available DaisyUI themes
export const availableThemes = [
  'light',
  'dark',
  'cupcake',
  'corporate',
  'retro',
  'cyberpunk',
  'valentine',
  'garden',
  'forest',
  'aqua',
  'pastel',
  'fantasy',
  'dracula',
  'autumn',
  'business',
  'winter',
] as const;

const defaultSettings: AppSettings = {
  company_name: 'Jurbot analytics',
  ai_name: 'Jurbot',
  user_name: 'Anonym',
  webhook_url: 'https://ai.sollution.ai/webhook/8afed7ca-062c-44d9-9b70-f6616aa7ad52',
  theme: 'light', // Default theme
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load settings from API
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setSettings(data);
            document.documentElement.setAttribute('data-theme', data.theme);
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    // Update theme whenever settings change
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const updateSettings = async (newSettings: Partial<AppSettings>, logoFile?: File) => {
    try {
      setIsSaving(true);
      const formData = new FormData();
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      
      const updatedSettings = { ...settings, ...newSettings };
      formData.append('settings', JSON.stringify(updatedSettings));

      const response = await fetch('/api/settings', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      setSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isSaving }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 