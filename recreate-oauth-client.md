# 🔄 Recriar OAuth Client Deletado

## ❌ **Erro Atual:**
```
"The OAuth client was deleted"
"Erro 401: deleted_client"
```

## 🚀 **Solução - Recriar OAuth Client:**

### **Passo 1: Acessar Google Cloud Console**
1. **Vá para:** https://console.cloud.google.com/apis/credentials
2. **Selecione** seu projeto
3. **Clique** em "+ Criar credenciais"
4. **Escolha** "ID do cliente OAuth"

### **Passo 2: Configurar Tipo de Aplicativo**
- **Tipo de aplicativo:** "Aplicativo da Web"
- **Nome:** "Alphabit OAuth Client" (ou qualquer nome)

### **Passo 3: Configurar URLs OBRIGATÓRIAS**

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

### **Passo 4: Criar e Copiar Credenciais**
1. **Clique** em "Criar"
2. **Copie** o Client ID (muito importante!)
3. **Copie** o Client Secret (se necessário)

### **Passo 5: Configurar no Supabase**
1. **Acesse:** https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix/auth/providers
2. **Procure** por "Google"
3. **Ative** o toggle do Google
4. **Cole** o novo Client ID
5. **Cole** o Client Secret
6. **Salve** as configurações

## ⚠️ **IMPORTANTE:**

### **URLs Obrigatórias (não pode faltar nenhuma):**
- ✅ `http://localhost:8080` (desenvolvimento)
- ✅ `https://alphabit.vu` (produção)
- ✅ `http://localhost:8080/dashboard` (redirecionamento dev)
- ✅ `https://alphabit.vu/dashboard` (redirecionamento prod)
- ✅ `https://cbwpghrkfvczjqzefvix.supabase.co/auth/v1/callback` (Supabase)

### **Verificações:**
- [ ] OAuth client criado no Google Cloud Console
- [ ] Todas as URLs configuradas
- [ ] Client ID copiado
- [ ] Google provider ativado no Supabase
- [ ] Client ID colado no Supabase

## 🔄 **Teste Após Configuração:**

1. **Aguarde** 5-10 minutos para propagação
2. **Acesse:** http://localhost:8080/register
3. **Clique** em "Continuar com Google"
4. **Verifique** se não dá mais erro de "deleted_client"

## 📋 **Checklist Final:**

- [ ] OAuth client recriado no Google Cloud Console
- [ ] Todas as URLs de origem configuradas
- [ ] Todas as URLs de redirecionamento configuradas
- [ ] Client ID copiado e colado no Supabase
- [ ] Google provider ativado no Supabase
- [ ] Teste realizado após 5-10 minutos

---

**Status:** Aguardando recriação do OAuth client
