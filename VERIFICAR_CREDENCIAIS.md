# ✅ Verificar Credenciais do DigitoPay

## 🎯 **Status Atual**

✅ **Arquivo .env criado com sucesso!**
- Client ID: `da0cdf6c-06dd-4e04-a046-abd00e8b43ed`
- Client Secret: `3f58b8f4-e101-4076-a844-3a64c7915b1a`
- Webhook Secret: `your_webhook_secret_here` (precisa configurar)

## 🔍 **Como Verificar**

### **Passo 1: Acessar a Página de Debug**
1. Abra o navegador
2. Vá para: `http://localhost:8081/deposit`
3. Clique na aba **"Debug"**

### **Passo 2: Verificar Status das Configurações**
Na seção "Status das Configurações", você deve ver:

- ✅ **Client ID:** Configurado (verde)
- ✅ **Client Secret:** Configurado (verde)
- ❌ **Webhook Secret:** Não configurado (vermelho)
- ✅ **Base URL:** Configurado (azul)

### **Passo 3: Testar Conexão**
1. Clique no botão **"Testar Conexão DigitoPay"**
2. Verifique o resultado do teste
3. Se houver erro, verifique os logs

## 🚨 **Se Ainda Mostrar "Não Configurado"**

### **Solução 1: Reiniciar Servidor**
```bash
# Pare o servidor (Ctrl+C)
# Depois execute:
npm run dev
```

### **Solução 2: Verificar Arquivo .env**
```bash
# Verificar se o arquivo existe
dir .env

# Verificar conteúdo (opcional)
type .env
```

### **Solução 3: Verificar Variáveis no Console**
1. Abra F12 → Console
2. Digite: `console.log(import.meta.env.VITE_DIGITOPAY_CLIENT_ID)`
3. Deve mostrar: `da0cdf6c-06dd-4e04-a046-abd00e8b43ed`

## 📋 **Conteúdo do Arquivo .env**

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

## 🔧 **Próximos Passos**

### **1. Configurar Webhook Secret**
- Acesse o painel do DigitoPay
- Vá em Webhooks
- Copie o secret gerado
- Substitua `your_webhook_secret_here` no arquivo `.env`

### **2. Configurar Supabase**
- Acesse o Supabase Dashboard
- Settings → API
- Copie a anon key
- Substitua `your_supabase_anon_key_here` no arquivo `.env`

### **3. Testar Funcionalidade**
- Acesse: `http://localhost:8081/deposit`
- Teste o tab "DigitoPay PIX"
- Verifique se cria depósitos

## ✅ **Resultado Esperado**

Após configurar corretamente, você deve ver:

```
Status das Configurações:
✅ Client ID: Configurado
✅ Client Secret: Configurado  
✅ Webhook Secret: Configurado
✅ Base URL: Configurado

Botão "Testar Conexão DigitoPay" habilitado
```

---

**🎯 Agora as credenciais devem aparecer corretamente na página de debug!** 