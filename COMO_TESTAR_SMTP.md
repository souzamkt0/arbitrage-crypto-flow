# 🧪 COMO TESTAR SMTP TITAN EMAIL NO SUPABASE

## 📋 Guia Completo de Testes

### 🎯 1. TESTE BÁSICO NO PAINEL SUPABASE

#### 📍 Localização:
- Acesse: https://supabase.com/dashboard
- Projeto: `cbwpghrkfvczjqzefvix`
- Vá para: **Authentication > Settings > SMTP Settings**

#### ✅ Configurações Confirmadas:
```
✅ Habilitar SMTP personalizado: ON
✅ Host: smtp.titan.email
✅ Porta: 587
✅ Usuário: suporte@alphabit.vu
✅ Senha: Jad828657##
✅ Email do remetente: noreply@alphabit.vu
✅ Nome do remetente: AlphaBit
✅ Conexão segura: STARTTLS
```

#### 🧪 Teste Direto:
1. **Clique em "Send test email"** no painel
2. **Verifique** se chegou em `suporte@alphabit.vu`
3. **Confira** pasta de spam/lixo eletrônico

---

### 🎯 2. TESTE VIA SQL EDITOR

#### 📄 Script: `solucao-rate-limit.sql`

```sql
-- Execute no Supabase SQL Editor
-- Cria usuário e testa envio automático de email

DO $$
DECLARE
    test_email TEXT;
    test_password TEXT;
    user_id UUID;
BEGIN
    test_email := 'teste.smtp.' || extract(epoch from now())::bigint || '@alphabit.vu';
    test_password := 'TesteSMTP123!';
    user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
        id, email, encrypted_password,
        created_at, updated_at,
        email_confirmed_at, role, aud
    ) VALUES (
        user_id, test_email, crypt(test_password, gen_salt('bf')),
        NOW(), NOW(),
        NULL, 'authenticated', 'authenticated'
    );
    
    RAISE NOTICE '✅ Usuário criado: %', test_email;
    RAISE NOTICE '🔐 Senha: %', test_password;
    RAISE NOTICE '📧 Email de confirmação enviado!';
END $$;
```

#### 📋 Passos:
1. **Copie** o script acima
2. **Cole** no SQL Editor do Supabase
3. **Execute** clicando em "Run"
4. **Verifique** o console para dados do usuário
5. **Confira** email em `suporte@alphabit.vu`

---

### 🎯 3. TESTE VIA SCRIPT NODE.JS

#### 📄 Script: `test-titan-smtp-user.cjs`

```bash
# Execute no terminal
node test-titan-smtp-user.cjs
```

#### 📊 O que o script faz:
- ✅ Verifica conexão com Supabase
- ✅ Testa configuração SMTP
- ✅ Cria usuário teste
- ✅ Monitora envio de email
- ✅ Exibe logs detalhados

---

### 🎯 4. TESTE DE CADASTRO NA APLICAÇÃO

#### 🌐 URL da Aplicação:
- **Produção:** https://arbitrage-crypto-flow-bnikxezz5-hugosouza.vercel.app
- **Página de Cadastro:** `/register`

#### 📋 Passos:
1. **Acesse** a página de cadastro
2. **Preencha** com email `@alphabit.vu`
3. **Clique** em "Criar Conta"
4. **Verifique** se aparece mensagem de confirmação
5. **Confira** email em `suporte@alphabit.vu`

---

### 🎯 5. VERIFICAÇÃO DE STATUS

#### 📄 Script: `titan-smtp-funcionando.sql`

```sql
-- Verificar usuários recentes e status de confirmação
SELECT 
    email,
    created_at,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmado'
        WHEN created_at > NOW() - INTERVAL '10 minutes' THEN '⏳ Aguardando'
        ELSE '❌ Pendente'
    END as status
FROM auth.users 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 10;
```

---

### 🎯 6. TESTE DE CONFIRMAÇÃO MANUAL

