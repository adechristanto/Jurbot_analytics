import { NextResponse } from 'next/server';
import { validateUser } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const user = await validateUser(username, password);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 