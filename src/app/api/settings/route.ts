import { NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/db';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import fs from 'fs/promises';
import { cookies } from 'next/headers';
import { getUserById } from '@/lib/db';

// Helper function to get user from session
async function getUser(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      console.error('No cookie header found');
      return null;
    }

    const userCookieMatch = cookieHeader.match(/user=([^;]+)/);
    if (!userCookieMatch) {
      console.error('No user cookie found');
      return null;
    }

    try {
      const userData = JSON.parse(decodeURIComponent(userCookieMatch[1]));
      return userData;
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Helper function to delete old logo
async function deleteOldLogo(logoUrl: string | undefined) {
  if (!logoUrl) return;
  
  try {
    const filename = logoUrl.split('/').pop();
    if (!filename) return;
    
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
    await unlink(filepath);
    console.log(`Deleted old logo: ${filepath}`);
  } catch (error) {
    // Don't throw if file doesn't exist
    console.error('Error deleting old logo:', error);
  }
}

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get user from session
    const user = await getUser(request);
    if (!user) {
      console.error('Unauthorized: No valid user found');
      return NextResponse.json(
        { error: 'Unauthorized: Please log in' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const logo = formData.get('logo') as File | null;
    const settings = JSON.parse(formData.get('settings') as string);
    console.log('Received settings update:', { user: user.username, settings });

    // Get current settings first
    const currentSettings = await getSettings();
    if (!currentSettings) {
      return NextResponse.json(
        { error: 'Current settings not found' },
        { status: 500 }
      );
    }

    // Check if this is a theme-only update
    const isThemeOnlyUpdate = Object.keys(settings).length === 1 && 'theme' in settings;

    if (isThemeOnlyUpdate) {
      // For theme-only updates, just update the theme while preserving other settings
      const updatedSettings = {
        ...currentSettings,
        theme: settings.theme
      };
      await updateSettings(updatedSettings);
      const newSettings = await getSettings();
      return NextResponse.json(newSettings);
    }

    // For non-theme updates, check if user is admin
    if (user.role !== 'admin') {
      console.error('Unauthorized: User attempted to modify non-theme settings', {
        user: user.username,
        settings
      });
      return NextResponse.json(
        { error: 'Unauthorized: Normal users can only change theme' },
        { status: 401 }
      );
    }

    // Admin user - proceed with full settings update
    if (logo) {
      // Delete old logo if it exists
      if (currentSettings?.logo_url) {
        await deleteOldLogo(currentSettings.logo_url);
      }
      
      const bytes = await logo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Save to public directory
      const filename = `logo-${Date.now()}${path.extname(logo.name)}`;
      const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
      
      await writeFile(filepath, buffer);
      settings.logo_url = `/uploads/${filename}`;
    }

    // For full updates, merge with current settings to ensure all required fields are present
    const updatedSettings = {
      ...currentSettings,
      ...settings
    };

    await updateSettings(updatedSettings);
    const newSettings = await getSettings();
    return NextResponse.json(newSettings);
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 