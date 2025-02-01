import { NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/db';
import { writeFile } from 'fs/promises';
import path from 'path';

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
    const formData = await request.formData();
    const logo = formData.get('logo') as File | null;
    const settings = JSON.parse(formData.get('settings') as string);

    if (logo) {
      const bytes = await logo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Save to public directory
      const filename = `logo-${Date.now()}${path.extname(logo.name)}`;
      const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
      
      await writeFile(filepath, buffer);
      settings.logo_url = `/uploads/${filename}`;
    }

    const result = await updateSettings(settings);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 