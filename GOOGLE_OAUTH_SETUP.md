# 🔐 Configuração do Google OAuth no Supabase

## 📋 **Pré-requisitos**
- Conta no Google Cloud Console
- Projeto no Supabase configurado
- Acesso ao painel administrativo do Supabase

## 🚀 **Passo a Passo**

### 1️⃣ **Google Cloud Console**

#### 1.1 Criar/Selecionar Projeto
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Anote o **Project ID**

#### 1.2 Habilitar APIs
1. Vá para **APIs & Services > Library**
2. Procure e habilite:
   - **Google+ API** (se disponível)
   - **Google Identity API**

#### 1.3 Criar Credenciais OAuth
1. Vá para **APIs & Services > Credentials**
2. Clique em **"Create Credentials" > "OAuth 2.0 Client IDs"**
3. Selecione **"Web application"**
4. Configure:

**Authorized JavaScript origins:**
```
http://localhost:8082
http://localhost:3000
http://localhost:5173
https://seu-dominio.com (quando em produção)
```

**Authorized redirect URIs:**
```
https://cbwpghrkfvczjqzefviy.supabase.co/auth/v1/callback
http://localhost:8082/auth/callback
http://localhost:3000/auth/callback
```

5. Clique em **"Create"**
6. **Anote o Client ID e Client Secret**

### 2️⃣ **Supabase Dashboard**

#### 2.1 Acessar Configurações
1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **Authentication > Providers**

#### 2.2 Configurar Google Provider
1. Encontre **Google** na lista de providers
2. Clique no toggle para **ativar**
3. Preencha os campos:
   - **Client ID:** (do Google Cloud Console)
   - **Client Secret:** (do Google Cloud Console)
4. Clique em **"Save"**

### 3️⃣ **Configuração do Projeto**

#### 3.1 Ativar OAuth no Código
1. Abra `src/pages/Register.tsx`
2. Localize a função `handleGoogleLogin`
3. **Descomente** o código entre `/*` e `*/`
4. Remova a mensagem temporária

#### 3.2 Repetir para Login
1. Abra `src/pages/Login.tsx`
2. Localize a função `handleGoogleLogin`
3. **Descomente** o código entre `/*` e `*/`
4. Remova o console.log temporário

### 4️⃣ **Teste da Configuração**

#### 4.1 Teste Local
1. Reinicie o servidor: `npm run dev`
2. Acesse `http://localhost:8082/register`
3. Clique em **"Continuar com Google"**
4. Deve redirecionar para o Google OAuth

#### 4.2 Verificar Logs
- Abra o console do navegador (F12)
- Verifique se não há erros de OAuth
- Confirme o redirecionamento correto

## ⚠️ **Problemas Comuns**

### Erro: "OAuth client was not found"
- **Causa:** Client ID incorreto ou não configurado
- **Solução:** Verificar credenciais no Supabase

### Erro: "Redirect URI mismatch"
- **Causa:** URLs de redirecionamento incorretas
- **Solução:** Adicionar todas as URLs necessárias no Google Console

### Erro: "Invalid client"
- **Causa:** Client Secret incorreto
- **Solução:** Verificar e corrigir o Client Secret

## 🔧 **Configuração de Produção**

### URLs de Produção
Quando for para produção, adicione:
```
https://seu-dominio.com
https://seu-dominio.com/auth/callback
```

### Variáveis de Ambiente
Configure no Supabase:
```
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
```

## 📞 **Suporte**

Se encontrar problemas:
1. Verifique os logs do console
2. Confirme as configurações no Google Console
3. Verifique as configurações no Supabase
4. Teste com uma conta Google diferente

---

**Status:** ⏳ Aguardando configuração do OAuth
**Próximo passo:** Configurar credenciais no Google Cloud Console
