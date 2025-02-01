import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs/promises';
import bcrypt from 'bcryptjs';
import { config } from '../config';

const dbPath = path.join(process.cwd(), 'data', 'chat.db');

// Ensure the data directory exists
async function ensureDir() {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
}

// Initialize database
async function initDB() {
  await ensureDir();
  
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  const schema = await fs.readFile(
    path.join(process.cwd(), 'src', 'lib', 'db', 'schema.sql'),
    'utf-8'
  );

  await db.exec(schema);

  // Check if admin user exists
  const admin = await db.get('SELECT * FROM users WHERE username = ?', ['admin']);
  
  if (!admin) {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin', 10);
    await db.run(
      'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
      ['admin', hashedPassword, 'Administrator', 'admin']
    );
  }

  return db;
}

// Get database instance
export async function getDB() {
  const db = await initDB();
  return db;
}

// User functions
export async function validateUser(username: string, password: string) {
  const db = await getDB();
  const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
  
  if (!user) return null;
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;
  
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function getUserById(id: number) {
  const db = await getDB();
  const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
  
  if (!user) return null;
  
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Settings functions
export async function getSettings() {
  const db = await getDB();
  const settings = await db.get('SELECT * FROM settings ORDER BY id DESC LIMIT 1');
  return settings || null;
}

export async function updateSettings(settings: {
  logo_url?: string;
  company_name: string;
  ai_name: string;
  user_name: string;
  webhook_url: string;
  theme: string;
}) {
  const db = await getDB();
  const result = await db.run(`
    INSERT INTO settings (
      logo_url, company_name, ai_name, user_name, webhook_url, theme
    ) VALUES (?, ?, ?, ?, ?, ?)
  `, [
    settings.logo_url || null,
    settings.company_name,
    settings.ai_name,
    settings.user_name,
    settings.webhook_url,
    settings.theme
  ]);
  
  return result;
}

// Initialize settings if not exists
export async function initSettings() {
  const db = await getDB();
  const settings = await getSettings();
  
  if (!settings) {
    await updateSettings({
      company_name: 'Jurbot',
      ai_name: 'Jurbot',
      user_name: 'Anonym',
      webhook_url: config.defaultWebhookUrl,
      theme: 'winter'
    });
  }
} 