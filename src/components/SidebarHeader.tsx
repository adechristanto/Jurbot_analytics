import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import Image from 'next/image';

export default function SidebarHeader() {
  const { settings } = useSettings();
  
  return (
    <div className="flex flex-col items-center p-4 border-b border-base-300">
      {settings.logo_url ? (
        <div className="w-16 h-16 relative rounded-box overflow-hidden mb-2">
          <Image
            src={settings.logo_url}
            alt="Company logo"
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-16 h-16 bg-neutral rounded-box flex items-center justify-center mb-2">
          <span className="text-2xl font-bold text-neutral-content">
            {settings.company_name.charAt(0)}
          </span>
        </div>
      )}
      <h1 className="text-xl font-bold">{settings.company_name}</h1>
    </div>
  );
} 