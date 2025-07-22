# 🔧 Configuração das Variáveis de Ambiente

## 📁 Arquivo .env

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://cbwpghrkfvczjqzefvix.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8

# DigitoPay Configuration
VITE_DIGITOPAY_CLIENT_ID=your_digitopay_client_id_here
VITE_DIGITOPAY_CLIENT_SECRET=your_digitopay_client_secret_here
VITE_DIGITOPAY_WEBHOOK_SECRET=your_digitopay_webhook_secret_here

# API Keys
VITE_NEWSDATA_API_KEY=pub_7d30bec4ab0045e59c9fc2e3836551ad
VITE_COINMARKETCAP_API_KEY=0f376f16-1d3f-4a3d-83fb-7b3731b1db3c

# Environment
NODE_ENV=development
```

## 🔑 Como Obter as Credenciais do DigitoPay

### 1. Acesse o Painel DigitoPay
- Vá para [https://digitopay.com.br](https://digitopay.com.br)
- Faça login na sua conta

### 2. Obtenha as Credenciais da API
- No painel, vá para **Configurações > API**
- Copie o **Client ID** e **Client Secret**
- Substitua no arquivo `.env`:
  ```env
  VITE_DIGITOPAY_CLIENT_ID=seu_client_id_aqui
  VITE_DIGITOPAY_CLIENT_SECRET=seu_client_secret_aqui
  ```

### 3. Configure o Webhook Secret
- No painel DigitoPay, vá para **Webhooks**
- Crie um novo webhook ou use o existente
- Copie o **Webhook Secret**
- Substitua no arquivo `.env`:
  ```env
  VITE_DIGITOPAY_WEBHOOK_SECRET=seu_webhook_secret_aqui
  ```

## 🌐 Configuração dos Webhooks

### URL do Webhook
Configure no painel do DigitoPay a seguinte URL:

```
https://cbwpghrkfvczjqzefvix.supabase.co/functions/v1/digitopay-webhook
```

### Eventos a Configurar
- **Depósito**: `payment.completed`
- **Saque**: `withdrawal.completed`

## 🔒 Variáveis de Segurança

### Supabase Service Role Key
Para as funções serverless, você também precisará da **Service Role Key**:

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Vá para **Settings > API**
3. Copie a **service_role** key
4. Configure nas funções serverless:
   ```bash
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
   ```

## ✅ Verificação da Configuração

### 1. Teste as Variáveis
Após criar o arquivo `.env`, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

### 2. Verifique no Console
Abra o console do navegador e digite:
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_DIGITOPAY_CLIENT_ID)
```

### 3. Teste a Conexão
- Acesse a página de Depósito
- Vá para a aba "DigitoPay PIX"
- Tente criar um depósito de teste

## 🚨 Importante

- **NUNCA** commite o arquivo `.env` no Git
- O arquivo `.env` já está no `.gitignore`
- Use sempre o arquivo `env.example` como template
- Mantenha as credenciais seguras

## 🔄 Atualização das Variáveis

Se você precisar atualizar alguma variável:

1. Edite o arquivo `.env`
2. Reinicie o servidor de desenvolvimento
3. Limpe o cache do navegador se necessário

## 📞 Suporte

Se tiver problemas com a configuração:
1. Verifique se todas as variáveis estão corretas
2. Confirme se as credenciais do DigitoPay são válidas
3. Verifique se o webhook está configurado corretamente
4. Consulte os logs em `digitopay_debug` no Supabase

---

**Arquivo criado**: `env.example`  
**Arquivo a criar**: `.env` (copie do `env.example` e renomeie)  
**Status**: Pronto para configuração 