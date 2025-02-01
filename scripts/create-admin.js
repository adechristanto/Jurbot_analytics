const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function createAdmin() {
  // Generate hash for password 'admin'
  const password = 'admin';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Connect to database
  const db = await open({
    filename: path.join(__dirname, '..', 'data', 'chat.db'),
    driver: sqlite3.Database
  });
  
  // Delete existing admin user
  await db.run('DELETE FROM users WHERE username = ?', ['admin']);
  
  // Create new admin user
  await db.run(
    'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
    ['admin', hashedPassword, 'Administrator', 'admin']
  );
  
  console.log('Admin user created successfully');
  console.log('Username: admin');
  console.log('Password: admin');
  
  await db.close();
}

createAdmin().catch(console.error); 