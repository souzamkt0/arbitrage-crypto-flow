# 🔧 Resolver Problema OAuth Client Deletado

## ❌ **Problema Identificado:**
```
"The OAuth client was deleted"
"Erro 401: deleted_client"
```

## 🚀 **Solução Completa:**

### **Passo 1: Recriar OAuth Client no Google Cloud Console**

1. **Acesse:** https://console.cloud.google.com/apis/credentials
2. **Selecione** seu projeto
3. **Clique** em "+ Criar credenciais"
4. **Escolha** "ID do cliente OAuth"
5. **Tipo:** "Aplicativo da Web"

### **Passo 2: Configurar URLs**

#### **Origens JavaScript Autorizadas:**
```
http://localhost:8080
https://alphabit.vu
```

#### **URIs de Redirecionamento Autorizados:**
```
http://localhost:8080/dashboard
https://alphabit.vu/dashboard
https://cbwpghrkfvczjqzefvix.supabase.co/auth/v1/callback
```

### **Passo 3: Salvar e Copiar Credenciais**

1. **Clique** em "Criar"
2. **Copie** o Client ID
3. **Copie** o Client Secret (se necessário)

### **Passo 4: Configurar no Supabase**

1. **Acesse:** https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix/auth/providers
2. **Procure** por "Google"
3. **Ative** o toggle do Google
4. **Cole** o Client ID
5. **Cole** o Client Secret
6. **Salve** as configurações

### **Passo 5: Testar**

1. **Acesse:** http://localhost:8080/register
2. **Clique** em "Continuar com Google"
3. **Verifique** se funciona

## ⚠️ **Importante:**

- ✅ **Recrie** o OAuth client (o anterior foi deletado)
- ✅ **Configure** TODAS as URLs de redirecionamento
- ✅ **Ative** o Google provider no Supabase
- ✅ **Teste** em desenvolvimento primeiro

## 📋 **URLs Completas:**

### **Google Cloud Console:**
- **Origens:** `http://localhost:8080`, `https://alphabit.vu`
- **Redirecionamentos:** `http://localhost:8080/dashboard`, `https://alphabit.vu/dashboard`, `https://cbwpghrkfvczjqzefvix.supabase.co/auth/v1/callback`

### **Supabase:**
- **Provider:** Google (ativado)
- **Client ID:** (novo ID do Google Cloud Console)
- **Client Secret:** (se necessário)

## 🔄 **Fluxo de Teste:**

1. **Recrie** OAuth client no Google Cloud Console
2. **Configure** URLs de redirecionamento
3. **Ative** Google provider no Supabase
4. **Teste** login com Google
5. **Verifique** redirecionamento para `/dashboard`

---

**Status:** Aguardando configuração do novo OAuth client
