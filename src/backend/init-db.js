import { Pool } from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function initializeDatabase() {
  try {
    console.log('🔗 Conectando ao banco de dados...');
    
    // Criar tabelas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        bio TEXT,
        city VARCHAR(100),
        country VARCHAR(100),
        avatar VARCHAR(255),
        status VARCHAR(20) DEFAULT 'Online',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id),
        receiver_id INTEGER REFERENCES users(id),
        text TEXT,
        media_url VARCHAR(500),
        media_type VARCHAR(50),
        file_name VARCHAR(255),
        is_oceano BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        contact_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, contact_id)
      );

      CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
      CREATE INDEX IF NOT EXISTS idx_messages_oceano ON messages(is_oceano);
      CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id);
    `);
    
    console.log('✅ Tabelas criadas com sucesso!');

    // Inserir dados iniciais
    const sqlFile = join(__dirname, 'init-data.sql');
    const sql = readFileSync(sqlFile, 'utf-8');
    await pool.query(sql);
    
    console.log('✅ Dados iniciais inseridos!');
    console.log('🎉 Banco de dados inicializado com sucesso!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
