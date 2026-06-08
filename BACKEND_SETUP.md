# 🚀 OCEANOS - Backend Setup Guide

## Visão Geral

Este documento fornece instruções para criar e integrar o backend do Oceanos com o frontend React.

---

## 📦 Tecnologias Recomendadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Socket.IO** - Comunicação em tempo real
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas

### Banco de Dados
- **MongoDB** (NoSQL) - Recomendado para escalabilidade
- **PostgreSQL** (SQL) - Alternativa mais robusta

### Autenticação
- **JWT (JSON Web Tokens)**
- **Refresh Tokens**
- **CORS**

---

## 📁 Estrutura Recomendada do Backend

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── environment.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── messageController.js
│   │   └── statusController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Message.js
│   │   ├── Status.js
│   │   └── Contact.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── messages.js
│   │   └── status.js
│   ├── socket/
│   │   └── handlers.js
│   └── server.js
├── .env
├── .env.example
├── package.json
└── README.md
```

---

## 🛠️ Setup do Backend

### 1. Criar Diretório e Inicializar

```bash
mkdir oceanos-backend
cd oceanos-backend
npm init -y
```

### 2. Instalar Dependências

```bash
npm install express dotenv cors socket.io mongoose bcryptjs jsonwebtoken
npm install --save-dev nodemon
```

### 3. Configurar package.json

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "build": "echo 'No build needed for Node.js'"
  }
}
```

### 4. Criar .env

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/oceanos
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRATION=7d
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:5173
```

---

## 🔌 Exemplo: Servidor Express Básico

### src/server.js

```javascript
const express = require('express')
const cors = require('cors')
const http = require('http')
const socketIO = require('socket.io')
require('dotenv').config()

const app = express()
const server = http.createServer(app)
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
})

// Middleware
app.use(cors())
app.use(express.json())

// Rotas básicas
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '🌊 Oceanos Backend Rodando!' })
})

// Socket.IO
io.on('connection', (socket) => {
  console.log('Novo usuário conectado:', socket.id)

  socket.on('send_message', (data) => {
    console.log('Mensagem:', data)
    io.emit('receive_message', data)
  })

  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id)
  })
})

// Iniciar servidor
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`🌊 Oceanos Backend rodando em porta ${PORT}`)
})
```

---

## 🗄️ Modelos MongoDB

### User Schema

```javascript
{
  _id: ObjectId,
  name: String,
  username: String (unique),
  email: String (unique),
  password: String (hash),
  profileImage: String (URL),
  bio: String,
  city: String,
  country: String,
  status: Enum ['online', 'offline', 'away'],
  followers: Array<ObjectId>,
  following: Array<ObjectId>,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Schema

```javascript
{
  _id: ObjectId,
  senderId: ObjectId,
  receiverId: ObjectId,
  content: String,
  type: Enum ['text', 'image', 'video', 'audio'],
  mediaUrl: String,
  timestamp: Date,
  isRead: Boolean,
  chatId: ObjectId
}
```

### Status Schema

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  content: String,
  type: Enum ['text', 'image', 'video'],
  mediaUrl: String,
  expiresAt: Date (24h depois),
  views: Array<ObjectId>,
  likes: Array<ObjectId>,
  createdAt: Date
}
```

---

## 🔐 Autenticação com JWT

### src/middleware/auth.js

```javascript
const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' })
  }
}
```

---

## 🔗 Integração Frontend-Backend

### 1. Instalar axios no frontend

```bash
npm install axios
```

### 2. Criar serviço API

```javascript
// src/utils/api.js
import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
})

// Adicionar token aos headers
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

### 3. Usar no AuthContext

```javascript
// src/context/AuthContext.jsx
import api from '../utils/api'

const register = async (userData) => {
  const response = await api.post('/auth/register', userData)
  localStorage.setItem('token', response.data.token)
  setUser(response.data.user)
}

const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password })
  localStorage.setItem('token', response.data.token)
  setUser(response.data.user)
}
```

---

## 🔄 WebSocket para Chat em Tempo Real

### Frontend: useEffect no Chat

```javascript
import { useEffect, useState } from 'react'
import io from 'socket.io-client'

export function Chat() {
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const newSocket = io('http://localhost:5000')
    
    newSocket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message])
    })

    setSocket(newSocket)
    
    return () => newSocket.disconnect()
  }, [])

  const sendMessage = (text) => {
    socket.emit('send_message', {
      text,
      sender: user.id,
      timestamp: new Date()
    })
  }

  return (
    // Seu JSX
  )
}
```

---

## 📤 Upload de Arquivos

Recomendado usar:
- **Cloudinary** (Cloud)
- **AWS S3** (Enterprise)
- **Supabase Storage** (Open Source)

### Exemplo com Cloudinary

```javascript
npm install cloudinary next-cloudinary
```

```javascript
// Form upload
<input type="file" onChange={uploadFile} />

const uploadFile = async (e) => {
  const formData = new FormData()
  formData.append('file', e.target.files[0])
  
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  
  return response.data.url
}
```

---

## 🚀 Deploy

### Opções Recomendadas

#### Backend
- **Heroku** (fácil, gratuito)
- **Railway** (moderno)
- **Render** (alternativa)
- **AWS EC2** (mais controle)

#### Frontend
- **Vercel** (próximo de Vite)
- **Netlify** (fácil)
- **GitHub Pages** (estático)

### Deploy no Vercel (Frontend)

```bash
npm install -g vercel
vercel
```

### Deploy no Render (Backend)

1. Fazer push no GitHub
2. Conectar repositório no Render
3. Configurar variáveis de ambiente
4. Deploy automático

---

## 📊 Variáveis de Ambiente

### Backend (.env)
```
PORT=5000
NODE_ENV=production
MONGODB_URI=<sua_uri_mongodb>
JWT_SECRET=<sua_chave_secreta>
JWT_EXPIRATION=7d
BCRYPT_ROUNDS=10
CORS_ORIGIN=<seu_frontend_url>
```

### Frontend (.env)
```
VITE_API_URL=<seu_backend_url>
```

---

## ✅ Checklist de Implementação

- [ ] Setup inicial (Node + Express)
- [ ] Conectar MongoDB/PostgreSQL
- [ ] Implementar autenticação JWT
- [ ] Criar modelos (User, Message, Status)
- [ ] Criar rotas API
- [ ] Implementar Socket.IO
- [ ] Integrar com frontend
- [ ] Testes (Jest, Supertest)
- [ ] Documentação API (Swagger)
- [ ] Deploy

---

## 📚 Recursos Úteis

- [Express.js Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Socket.IO Docs](https://socket.io/docs/)
- [JWT.io](https://jwt.io/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Próximo Passo**: Implementar backend seguindo este guia!
