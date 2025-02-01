CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    logo_url TEXT,
    company_name TEXT NOT NULL,
    ai_name TEXT NOT NULL,
    user_name TEXT NOT NULL,
    webhook_url TEXT NOT NULL,
    theme TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
); 