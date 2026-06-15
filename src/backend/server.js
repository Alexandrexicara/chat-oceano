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
    origin: [
      "http://localhost:5173", 
      "http://localhost:5174", 
      "http://localhost:5175",
      "https://chat-oceano.onrender.com"
    ],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "http://localhost:5174", 
    "http://localhost:5175",
    "https://chat-oceano.onrender.com"
  ],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Servir arquivos estáticos do frontend em produção
const frontendPath = path.join(__dirname, '../../dist');
app.use(express.static(frontendPath));

// Pool de conexão com PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.Database_Url,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000, // 10 segundos timeout
});

// Log de diagnóstico do banco
console.log('🔧 Configuração do Banco:');
const dbUrl = process.env.DATABASE_URL || process.env.Database_Url;
if (dbUrl) {
  console.log('   DATABASE_URL: ✅ definida');
  const hostPart = dbUrl.split('@')[1]?.split('/')[0] || 'N/A';
  console.log(`   Host: ${hostPart}`);
  console.log(`   Database: ${dbUrl.split('/').pop() || 'N/A'}`);
  
  // Verificar se o hostname parece incompleto (apenas para Render)
  if (hostPart.includes('render.com') && !hostPart.endsWith('.render.com')) {
    console.log('   ⚠️ ATENÇÃO: Hostname parece incompleto!');
    console.log('   O hostname deve terminar com .render.com');
    console.log('   Exemplo correto: dpg-xxx.ohio-postgres.render.com');
    console.log('   Verifique a variável DATABASE_URL no painel do Render.');
    console.log('   Vá em: Settings → Environment Variables → DATABASE_URL');
  }
  
  console.log('   📋 Formato: postgres://user:pass@host.region.render.com:port/dbname');
} else {
  console.log('   ⚠️ DATABASE_URL NÃO DEFINIDA!');
  console.log(`   DB_HOST: ${process.env.DB_HOST || 'NÃO DEFINIDO'}`);
  console.log(`   DB_PORT: ${process.env.DB_PORT || 'NÃO DEFINIDO'}`);
  console.log(`   DB_NAME: ${process.env.DB_NAME || 'NÃO DEFINIDO'}`);
  console.log(`   DB_USER: ${process.env.DB_USER || 'NÃO DEFINIDO'}`);
  console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '***definido***' : 'NÃO DEFINIDO'}`);
}

// Configuração do multer para uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../public/uploads'),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

// ===== MIGRAÇÃO AUTOMÁTICA DE TIPOS DE COLUNAS =====
// Alterar colunas integer para bigint para suportar IDs grandes
async function migrateToBigint() {
  try {
    console.log('🔄 Executando migração: integer → bigint...');
    
    // Alterar colunas da tabela messages
    await pool.query(`
      ALTER TABLE messages 
      ALTER COLUMN sender_id TYPE bigint,
      ALTER COLUMN receiver_id TYPE bigint
    `).catch(e => console.log('   messages: já está bigint'));
    
    // Alterar colunas da tabela contacts
    await pool.query(`
      ALTER TABLE contacts 
      ALTER COLUMN user_id TYPE bigint,
      ALTER COLUMN contact_id TYPE bigint
    `).catch(e => console.log('   contacts: já está bigint'));
    
    // Alterar coluna da tabela users
    await pool.query(`
      ALTER TABLE users 
      ALTER COLUMN id TYPE bigint
    `).catch(e => console.log('   users: já está bigint'));
    
    console.log('✅ Migração concluída!');
  } catch (error) {
    console.error('⚠️ Aviso migração:', error.message);
  }
}

// Executar migração ao iniciar
migrateToBigint();

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
  const { username, name, phone, city, country, language } = req.body;
  try {
    // Tentar encontrar usuário
    let result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      // Criar novo usuário com todos os campos
      result = await pool.query(
        'INSERT INTO users (name, username, phone, bio, city, country, language) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [name || username, username, phone || null, 'Novo no Oceanos 🌊', city || null, country || 'BR', language || 'pt-BR']
      );
    } else {
      // Atualizar campos se não tiver
      const updates = [];
      const values = [];
      let idx = 1;
      
      if (phone && !result.rows[0].phone) {
        updates.push(`phone = $${idx++}`);
        values.push(phone);
      }
      if (city && !result.rows[0].city) {
        updates.push(`city = $${idx++}`);
        values.push(city);
      }
      if (country && !result.rows[0].country) {
        updates.push(`country = $${idx++}`);
        values.push(country);
      }
      if (language && !result.rows[0].language) {
        updates.push(`language = $${idx++}`);
        values.push(language);
      }
      
      if (updates.length > 0) {
        values.push(username);
        await pool.query(
          `UPDATE users SET ${updates.join(', ')} WHERE username = $${idx}`,
          values
        );
      }
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro no login:', error.message);
    console.error('Detalhes:', error.detail);
    res.status(500).json({ error: error.message });
  }
});

// Criar usuário
app.post('/api/users', async (req, res) => {
  const { name, username, phone, bio, city, country, language } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, username, phone, bio, city, country, language) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, username, phone, bio, city, country, language || 'pt-BR']
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

// Atualizar perfil do usuário (incluindo avatar)
app.put('/api/users/:username', async (req, res) => {
  const { username } = req.params;
  const { name, bio, city, country, avatar } = req.body;
  
  try {
    const updates = [];
    const values = [];
    let idx = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${idx++}`);
      values.push(name);
    }
    if (bio !== undefined) {
      updates.push(`bio = $${idx++}`);
      values.push(bio);
    }
    if (city !== undefined) {
      updates.push(`city = $${idx++}`);
      values.push(city);
    }
    if (country !== undefined) {
      updates.push(`country = $${idx++}`);
      values.push(country);
    }
    if (avatar !== undefined) {
      updates.push(`avatar = $${idx++}`);
      values.push(avatar);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    values.push(username);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE username = $${idx} RETURNING *`,
      values
    );
    
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
       VALUES ($1::bigint, $2::bigint, $3, $4, $5, $6, $7) RETURNING *`,
      [sender_id, receiver_id || null, text, media_url || null, media_type || null, file_name || null, is_oceano || false]
    );
    
    // Emitir evento via WebSocket
    io.emit('new_message', result.rows[0]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error.message);
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
       WHERE (sender_id = $1::bigint AND receiver_id = $2::bigint) 
          OR (sender_id = $2::bigint AND receiver_id = $1::bigint)
       ORDER BY created_at ASC`,
      [userId1, userId2]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar mensagens:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ===== CONTATOS =====

// Buscar contatos de um usuário
app.get('/api/contacts/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    // Verificar se usuário existe
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1::bigint', [userId]);
    
    if (userCheck.rows.length === 0) {
      // Usuário não existe, retorna array vazio (não é erro)
      return res.json([]);
    }
    
    const result = await pool.query(
      `SELECT u.* FROM contacts c 
       JOIN users u ON c.contact_id = u.id 
       WHERE c.user_id = $1::bigint`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    // Em caso de erro, retorna array vazio
    console.error('Erro ao buscar contatos:', error.message);
    res.json([]);
  }
});

// Buscar usuários por telefone (para sincronizar contatos WhatsApp)
app.post('/api/users/find-by-phones', async (req, res) => {
  const { phones } = req.body; // Array de telefones
  try {
    if (!phones || !Array.isArray(phones) || phones.length === 0) {
      return res.json([]);
    }
    
    // Filtrar apenas números válidos (strings não vazias)
    const validPhones = phones.filter(p => typeof p === 'string' && p.trim().length > 0);
    
    if (validPhones.length === 0) {
      return res.json([]);
    }
    
    // Buscar usuários por telefone - tratar erro de tipo
    const result = await pool.query(
      `SELECT id, name, username, phone, avatar, status 
       FROM users 
       WHERE phone = ANY($1::text[])`,
      [validPhones]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar usuários por telefone:', error.message);
    console.error('Detalhes:', error.detail);
    res.json([]);
  }
});

// Adicionar contato (com verificação de duplicata)
app.post('/api/contacts', async (req, res) => {
  const { user_id, contact_id } = req.body;
  try {
    // Verificar se contato já existe
    const checkResult = await pool.query(
      'SELECT id FROM contacts WHERE user_id = $1::bigint AND contact_id = $2::bigint',
      [user_id, contact_id]
    );
    
    if (checkResult.rows.length > 0) {
      // Contato já existe, retorna sucesso sem duplicar
      console.log(`✅ Contato já existe: ${user_id} -> ${contact_id}`);
      return res.json({ message: 'Contato já existe', id: checkResult.rows[0].id });
    }
    
    // Adicionar novo contato
    const result = await pool.query(
      'INSERT INTO contacts (user_id, contact_id) VALUES ($1::bigint, $2::bigint) RETURNING *',
      [user_id, contact_id]
    );
    console.log(`✅ Novo contato adicionado: ${user_id} -> ${contact_id}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao adicionar contato:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Enviar convite via WhatsApp (retorna link)
