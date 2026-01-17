# Quickstart: Firebase Auth + Asaas Payments

**Feature**: `001-firebase-auth-asaas-payments`
**Date**: 2026-01-15

Este guia fornece instruções para configurar e executar a feature localmente.

---

## Prerequisites

- Node.js 20+
- npm ou yarn
- Conta Firebase (com projeto criado)
- Conta Asaas (sandbox)

---

## 1. Firebase Setup

### 1.1 Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Crie um novo projeto ou use um existente
3. Ative **Authentication** com provedores:
   - Email/Password
   - Google
4. Ative **Firestore Database** em modo de produção

### 1.2 Obter Credenciais Client

1. Em Project Settings > General > Your apps
2. Registre um app Web
3. Copie as configurações

### 1.3 Obter Credenciais Admin (Service Account)

1. Em Project Settings > Service accounts
2. Clique em "Generate new private key"
3. Salve o JSON em local seguro (NÃO commite!)

---

## 2. Asaas Setup

### 2.1 Criar Conta Sandbox

1. Acesse [Asaas Sandbox](https://sandbox.asaas.com)
2. Crie uma conta de teste
3. Em Configurações > Integrações, obtenha a **API Key**

### 2.2 Configurar Webhook

1. Em Configurações > Webhooks
2. Adicione URL: `https://SEU_DOMINIO/api/payments/webhook`
3. Selecione eventos:
   - PAYMENT_RECEIVED
   - PAYMENT_CONFIRMED
   - PAYMENT_OVERDUE
4. Anote o **Access Token** do webhook

> **Nota**: Para desenvolvimento local, use ngrok ou similar para expor localhost

---

## 3. Environment Variables

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Firebase Client (público)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin (privado)
FIREBASE_ADMIN_PROJECT_ID=seu-projeto
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@seu-projeto.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"

# Asaas
ASAAS_API_KEY=sua_api_key_sandbox
ASAAS_ENVIRONMENT=sandbox
ASAAS_WEBHOOK_TOKEN=seu_webhook_token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Importante**: Adicione `.env.local` ao `.gitignore`

---

## 4. Install Dependencies

```bash
npm install firebase firebase-admin zod react-hook-form uuid
npm install -D vitest @testing-library/react playwright
```

---

## 5. Run Development Server

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 6. Create Admin User

Após o primeiro cadastro, promova um usuário a admin via Firestore Console:

1. Acesse Firebase Console > Firestore
2. Encontre o documento do usuário em `users/{uid}`
3. Edite o campo `role` de `"user"` para `"admin"`

---

## 7. Test Flows

### 7.1 Flow de Cadastro

1. Acesse `/cadastro`
2. Preencha email, senha e nome
3. Verifique redirecionamento para `/minha-conta/perfil`
4. Complete o perfil com CPF

### 7.2 Flow de Inscrição (Autenticado)

1. Faça login
2. Acesse um evento aberto
3. Selecione categoria e confirme inscrição
4. Verifique status "pendente"

### 7.3 Flow de Pagamento PIX

1. Na inscrição pendente, clique em "Pagar"
2. Selecione PIX
3. Verifique QR Code e código copia-e-cola
4. No sandbox Asaas, simule o pagamento
5. Verifique que inscrição mudou para "confirmado"

### 7.4 Flow de Visitante

1. Sem fazer login, acesse um evento
2. Clique em "Inscrever-se"
3. Preencha dados de visitante (nome, email, telefone, CPF)
4. Complete o pagamento
5. Use "Consultar Inscrição" informando CPF

---

## 8. Test Webhook Locally

### Usando ngrok

```bash
# Terminal 1: Inicie o servidor
npm run dev

# Terminal 2: Inicie ngrok
ngrok http 3000
```

1. Copie a URL do ngrok (ex: `https://abc123.ngrok.io`)
2. Configure no Asaas: `https://abc123.ngrok.io/api/payments/webhook`
3. Faça um pagamento de teste
4. Verifique logs no terminal

---

## 9. Common Issues

### Firebase Admin "Invalid Credentials"

- Verifique se `FIREBASE_ADMIN_PRIVATE_KEY` está com `\n` escapados
- Use aspas duplas ao redor do valor

### Webhook não chega

- Verifique se a URL é pública (ngrok)
- Verifique se o token está correto
- Veja logs no painel Asaas > Webhooks > Histórico

### CPF inválido

- Use CPFs válidos para teste: `191.191.191-88` (apenas sandbox)
- O algoritmo rejeita CPFs com todos dígitos iguais

---

## 10. Useful Commands

```bash
# Dev server
npm run dev

# Build
npm run build

# Lint
npm run lint

# Tests (quando implementados)
npm run test
npm run test:e2e
```

---

## Next Steps

Após configuração inicial:

1. Execute `/speckit.tasks` para gerar tarefas de implementação
2. Siga a ordem de prioridade (P1 primeiro)
3. Execute testes após cada fase
