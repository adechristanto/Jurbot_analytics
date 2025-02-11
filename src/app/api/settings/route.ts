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

    // For non-admin users, only allow theme changes
    if (user.role !== 'admin') {
      if (Object.keys(settings).length > 1 || (Object.keys(settings).length === 1 && !settings.theme)) {
        console.error('Unauthorized: User attempted to modify non-theme settings', {
          user: user.username,
          settings
        });
        return NextResponse.json(
          { error: 'Unauthorized: Normal users can only change theme' },
          { status: 401 }
        );
      }
      
      // Update only theme
      const currentSettings = await getSettings();
      const result = await updateSettings({
        ...currentSettings,
        theme: settings.theme
      });
      const updatedSettings = await getSettings();
      console.log('Theme updated successfully:', {
        user: user.username,
        theme: settings.theme
      });
      return NextResponse.json(updatedSettings);
    }

    // Admin user - proceed with full settings update
    if (logo) {
      // Get current settings to find old logo URL
      const currentSettings = await getSettings();
      
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

    const result = await updateSettings(settings);
    const updatedSettings = await getSettings();
    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 