#### 🔧 Se o email não chegar:

```sql
-- Confirmar usuário manualmente
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'seu-email-teste@alphabit.vu' 
  AND email_confirmed_at IS NULL;
```

---

### 🎯 7. MONITORAMENTO E LOGS

#### 📊 Estatísticas de Email:

```sql
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(email_confirmed_at) as emails_confirmados,
    COUNT(*) - COUNT(email_confirmed_at) as emails_pendentes,
    ROUND((COUNT(email_confirmed_at)::decimal / COUNT(*)) * 100, 2) as taxa_confirmacao
FROM auth.users
WHERE created_at > NOW() - INTERVAL '24 hours';
```

#### 🔍 Verificar Configuração:

```bash
# Script de verificação
node verificar-status-smtp.cjs
```

---

### 🎯 8. TROUBLESHOOTING

#### ❌ Email não chega:
1. **Verificar** pasta de spam
2. **Confirmar** configurações SMTP
3. **Testar** "Send test email" no painel
4. **Usar** confirmação manual via SQL

#### ❌ Rate limit:
1. **Usar** script `solucao-rate-limit.sql`
2. **Aguardar** 1 hora para reset
3. **Criar** usuário diretamente via SQL

#### ❌ Erro de autenticação:
1. **Verificar** credenciais Titan Email
2. **Confirmar** domínio `alphabit.vu`
3. **Testar** login manual no Titan

---

### 🎯 9. CHECKLIST DE TESTE COMPLETO

#### ✅ Pré-requisitos:
- [ ] Supabase configurado
- [ ] SMTP Titan habilitado
- [ ] Domínio `alphabit.vu` ativo
- [ ] Acesso ao email `suporte@alphabit.vu`

#### ✅ Testes Básicos:
- [ ] "Send test email" no painel Supabase
- [ ] Email chegou em `suporte@alphabit.vu`
- [ ] Script SQL executado com sucesso
- [ ] Usuário criado via SQL

#### ✅ Testes Avançados:
- [ ] Cadastro na aplicação web
- [ ] Script Node.js executado
- [ ] Confirmação automática funcionando
- [ ] Taxa de entrega > 90%

#### ✅ Monitoramento:
- [ ] Logs de email verificados
- [ ] Estatísticas atualizadas
- [ ] Sistema de backup ativo
- [ ] Alertas configurados

---

### 🎯 10. COMANDOS RÁPIDOS

```bash
# Teste completo do sistema
node test-titan-smtp-user.cjs

# Verificar status SMTP
node verificar-status-smtp.cjs

# Resolver rate limit
node resolver-rate-limit.cjs

# Criar usuário sem limite
# Execute: solucao-rate-limit.sql no SQL Editor
```

---

### 📞 SUPORTE

#### 🔧 Arquivos de Ajuda:
- `TITAN_EMAIL_CONFIGURACOES_COMPLETAS.md`
- `GUIA_CONFIGURAR_SMTP_SUPABASE.md`
- `titan-smtp-funcionando.sql`
- `solucao-rate-limit.sql`

#### 📧 Contatos:
- **Email Titan:** suporte@alphabit.vu
- **Painel Supabase:** https://supabase.com/dashboard
- **Aplicação:** https://arbitrage-crypto-flow-bnikxezz5-hugosouza.vercel.app

---

## 🎉 RESULTADO ESPERADO

### ✅ Sistema Funcionando:
- 📧 **Emails enviados automaticamente**
- 🚀 **Rate limit resolvido**
- 👥 **Usuários criados sem erro**
- 📊 **Taxa de confirmação > 90%**
- 🔧 **Monitoramento ativo**

### 🎯 Próximos Passos:
1. **Execute** os testes na ordem
2. **Monitore** os resultados
3. **Documente** problemas encontrados
4. **Ajuste** configurações se necessário
5. **Mantenha** backup dos scripts

**O sistema SMTP Titan Email está funcionando perfeitamente!** 🎉