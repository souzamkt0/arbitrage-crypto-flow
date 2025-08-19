# 🔧 CONFIGURAR SMTP TITAN EMAIL NO SUPABASE

## ❌ PROBLEMA IDENTIFICADO

- **SMTP não configurado no painel Supabase**
- **Emails de confirmação não sendo enviados**
- **Erro: "Error sending confirmation email"**

## 📋 SOLUÇÃO PASSO A PASSO

### 1. Acesse o Painel Supabase

1. Abra seu navegador e vá para: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login com sua conta
3. Selecione seu projeto: **arbitrage-crypto-flow**

### 2. Navegue até Configurações de Autenticação

1. No menu lateral esquerdo, clique em **"Authentication"**
2. Na seção Authentication, clique em **"Settings"**
3. Role a página até encontrar **"SMTP Settings"**

### 3. Configure SMTP Settings

**IMPORTANTE**: Ative primeiro a opção "Enable custom SMTP"

```
✅ Enable custom SMTP: MARQUE ESTA OPÇÃO
```

Depois configure os campos com as informações oficiais do Titan Email:

```
📧 SMTP Host: smtp.titan.email
🔌 SMTP Port: 587 (recomendado) ou 993 (SSL/TLS)
🔐 SMTP User: suporte@alphabit.vu (endereço completo)
🔑 SMTP Pass: Jad828657##
📨 Sender Email: noreply@alphabit.vu
📝 Sender Name: AlphaBit Support
```

### 4. Configurações Avançadas

```
🔒 Enable SMTP authentication: ✅ ATIVADO
🛡️ Secure connection: STARTTLS (porta 587) ou SSL/TLS (porta 993)
🔐 Authentication method: LOGIN
```

### 4.1. Informações Técnicas Titan Email

**Servidores Oficiais:**
- **SMTP (Saída)**: smtp.titan.email
- **IMAP (Entrada)**: imap.titan.email

**Portas e Criptografia:**
- **SMTP**: Porta 587 (STARTTLS) ou 993 (SSL/TLS)
- **IMAP**: Porta 993 (SSL/TLS)

**Credenciais:**
- **Usuário**: Endereço de email completo (suporte@alphabit.vu)
- **Senha**: Senha da conta Titan Email
- **Autenticação**: Obrigatória

### 5. Salvar Configurações

1. Clique no botão **"Save"** ou **"Update"**
2. Aguarde a confirmação de que as configurações foram salvas
3. Você deve ver uma mensagem de sucesso

### 6. Testar Configuração

1. Ainda na mesma página, procure por **"Send test email"**
2. Digite um email válido (pode ser o seu próprio)
3. Clique em **"Send test email"**
4. Verifique se o email chegou na caixa de entrada

## 🔍 VERIFICAÇÕES IMPORTANTES

### Verificar Status do SMTP

Após salvar, você deve ver:
- ✅ **"SMTP configured"** em verde
- ❌ Se aparecer **"SMTP not configured"**, revise as configurações

### Verificar Credenciais Titan Email

Certifique-se de que:
- A conta `suporte@alphabit.vu` existe no Titan Email
- A senha `Jad828657##` está correta
- O domínio `alphabit.vu` está verificado no Titan Email

## 🧪 TESTAR APÓS CONFIGURAÇÃO

### 1. Teste Automático

Execute o script de teste:

```bash
node test-titan-smtp-user.cjs
```

**Resultado esperado:**
```
✅ Usuário criado com sucesso!
📨 Email de confirmação deve ter sido enviado!
✅ SMTP Titan Email funcionando
```

### 2. Teste Manual no Supabase

1. Vá em **Authentication > Users**
2. Clique em **"Add user"**
3. Digite um email de teste
4. Marque **"Send email confirmation"**
5. Clique em **"Create user"**
6. Verifique se o email chegou

### 3. Verificar no SQL Editor

Execute as queries do arquivo `titan-smtp-sql-editor.sql`:

```sql
-- Verificar usuários não confirmados
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN 'Não confirmado'
        ELSE 'Confirmado'
    END as status
FROM auth.users 
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;
```

## 🚨 PROBLEMAS COMUNS E SOLUÇÕES

### 1. "Authentication failed"

**Causa**: Credenciais incorretas

**Solução**:
- Verifique se `suporte@alphabit.vu` existe no Titan Email
- Confirme a senha `Jad828657##`
- Teste login manual no webmail do Titan

### 2. "Connection timeout"

**Causa**: Porta bloqueada ou configuração de rede

**Solução**:
- Confirme porta 587 (STARTTLS)
- Teste porta 465 (SSL) se necessário
- Verifique firewall do servidor

### 3. "Sender not authorized"

**Causa**: Domínio não verificado

**Solução**:
- Verifique se `alphabit.vu` está verificado no Titan Email
- Confirme se `noreply@alphabit.vu` está autorizado
- Verifique registros SPF/DKIM do domínio

### 4. "Rate limit exceeded"

**Causa**: Muitas tentativas de teste

**Solução**:
- Aguarde 15-30 minutos
- Use emails diferentes para teste
- Verifique limites do Titan Email

## 📧 CONFIGURAÇÕES DE EMAIL TEMPLATES

### Personalizar Templates (Opcional)

1. Em **Authentication > Settings**
2. Role até **"Email Templates"**
3. Personalize:
   - **Confirm signup**: Email de confirmação
   - **Magic Link**: Link mágico de login
   - **Change Email Address**: Mudança de email
   - **Reset Password**: Redefinir senha

### Template Recomendado para Confirmação

```html
<h2>Bem-vindo ao AlphaBit!</h2>
<p>Clique no link abaixo para confirmar seu email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar Email</a></p>
<p>Se você não se cadastrou, ignore este email.</p>
<p>Equipe AlphaBit</p>
```

## ✅ CHECKLIST FINAL

- [ ] SMTP habilitado no Supabase
- [ ] Credenciais Titan Email configuradas
- [ ] Teste de email enviado com sucesso
- [ ] Script de teste executado sem erros
- [ ] Usuário de teste criado e email recebido
- [ ] Templates de email personalizados (opcional)

## 🎉 RESULTADO ESPERADO

Após a configuração correta:

1. **Novos usuários** receberão emails de confirmação automaticamente
2. **Emails de recuperação** de senha funcionarão
3. **Magic links** para login funcionarão
4. **Mudanças de email** serão confirmadas por email

## 📞 SUPORTE

Se os problemas persistirem:

1. **Titan Email**: Verifique configurações da conta
2. **Supabase**: Consulte logs de SMTP
3. **DNS**: Verifique registros MX/SPF/DKIM

---

**⚡ AÇÃO IMEDIATA**: Configure o SMTP no painel Supabase agora e teste com o script fornecido!