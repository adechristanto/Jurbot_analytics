import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

// Sample data for when webhook is not configured
const sampleData = [
  {
    session_id: "sample-session-1",
    messages: [
      {
        role: "human",
        content: "Hello, how can I help you today?",
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        role: "ai",
        content: "Hi! I'm looking for information about your services.",
        created_at: new Date(Date.now() - 3500000).toISOString()
      }
    ]
  },
  {
    session_id: "sample-session-2",
    messages: [
      {
        role: "human",
        content: "What are your business hours?",
        created_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        role: "ai",
        content: "We're open Monday to Friday, 9 AM to 5 PM.",
        created_at: new Date(Date.now() - 7100000).toISOString()
      }
    ]
  }
];

export async function GET() {
  try {
    const db = await getDB();
    const settings = await db.get('SELECT webhook_url FROM settings ORDER BY id DESC LIMIT 1');
    
    // If no webhook URL is configured, return sample data
    if (!settings?.webhook_url) {
      console.log('No webhook URL configured, returning sample data');
      return NextResponse.json(sampleData);
    }

    try {
      const response = await fetch(settings.webhook_url);
      if (!response.ok) {
        throw new Error('Failed to fetch data from webhook');
      }
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Webhook error:', error);
      // Return sample data as fallback if webhook fails
      return NextResponse.json(sampleData);
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 