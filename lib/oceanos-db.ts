import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL!

// Pool singleton
let sql: ReturnType<typeof postgres> | null = null

export function getDb() {
  if (!sql) {
    sql = postgres(connectionString, {
      ssl: 'prefer',
      max: 10,
      idle_timeout: 20,
      connect_timeout: 20,
    })
  }
  return sql
}

// Inicializar tabelas do Oceanos
export async function initOceanosDb() {
  const db = getDb()

  await db.unsafe(`
    CREATE TABLE IF NOT EXISTS oceanos_users (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      username VARCHAR(50) UNIQUE NOT NULL,
      phone VARCHAR(30),
      bio TEXT DEFAULT 'Novo no Oceanos 🌊',
      city VARCHAR(100),
      country VARCHAR(10) DEFAULT 'BR',
      language VARCHAR(10) DEFAULT 'pt-BR',
      avatar VARCHAR(500),
      status VARCHAR(20) DEFAULT 'Online',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await db.unsafe(`
    CREATE TABLE IF NOT EXISTS oceanos_messages (
      id BIGSERIAL PRIMARY KEY,
      sender_id BIGINT REFERENCES oceanos_users(id),
      receiver_id BIGINT,
      text TEXT,
      media_url VARCHAR(1000),
      media_type VARCHAR(50),
      file_name VARCHAR(255),
      is_oceano BOOLEAN DEFAULT false,
      views INT DEFAULT 0,
      likes INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await db.unsafe(`
    CREATE TABLE IF NOT EXISTS oceanos_contacts (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT REFERENCES oceanos_users(id),
      contact_id BIGINT REFERENCES oceanos_users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, contact_id)
    )
  `)

  // Índices
  await db.unsafe(`CREATE INDEX IF NOT EXISTS idx_om_sender ON oceanos_messages(sender_id)`).catch(() => {})
  await db.unsafe(`CREATE INDEX IF NOT EXISTS idx_om_receiver ON oceanos_messages(receiver_id)`).catch(() => {})
  await db.unsafe(`CREATE INDEX IF NOT EXISTS idx_om_oceano ON oceanos_messages(is_oceano)`).catch(() => {})
  await db.unsafe(`CREATE INDEX IF NOT EXISTS idx_oc_user ON oceanos_contacts(user_id)`).catch(() => {})
}
