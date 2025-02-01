import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Get all users
export async function GET() {
  try {
    const db = await getDB();
    const users = await db.all('SELECT id, username, name, role FROM users ORDER BY id DESC');
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, name, role } = body;

    // Validate required fields
    if (!username || !password || !name || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (role !== 'admin' && role !== 'user') {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const db = await getDB();

    // Check if username already exists
    const existingUser = await db.get('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // Begin transaction
      await db.run('BEGIN TRANSACTION');

      // Insert new user
      const result = await db.run(
        'INSERT INTO users (username, password, name, role, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
        [username, hashedPassword, name, role]
      );

      // Verify the insert was successful
      if (!result.lastID) {
        await db.run('ROLLBACK');
        throw new Error('Failed to create user');
      }

      // Get the created user
      const createdUser = await db.get(
        'SELECT id, username, name, role FROM users WHERE id = ?',
        [result.lastID]
      );

      if (!createdUser) {
        await db.run('ROLLBACK');
        throw new Error('Failed to retrieve created user');
      }

      // Commit transaction
      await db.run('COMMIT');

      console.log('User created successfully:', createdUser);
      return NextResponse.json(createdUser);
    } catch (dbError) {
      // Rollback on error
      await db.run('ROLLBACK');
      console.error('Database error:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 