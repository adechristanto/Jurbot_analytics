'use client';

import React, { useState, useRef } from 'react';
import { useSettings, availableThemes } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import UserManagement from '@/components/UserManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const { settings, updateSettings, isSaving } = useSettings();
  const { user } = useAuth();
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(settings.logo_url || null);
  const [formData, setFormData] = useState(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not admin
  React.useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size and type
      if (file.size > 1024 * 1024) { // 1MB
        alert('File size must be less than 1MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('File must be an image');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setIsDirty(true);
    }
  };

  const handleInputChange = (key: keyof typeof settings, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      const logoFile = fileInputRef.current?.files?.[0];
      await updateSettings(formData, logoFile);
      setIsDirty(false);
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings');
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="btn btn-ghost btn-sm"
              aria-label="Go back"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
          <button
            onClick={handleSave}
            className="btn btn-neutral"
            disabled={!isDirty || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="card bg-base-100 shadow">
              <div className="card-body space-y-6">
                {/* Branding Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Branding</h2>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Logo</span>
                    </label>
                    <div className="flex items-center gap-4">
                      {previewUrl && (
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-base-200">
                          <Image
                            src={previewUrl}
                            alt="Logo preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoChange}
                        accept="image/*"
                        className="file-input file-input-bordered w-full max-w-xs"
                      />
                    </div>
                    <label className="label">
                      <span className="label-text-alt">Maximum size: 512px x 512px, 1MB</span>
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Company Name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                    />
                  </div>
                </div>

                {/* Names Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Names</h2>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">AI Assistant Name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={formData.ai_name}
                      onChange={(e) => handleInputChange('ai_name', e.target.value)}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">User Display Name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={formData.user_name}
                      onChange={(e) => handleInputChange('user_name', e.target.value)}
                    />
                  </div>
                </div>

                {/* API Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">API Configuration</h2>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Webhook URL</span>
                    </label>
                    <input
                      type="url"
                      className="input input-bordered"
                      value={formData.webhook_url}
                      onChange={(e) => handleInputChange('webhook_url', e.target.value)}
                    />
                  </div>
                </div>

                {/* Theme Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Theme</h2>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Theme</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={formData.theme}
                      onChange={(e) => handleInputChange('theme', e.target.value)}
                    >
                      {availableThemes.map((theme) => (
                        <option key={theme} value={theme}>
                          {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </option>
                      ))}
                    </select>
                    <label className="label">
                      <span className="label-text-alt">Select a theme to change the appearance of the dashboard</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement currentUser={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 