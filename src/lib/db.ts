import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db5018456076.hosting-data.io',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'dbu1419448',
  password: process.env.DB_PASSWORD || 'fk11Braf',
  database: process.env.DB_NAME || 'finisseurhub_db',
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
});

// Test the connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Initialize database tables if they don't exist
export async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('FREE', 'VIP', 'ADMIN') DEFAULT 'FREE',
        status ENUM('ACTIVE', 'BANNED') DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type ENUM('FREE', 'VIP') DEFAULT 'FREE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create posts table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT,
        user_id VARCHAR(36),
        title VARCHAR(255) NOT NULL,
        content TEXT,
        visibility ENUM('FREE', 'VIP') DEFAULT 'FREE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create messages table for chat
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Insert default categories
    await connection.execute(`
      INSERT IGNORE INTO categories (name, type) VALUES
      ('Finisseur Latina', 'FREE'),
      ('Finisseur Ass', 'FREE'),
      ('Finisseur Boobs', 'FREE'),
      ('Finisseur 92i', 'FREE'),
      ('Finisseur Cumshot', 'FREE'),
      ('Finisseur Lesbienne', 'FREE'),
      ('Finisseur Fellation', 'FREE'),
      ('Finisseur Lieu Public', 'FREE'),
      ('Finisseur VIP', 'VIP')
    `);

    connection.release();
    console.log('✅ Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

export default pool;