app.post('/api/invite/whatsapp', async (req, res) => {
  const { phone, inviterName } = req.body;
  try {
    // Gerar link de convite
    const inviteLink = `https://chat-oceano.onrender.com/invite/${Date.now()}`;
    const message = encodeURIComponent(
      `🌊 Olá! ${inviterName} te convidou para o Oceanos - o mensageiro pirata!\n\n` +
      `Entre agora e venha navegar conosco: ${inviteLink}\n\n` +
      `🏴‍☠️ Baixe o app e cadastre-se!`
    );
    
    // Link direto para WhatsApp
    const whatsappLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`;
    
    res.json({ 
      success: true, 
      whatsappLink,
      message: 'Convite pronto para enviar!'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  const dbUrl = process.env.DATABASE_URL || process.env.Database_Url;
  const dbName = dbUrl ? dbUrl.split('/').pop() : process.env.DB_NAME;
  console.log(`🌊 Banco de dados: ${dbName || 'NÃO CONFIGURADO'}`);
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

    // Criar tabelas SEQUENCIALMENTE para evitar deadlock
    console.log('🔄 Criando/verificando tabelas...');
    
    // 1. Criar tabela users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        phone VARCHAR(30),
        bio TEXT,
        city VARCHAR(100),
        country VARCHAR(10),
        language VARCHAR(10) DEFAULT 'pt-BR',
        avatar VARCHAR(255),
        status VARCHAR(20) DEFAULT 'Online',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ Tabela users OK');
    
    // 2. Adicionar colunas que podem estar faltando
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30)`).catch(() => {});
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT`).catch(() => {});
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100)`).catch(() => {});
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(10)`).catch(() => {});
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'pt-BR'`).catch(() => {});
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(255)`).catch(() => {});
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Online'`).catch(() => {});
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`).catch(() => {});
    console.log('   ✅ Colunas users OK');
    
    // 3. Criar tabela messages
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id BIGINT REFERENCES users(id),
        receiver_id BIGINT REFERENCES users(id),
        text TEXT,
        media_url VARCHAR(500),
        media_type VARCHAR(50),
        file_name VARCHAR(255),
        is_oceano BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ Tabela messages OK');
    
    // 4. Criar tabela contacts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id),
        contact_id BIGINT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, contact_id)
      )
    `);
    console.log('   ✅ Tabela contacts OK');
    
    // 5. Criar índices
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)`).catch(() => {});
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id)`).catch(() => {});
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_oceano ON messages(is_oceano)`).catch(() => {});
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id)`).catch(() => {});
    console.log('   ✅ Índices OK');
    
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
