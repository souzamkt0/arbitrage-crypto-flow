# 🔧 CONFIGURAÇÃO MANUAL TITAN EMAIL SMTP - SUPABASE

## ❌ ERRO IDENTIFICADO

O teste de usuário falhou com o erro: **"Error sending confirmation email"**

Isso indica que o SMTP não está configurado corretamente no painel do Supabase.

## 📋 PASSOS PARA CONFIGURAR MANUALMENTE

### 1. Acesse o Painel Supabase
1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. No menu lateral, clique em **Authentication**
4. Clique em **Settings** (na seção Authentication)

### 2. Configure SMTP Settings

Na seção **SMTP Settings**, configure:

```
✅ Enable custom SMTP: ATIVADO

📧 SMTP Host: smtp.titan.email
🔌 SMTP Port: 587
🔐 SMTP User: suporte@alphabit.vu
🔑 SMTP Pass: Jad828657##
📨 Sender Email: noreply@alphabit.vu
📝 Sender Name: AlphaBit Support
```

### 3. Configurações Avançadas

```
🔒 Enable SMTP authentication: ATIVADO
🛡️ Secure connection: STARTTLS (recomendado)
```

### 4. Teste a Configuração

1. Após salvar as configurações, clique em **"Send test email"**
2. Digite um email válido para teste
3. Verifique se o email chegou na caixa de entrada

### 5. Execute o Teste Novamente

Após configurar o SMTP, execute:

```bash
node test-titan-smtp-user.cjs
```

## 🔍 VERIFICAÇÕES ADICIONAIS

### Verificar Status do SMTP

1. No Supabase Dashboard → Authentication → Settings
2. Verifique se aparece "✅ SMTP configured" em verde
3. Se aparecer "❌ SMTP not configured", revise as configurações

### Verificar Logs de Email

1. No Supabase Dashboard → Authentication → Users
2. Tente criar um usuário manualmente
3. Verifique se o email de confirmação é enviado

### Verificar DNS do Domínio

Certifique-se de que o domínio `alphabit.vu` está configurado corretamente:

```bash
# Verificar registros MX
nslookup -type=MX alphabit.vu

# Verificar registros SPF
nslookup -type=TXT alphabit.vu
```

## 🚨 PROBLEMAS COMUNS

### 1. "Authentication failed"
- Verifique usuário e senha do SMTP
- Confirme se a conta `suporte@alphabit.vu` existe no Titan Email

### 2. "Connection timeout"
- Verifique se a porta 587 está liberada
- Teste com porta 465 (SSL) se necessário

### 3. "Sender not authorized"
- Confirme se o domínio `alphabit.vu` está verificado no Titan Email
- Verifique se o email `noreply@alphabit.vu` está autorizado

## 📞 SUPORTE

Se os problemas persistirem:

1. **Titan Email Support**: Verifique configurações da conta
2. **Supabase Support**: Verifique logs de SMTP
3. **DNS Provider**: Verifique configurações de domínio

## ✅ TESTE DE SUCESSO

Quando configurado corretamente, você deve ver:

```
✅ Usuário criado com sucesso!
📨 Email de confirmação deve ter sido enviado!
✅ SMTP Titan Email funcionando - email pendente de confirmação
```

---

**Próximo passo**: Configure manualmente no painel Supabase e execute o teste novamente.