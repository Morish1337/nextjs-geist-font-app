import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db5018456076.hosting-data.io',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'dbu1419448',
  password: process.env.DB_PASSWORD || 'fk11Braf',
  database: process.env.DB_NAME || 'dbs14669987',
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  charset: 'utf8mb4'
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type ENUM('FREE', 'VIP') DEFAULT 'FREE',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create category_posts table (pour les posts dans les catégories - seul admin peut poster)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS category_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT,
        user_id VARCHAR(36),
        title VARCHAR(255) NOT NULL,
        content TEXT,
        media_url VARCHAR(500),
        media_type ENUM('image', 'video', 'link') DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create messages table for chat (avec channel support)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36),
        content TEXT NOT NULL,
        channel ENUM('free', 'vip') DEFAULT 'free',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create sessions table pour la sécurité
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(36),
        expires_at TIMESTAMP NOT NULL,
        data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Insert default categories avec Finisseur VIP en premier
    await connection.execute(`
      INSERT IGNORE INTO categories (name, type, description) VALUES
      ('Finisseur VIP', 'VIP', 'Contenu exclusif réservé aux membres VIP'),
      ('Finisseur Latina', 'FREE', 'Discussions sur le contenu Latina'),
      ('Finisseur Ass', 'FREE', 'Discussions sur le contenu Ass'),
      ('Finisseur Boobs', 'FREE', 'Discussions sur le contenu Boobs'),
      ('Finisseur 92i', 'FREE', 'Discussions région parisienne'),
      ('Finisseur Cumshot', 'FREE', 'Discussions sur les finitions'),
      ('Finisseur Lesbienne', 'FREE', 'Contenu lesbien'),
      ('Finisseur Fellation', 'FREE', 'Discussions fellation'),
      ('Finisseur Lieu Public', 'FREE', 'Discussions lieu public')
    `);

    // Create admin user if not exists
    const adminPassword = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm'; // password: admin123
    await connection.execute(`
      INSERT IGNORE INTO users (username, email, password_hash, role) VALUES
      ('admin', 'admin@finisseurhub.com', ?, 'ADMIN')
    `, [adminPassword]);

    connection.release();
    console.log('✅ Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

export default pool;
