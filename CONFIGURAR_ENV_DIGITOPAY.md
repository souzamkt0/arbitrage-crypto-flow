# 🔧 Configuração do Arquivo .env - DigitoPay

## 📁 **Criar Arquivo .env**

Crie um arquivo chamado `.env` na raiz do projeto (mesmo nível do `package.json`)

## 📝 **Conteúdo do Arquivo .env**

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://cbwpghrkfvczjqzefvix.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# DigitoPay Configuration
VITE_DIGITOPAY_CLIENT_ID=da0cdf6c-06dd-4e04-a046-abd00e8b43ed
VITE_DIGITOPAY_CLIENT_SECRET=3f58b8f4-e101-4076-a844-3a64c7915b1a
VITE_DIGITOPAY_WEBHOOK_SECRET=your_webhook_secret_here

# API Keys
VITE_NEWSDATA_API_KEY=pub_7d30bec4ab0045e59c9fc2e3836551ad
VITE_COINMARKETCAP_API_KEY=0f376f16-1d3f-4a3d-83fb-7b3731b1db3c

# Environment
NODE_ENV=development
```

## 🔑 **Configurações do DigitoPay**

### **1. VITE_DIGITOPAY_CLIENT_ID**
- ✅ **Valor atual:** `da0cdf6c-06dd-4e04-a046-abd00e8b43ed`
- 📍 **Onde encontrar:** Painel do DigitoPay → Configurações → API
- 🔍 **Verificar:** Se este ID está correto no seu painel

### **2. VITE_DIGITOPAY_CLIENT_SECRET**
- ✅ **Valor atual:** `3f58b8f4-e101-4076-a844-3a64c7915b1a`
- 📍 **Onde encontrar:** Painel do DigitoPay → Configurações → API
- 🔍 **Verificar:** Se este secret está correto no seu painel

### **3. VITE_DIGITOPAY_WEBHOOK_SECRET**
- ⚠️ **Valor atual:** `your_webhook_secret_here` (precisa ser configurado)
- 📍 **Onde encontrar:** Painel do DigitoPay → Webhooks → Secret
- 🔍 **Ação necessária:** Substituir pelo secret real do webhook

## 🔧 **Como Configurar**

### **Passo 1: Acessar o Painel DigitoPay**
1. Vá para: https://painel.digitopayoficial.com.br
2. Faça login na sua conta
3. Vá para **"Configurações"** → **"API"**

### **Passo 2: Verificar Credenciais**
1. **Client ID:** Confirme se é `da0cdf6c-06dd-4e04-a046-abd00e8b43ed`
2. **Client Secret:** Confirme se é `3f58b8f4-e101-4076-a844-3a64c7915b1a`
3. Se forem diferentes, atualize no arquivo `.env`

### **Passo 3: Configurar Webhook**
1. Vá para **"Webhooks"** no painel
2. **URL do Webhook:** `https://seu-dominio.com/api/digitopay/webhook`
3. **Secret:** Copie o secret gerado
4. Cole no arquivo `.env` em `VITE_DIGITOPAY_WEBHOOK_SECRET`

### **Passo 4: Configurar Supabase**
1. Vá para o Supabase Dashboard
2. **Settings** → **API**
3. Copie a **URL** e **anon key**
4. Cole no arquivo `.env`

## 📋 **Exemplo Completo do .env**

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://cbwpghrkfvczjqzefvix.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...sua_chave_aqui

# DigitoPay Configuration
VITE_DIGITOPAY_CLIENT_ID=da0cdf6c-06dd-4e04-a046-abd00e8b43ed
VITE_DIGITOPAY_CLIENT_SECRET=3f58b8f4-e101-4076-a844-3a64c7915b1a
VITE_DIGITOPAY_WEBHOOK_SECRET=webhook_secret_do_digitopay

# API Keys
VITE_NEWSDATA_API_KEY=pub_7d30bec4ab0045e59c9fc2e3836551ad
VITE_COINMARKETCAP_API_KEY=0f376f16-1d3f-4a3d-83fb-7b3731b1db3c

# Environment
NODE_ENV=development
```

## ✅ **Verificação**

### **Após configurar, teste:**

1. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

2. **Acesse a página de depósito:**
   ```
   http://localhost:8081/deposit
   ```

3. **Verifique o console:**
   - Abra F12 → Console
   - Procure por logs do DigitoPay
   - Não deve haver erros de variáveis não encontradas

## 🚨 **Importante**

- ✅ **Nunca commite** o arquivo `.env` no Git
- ✅ **Mantenha backup** das credenciais
- ✅ **Use HTTPS** para webhooks em produção
- ✅ **Teste sempre** após mudanças

---

**🎯 Configure o arquivo .env e teste a página de depósito!** 