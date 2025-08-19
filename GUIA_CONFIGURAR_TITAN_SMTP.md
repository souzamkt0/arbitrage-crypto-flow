# 🔧 Guia Completo: Configurar Titan Email SMTP no Supabase

## 📋 Informações da Conta Titan Email

✅ **Conta existente:** `suporte@alphabit.vu`  
✅ **Senha:** `Jad828657##`  
✅ **Status:** Ativo (0% usado, 0 MB de 10 GB utilizado)  

## 🚀 Passo a Passo - Configuração no Supabase

### 1️⃣ Acesse o Painel do Supabase

```
https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix
```

### 2️⃣ Navegue para SMTP Settings

1. Clique em **"Authentication"** no menu lateral
2. Clique em **"Settings"**
3. Role até **"SMTP Settings"**

### 3️⃣ Preencha as Configurações SMTP

```
🌐 SMTP Host: smtp.titan.email
🔌 SMTP Port: 587
🔐 Encryption: SSL/TLS
👤 SMTP User: suporte@alphabit.vu
🔑 SMTP Pass: Jad828657##
📧 Sender Name: Arbitrage Crypto Flow
📮 Sender Email: suporte@alphabit.vu
```

### 4️⃣ Salvar e Testar

1. Clique em **"Save"**
2. Clique em **"Send test email"**
3. Digite um email válido para teste
4. Verifique se o email chegou

## 🧪 Teste de Funcionamento

### Opção 1: Teste no Painel Supabase
```
Authentication > Settings > SMTP Settings
> Send test email
> Digite: seu-email@gmail.com
> Clique em "Send"
```

### Opção 2: Teste com Script
```bash
node test-smtp-config.js
```

### Opção 3: Teste Real de Cadastro
1. Acesse seu sistema
2. Tente criar uma nova conta
3. Verifique se o email de confirmação chega

## 🔧 Resolver Usuários Existentes

Se houver usuários que não confirmaram email:

### SQL para Confirmar Manualmente
```sql
-- Verificar usuários não confirmados
SELECT 
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email_confirmed_at IS NULL;

-- Confirmar todos os emails pendentes
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;
```

## ⚠️ Solução de Problemas

### Se o teste falhar:

1. **Verifique as credenciais:**
   - Email: `suporte@alphabit.vu`
   - Senha: `Jad828657##`
   - Host: `smtp.titan.email`
   - Porta: `587`

2. **Teste alternativo com porta 465:**
   ```
   SMTP Port: 465
   Encryption: SSL
   ```

3. **Verifique no HostGator:**
   - Confirme se a conta está ativa
   - Verifique se não há bloqueios

### Se ainda não funcionar:

**Opção temporária:** Desabilitar confirmação de email

1. No Supabase: `Authentication > Settings`
2. Desmarque: `☐ Enable email confirmations`
3. Salve as configurações
4. Execute o SQL de confirmação manual

## 📊 Status Esperado

Após configurar corretamente:

✅ **SMTP:** Configurado e funcionando  
✅ **Emails:** Sendo enviados normalmente  
✅ **Cadastros:** Funcionando com confirmação  
✅ **Usuários existentes:** Emails confirmados  

## 🎯 Próximos Passos

1. **Configure o SMTP no Supabase** com as informações acima
2. **Teste o envio** de email
3. **Confirme usuários existentes** se necessário
4. **Teste o cadastro** completo no sistema

---

**🎉 SUCESSO!** Após seguir este guia, seu sistema de email estará funcionando perfeitamente com o Titan Email do HostGator.