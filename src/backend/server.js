import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Servir arquivos estáticos do frontend em produção
const frontendPath = path.join(__dirname, '../../dist');
app.use(express.static(frontendPath));

// Pool de conexão com PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000, // 10 segundos timeout
});

// Log de diagnóstico do banco
console.log('🔧 Configuração do Banco:');
console.log(`   DB_HOST: ${process.env.DB_HOST || 'NÃO DEFINIDO'}`);
console.log(`   DB_PORT: ${process.env.DB_PORT || 'NÃO DEFINIDO'}`);
console.log(`   DB_NAME: ${process.env.DB_NAME || 'NÃO DEFINIDO'}`);
console.log(`   DB_USER: ${process.env.DB_USER || 'NÃO DEFINIDO'}`);
console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '***definido***' : 'NÃO DEFINIDO'}`);

// Configuração do multer para uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../public/uploads'),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

// ===== ROTAS DA API =====

// Testar conexão com banco
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Upload de arquivos
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }
  res.json({
    message: 'Arquivo enviado com sucesso!',
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`
  });
});

// ===== USUÁRIOS =====

// Login ou criar usuário
app.post('/api/auth/login', async (req, res) => {
  const { username, name, phone } = req.body;
  try {
    // Tentar encontrar usuário
    let result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      // Criar novo usuário com telefone
      result = await pool.query(
        'INSERT INTO users (name, username, phone, bio) VALUES ($1, $2, $3, $4) RETURNING *',
        [name || username, username, phone || null, 'Novo no Oceanos 🌊']
      );
    } else if (phone && !result.rows[0].phone) {
      // Atualizar telefone se não tiver
      await pool.query(
        'UPDATE users SET phone = $1 WHERE username = $2',
        [phone, username]
      );
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar usuário
app.post('/api/users', async (req, res) => {
  const { name, username, phone, bio, city, country } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, username, phone, bio, city, country) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, username, phone, bio, city, country]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar usuário por username
app.get('/api/users/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== MENSAGENS (GARRAFAS) =====

// Enviar mensagem (garrafa)
app.post('/api/messages', async (req, res) => {
  const { sender_id, receiver_id, text, media_url, media_type, file_name, is_oceano } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, text, media_url, media_type, file_name, is_oceano) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [sender_id, receiver_id || null, text, media_url || null, media_type || null, file_name || null, is_oceano || false]
    );
    
    // Emitir evento via WebSocket
    io.emit('new_message', result.rows[0]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar mensagens do oceano (públicas) - DEVE vir antes de /:userId1/:userId2
app.get('/api/messages/oceano', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM messages WHERE is_oceano = true ORDER BY created_at DESC LIMIT 100'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar mensagens de um chat
app.get('/api/messages/:userId1/:userId2', async (req, res) => {
  const { userId1, userId2 } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE (sender_id = $1 AND receiver_id = $2) 
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      [userId1, userId2]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== CONTATOS =====

// Buscar usuários por telefone (para sincronizar contatos WhatsApp)
app.post('/api/users/find-by-phones', async (req, res) => {
  const { phones } = req.body; // Array de telefones
  try {
    const result = await pool.query(
      'SELECT id, name, username, phone, avatar, status FROM users WHERE phone = ANY($1)',
      [phones]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enviar convite via WhatsApp (retorna link)
app.post('/api/invite/whatsapp', async (req, res) => {
  const { phone, inviterName } = req.body;
  try {
    // Gerar link de convite
    const inviteLink = `https://oceanos.app/invite/${Date.now()}`;
    const message = encodeURIComponent(
      `🌊 Olá! ${inviterName} te convidou para o Oceanos - o mensageiro pirata!\n\n` +
      `Entre agora e venha navegar conosco: ${inviteLink}\n\n` +
      `🏴‍☠️ Baixe o app e cadastre-se!`
    );
    
    // Link direto para WhatsApp
    const whatsappLink = `https://wa.me/${phone}?text=${message}`;
    
    res.json({ 
      success: true, 
      whatsappLink,
      message: 'Convite pronto para enviar!'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Adicionar contato
app.post('/api/contacts', async (req, res) => {
  const { user_id, contact_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO contacts (user_id, contact_id) VALUES ($1, $2) RETURNING *',
      [user_id, contact_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar contatos de um usuário
app.get('/api/contacts/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    // Verificar se usuário existe
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    
    if (userCheck.rows.length === 0) {
      // Usuário não existe, retorna array vazio (não é erro)
      return res.json([]);
    }
    
    const result = await pool.query(
      `SELECT u.* FROM contacts c 
       JOIN users u ON c.contact_id = u.id 
       WHERE c.user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    // Em caso de erro, retorna array vazio
    console.error('Erro ao buscar contatos:', error.message);
    res.json([]);
  }
});

// ===== WEBSOCKET =====

io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  socket.on('send_message', (message) => {
    io.emit('receive_message', message);
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);
  });
});

// ===== INICIALIZAR SERVIDOR =====

const PORT = process.env.PORT || 3000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

server.listen(PORT, HOST, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌊 Banco de dados: ${process.env.DB_NAME}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  
  // Criar tabelas se não existirem
  await initializeDatabase();
});

// Rota catch-all para servir o frontend em produção (Express 5 syntax)
app.get('/{*splat}', (req, res) => {
  const indexPath = path.join(__dirname, '../../dist/index.html');
  res.sendFile(indexPath);
});

async function initializeDatabase() {
  try {
    // Testar conexão primeiro
    console.log('🔄 Testando conexão com PostgreSQL...');
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida com PostgreSQL!');
    client.release();

    // Criar tabelas
    console.log('🔄 Criando/verificando tabelas...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        phone VARCHAR(20), -- Número de telefone para WhatsApp
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
    
    console.log('✅ Tabelas criadas/verificadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:');
    console.error('   Tipo:', error.name);
    console.error('   Mensagem:', error.message || 'Sem mensagem');
    console.error('   Código:', error.code || 'Sem código');
    console.error('   Detalhe:', error.detail || 'Sem detalhe');
    console.error('   Stack:', error.stack?.substring(0, 200) || 'Sem stack');
    console.log('\n⚠️  O app continua rodando, mas sem banco de dados!');
    console.log('   Verifique as variáveis de ambiente no Render.');
  }
}
