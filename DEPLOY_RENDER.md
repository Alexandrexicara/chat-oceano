# 🚀 Deploy no Render

## ⚠️ IMPORTANTE - Configuração Correta

### Build Command
```bash
npm install && npm run build
```

### Start Command
```bash
npm start
```

**NÃO use `npm run dev`** - isso roda o Vite que só funciona em desenvolvimento!

### Environment Variables
Adicione estas variáveis de ambiente no Render:

```
DB_USER=postgres
DB_PASSWORD=celio48
DB_HOST=<seu-host-postgres>
DB_PORT=5432
DB_NAME=oceanos
PORT=3000
NODE_ENV=production
```

## Banco de Dados PostgreSQL no Render

1. Crie um serviço PostgreSQL no Render
2. Copie as credenciais do banco
3. Adicione como variáveis de ambiente

## Estrutura do Deploy

O Render vai:
1. Instalar dependências (`npm install`)
2. Build do frontend (`npm run build`)
3. Iniciar o servidor Node (`npm start`)

O servidor Express serve:
- API em `/api/*`
- WebSocket em `/*`
- Frontend estático em `/*` (arquivos do `dist/`)

## URLs

- **Frontend:** `https://seu-app.onrender.com`
- **API:** `https://seu-app.onrender.com/api/*`
- **WebSocket:** `wss://seu-app.onrender.com`

## Notas

- O Render faz deploy automático ao push no GitHub
- Free tier dorme após 15 minutos de inatividade
- Primeiro acesso pode demorar 30-60 segundos
