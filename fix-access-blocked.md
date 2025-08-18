# 🔒 Resolver "Acesso Bloqueado" - Google OAuth

## ❌ **Problema:**
```
"Acesso bloqueado: erro de autorização"
```

## 🔧 **Possíveis Causas e Soluções:**

### **1. Google Provider Não Ativado no Supabase**

**Verificar:**
1. **Acesse:** https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix/auth/providers
2. **Procure** por "Google"
3. **Verifique** se o toggle está **ATIVADO**

**Se não estiver ativado:**
1. **Clique** no toggle para ativar
2. **Preencha** Client ID e Client Secret
3. **Salve** as configurações

### **2. URLs de Redirecionamento Incorretas**

**Verificar no Google Cloud Console:**
1. **Acesse:** https://console.cloud.google.com/apis/credentials
2. **Clique** no seu OAuth Client ID
3. **Verifique** se estas URLs estão configuradas:

**Origens JavaScript Autorizadas:**
```
http://localhost:8080
https://alphabit.vu
```

**URIs de Redirecionamento Autorizados:**
```
http://localhost:8080/dashboard
https://alphabit.vu/dashboard
https://cbwpghrkfvczjqzefvix.supabase.co/auth/v1/callback
```

### **3. Client ID/Secret Incorretos**

**Verificar no Supabase:**
1. **Acesse:** Supabase Dashboard → Auth → Providers → Google
2. **Verifique** se o Client ID está correto
3. **Verifique** se o Client Secret está correto (se necessário)

### **4. Domínio Não Autorizado**

**Verificar:**
1. **O domínio** `alphabit.vu` está na lista de origens autorizadas?
2. **O domínio** `localhost:8080` está na lista?
3. **A URL do Supabase** está nos redirecionamentos?

### **5. Configuração de Consentimento OAuth**

**Verificar no Google Cloud Console:**
1. **Vá para:** OAuth consent screen
2. **Verifique** se o domínio `alphabit.vu` está adicionado
3. **Verifique** se o app está publicado ou em modo de teste

## 🚀 **Solução Rápida:**

### **Passo 1: Verificar Supabase**
```
✅ Google Provider ATIVADO
✅ Client ID configurado
✅ Client Secret configurado (se necessário)
```

### **Passo 2: Verificar Google Cloud Console**
```
✅ Origens JavaScript: localhost:8080, alphabit.vu
✅ Redirecionamentos: /dashboard, /auth/v1/callback
✅ OAuth consent screen configurado
```

### **Passo 3: Testar**
```
✅ Acessar: http://localhost:8080/register
✅ Clicar: "Continuar com Google"
✅ Verificar: Redirecionamento para /dashboard
```

## ⚠️ **Checklist de Verificação:**

- [ ] Google provider ativado no Supabase
- [ ] Client ID correto no Supabase
- [ ] URLs de origem configuradas no Google Cloud Console
- [ ] URLs de redirecionamento configuradas no Google Cloud Console
- [ ] Domínio adicionado na tela de consentimento OAuth
- [ ] App publicado ou em modo de teste

## 🔄 **Teste de Debug:**

1. **Abra** o console do navegador (F12)
2. **Clique** em "Continuar com Google"
3. **Verifique** os logs de erro
4. **Verifique** a URL de redirecionamento

---

**Status:** Verificando configurações do OAuth

