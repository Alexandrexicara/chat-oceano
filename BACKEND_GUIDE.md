# 🌊 Oceanos - Backend com PostgreSQL

## 🚀 Como Iniciar

### 1. Iniciar o Backend (Porta 3000)
```bash
npm run dev:backend
```

### 2. Iniciar o Frontend (Porta 5173)
```bash
npm run dev
```

### 3. Iniciar Ambos ao Mesmo Tempo
```bash
npm install -g concurrently
npm run dev:all
```

## 🗄️ Banco de Dados

### Configuração
- **Host:** localhost
- **Port:** 5432
- **Database:** oceanos
- **User:** postgres
- **Password:** celio48

### Inicializar Banco de Dados
```bash
npm run db:init
```

Isso vai criar:
- ✅ Tabela `users` (usuários)
- ✅ Tabela `messages` (mensagens/garrafas)
- ✅ Tabela `contacts` (contatos)
- ✅ Dados iniciais de teste

## 📡 API Endpoints

### Usuários
- `POST /api/users` - Criar usuário
- `GET /api/users/:username` - Buscar usuário

### Mensagens
- `POST /api/messages` - Enviar mensagem (garrafa)
- `GET /api/messages/:userId1/:userId2` - Buscar mensagens do chat
- `GET /api/messages/oceano` - Buscar mensagens públicas do oceano

### Contatos
- `POST /api/contacts` - Adicionar contato
- `GET /api/contacts/:userId` - Listar contatos

### Upload
- `POST /api/upload` - Upload de arquivos

### Health Check
- `GET /api/health` - Verificar status do servidor

## 🔌 WebSocket

Conexão: `ws://localhost:3000`

### Eventos
- `new_message` - Recebido quando nova mensagem é enviada
- `send_message` - Enviar mensagem via WebSocket

## 🎵 Sons

- **Som normal:** Som de ondas suave
- **Garrafa/Barril:** Splash + ondas do mar

## ✨ Funcionalidades

✅ Banco de dados PostgreSQL real
✅ API REST completa
✅ WebSocket para tempo real
✅ Upload de arquivos (áudio, vídeo, imagens)
✅ Sons de ondas ao receber garrafas
✅ Garrafas e barris com imagens
✅ Layout responsivo para celular
✅ Gravação de áudio e vídeo
✅ Contatos reais do banco de dados
