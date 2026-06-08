# 🌊 OCEANOS - Plataforma de Comunicação

## 📋 Visão Geral

Oceanos é uma plataforma de comunicação inspirada em conceitos oceânicos, oferecendo uma experiência moderna de chat, status e rede social com identidade visual própria.

**Status do Projeto**: Frontend em Desenvolvimento ✅

---

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas

```
src/
├── pages/              # Páginas principais da aplicação
│   ├── Auth.jsx       # Login e Cadastro
│   ├── Chat.jsx       # Chat e Mensagens
│   ├── Status.jsx     # Sistema de Status (Garrafas)
│   └── Profile.jsx    # Perfil e Contatos
├── components/        # Componentes reutilizáveis
│   └── BaseComponents.jsx  # Header, Card, Button, Input, Badge, Loading
├── context/          # Gerenciamento de estado global
│   └── AuthContext.jsx     # Contexto de autenticação e usuário
├── styles/           # Temas e estilos
│   └── theme.js      # Cores, espaçamento, tipografia, animações
├── utils/            # Funções utilitárias
├── App.jsx           # Componente raiz
├── App.css           # Estilos da aplicação
└── index.css         # Estilos globais
```

---

## 🎨 Identidade Visual

### Paleta de Cores

| Cor | Hex | Uso |
|-----|-----|-----|
| Azul Oceano | `#0066cc` | Primária |
| Azul Claro | `#00a3ff` | Secundária/Destaque |
| Azul Escuro | `#0a1628` | Background |
| Azul Superfície | `#1a2f4d` | Cards/Containers |
| Azul Borda | `#2a4365` | Bordas |
| Branco | `#ffffff` | Texto principal |
| Cinza Azulado | `#b0c4de` | Texto secundário |

### Tipografia

- **Headings**: Poppins (sem-serifa)
- **Body**: Inter / Segoe UI (sem-serifa)
- **Mono**: Consolas (monoespacial)

### Animações

- `wave`: Movimento ondulante
- `float`: Flutuação suave
- `pulse`: Pulsação
- `shimmer`: Brilho

---

## 📱 Páginas Implementadas

### 1. **Auth** (Login/Cadastro)
- ✅ Login com email e senha
- ✅ Cadastro de novo usuário
- ✅ Validação de formulários
- ✅ Tema oceânico

### 2. **Chat** (Mensagens)
- ✅ Lista de conversas
- ✅ Histórico de mensagens
- ✅ Envio de mensagens em tempo real (simulado)
- ✅ Resposta automática
- ✅ Timestamps
- ✅ Scroll automático

### 3. **Status** (Garrafas no Mar)
- ✅ Visualização de status em grid
- ✅ Animação de flutuação
- ✅ Criação de novo status
- ✅ Contador de visualizações
- ✅ Interações (curtir)

### 4. **Profile** (Perfil e Contatos)
- ✅ Edição de perfil
- ✅ Estatísticas do usuário
- ✅ Lista de contatos
- ✅ Sugestões de contatos
- ✅ Status online/offline

---

## 🔐 Sistema de Autenticação

### AuthContext

```javascript
useAuth() // Hook para acessar contexto de autenticação
```

**Funcionalidades:**
- `register(userData)` - Registrar novo usuário
- `login(email, password)` - Fazer login
- `logout()` - Sair da conta
- `addContact(contact)` - Adicionar contato
- `removeContact(contactId)` - Remover contato
- `updateProfile(updates)` - Atualizar perfil

---

## 🚀 Como Usar

### 1. **Instalar Dependências**
```bash
npm install
```

### 2. **Iniciar Servidor de Desenvolvimento**
```bash
npm run dev
```

### 3. **Build para Produção**
```bash
npm run build
```

### 4. **Preview do Build**
```bash
npm run preview
```

---

## 📦 Dependências Principais

- **React 19.2.4** - Framework
- **Vite 8.0.7** - Build tool
- **JavaScript Vanilla** - Sem bibliotecas CSS externas (styled-in-JS)

---

## 🔜 Próximos Passos (Roadmap)

### Backend
- [ ] Node.js + Express
- [ ] MongoDB ou PostgreSQL
- [ ] JWT para autenticação segura
- [ ] bcryptjs para hash de senhas
- [ ] Socket.IO para tempo real

### Funcionalidades
- [ ] Upload de fotos de perfil
- [ ] Chat em tempo real com WebSocket
- [ ] Grupos de conversa
- [ ] Videochamadas
- [ ] Áudio/Vídeo em mensagens
- [ ] Status com imagens/vídeos
- [ ] Notificações push
- [ ] Bloqueio de usuários
- [ ] Recuperação de senha por email

### Melhorias
- [ ] PWA (Progressive Web App)
- [ ] Temas escuro/claro
- [ ] Modo offline
- [ ] Sincronização com servidor
- [ ] Indicador "digitando"
- [ ] Reações em mensagens (emojis)

---

## 🛠️ Estrutura de Componentes

### BaseComponents.jsx

Componentes reutilizáveis:

```javascript
<Header>         // Cabeçalho com navegação
<Container>      // Contenedor com max-width
<Card>           // Cartão com estilo oceano
<Button>         // Botão com variantes
<Input>          // Input com label
<Badge>          // Badge/Tag colorida
<Loading>        // Spinner de carregamento
```

---

## 🎯 Variáveis de Tema

Acessar tema:

```javascript
import { theme } from '../styles/theme'

theme.colors.primary      // #0066cc
theme.spacing.md          // 16px
theme.borderRadius.lg     // 16px
theme.shadows.md          // Shadow oceano
theme.fonts.sizes.lg      // 20px
```

---

## 📝 Estrutura de Dados

### User

```javascript
{
  id: Number,
  name: String,
  username: String,
  email: String,
  password: String,
  bio: String,
  city: String,
  country: String,
  profileImage: String,
  createdAt: Date,
  followers: Number,
  statusCount: Number,
  messagesCount: Number,
}
```

### Message

```javascript
{
  id: Number,
  sender: String,
  text: String,
  timestamp: String,
  isOwn: Boolean,
}
```

### Status

```javascript
{
  id: Number,
  author: String,
  avatar: String,
  content: String,
  type: 'text' | 'image' | 'video',
  timestamp: String,
  views: Number,
}
```

---

## 🔒 Segurança (Futura)

- [ ] Senhas criptografadas com bcrypt
- [ ] JWT para autenticação
- [ ] HTTPS
- [ ] Validação de entrada
- [ ] CORS configurado
- [ ] Rate limiting
- [ ] Proteção contra XSS/CSRF

---

## 📞 Suporte

Para dúvidas ou sugestões sobre o projeto, entre em contato.

---

## 📄 Licença

ISC

---

**Última Atualização**: 2024
**Versão**: 0.0.1
