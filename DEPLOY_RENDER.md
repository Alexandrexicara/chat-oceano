# Deploy do OCEANOS no Render

## Configuração do serviço

O projeto usa Next.js e PostgreSQL.

- **Build Command:** `npm install --legacy-peer-deps && npm run build`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/health`
- **Runtime:** Node.js
- **Plano:** Free

O comando de inicialização lê automaticamente a variável `PORT` fornecida pelo Render. Localmente, usa a porta 3000.

## Variáveis de ambiente

Configure no painel do Render, em Environment:

```env
NODE_ENV=production
DATABASE_URL=<URL_DE_CONEXAO_POSTGRESQL>
```

Não coloque senhas, tokens ou URLs com credenciais no GitHub. O arquivo `.env` é local e está ignorado pelo Git; use um arquivo `.env.example` apenas com nomes e valores fictícios.

## Banco de dados

Use PostgreSQL. A aplicação lê a conexão pela variável `DATABASE_URL`.

## Verificação

Depois do deploy, acesse:

`https://SEU-SERVICO.onrender.com/api/health`

A resposta esperada é JSON com `success: true` e `data.message: "ok"`.

## Observações

- O Render pode suspender serviços gratuitos após período sem uso.
- O primeiro acesso após suspensão pode demorar.
- O deploy automático depende de o serviço Render estar conectado ao repositório e à branch `main`.
