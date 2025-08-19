# 📧 TITAN EMAIL - CONFIGURAÇÕES COMPLETAS

## 🔧 INFORMAÇÕES TÉCNICAS OFICIAIS

### Servidores de Email

```
📤 SMTP (Servidor de Saída): smtp.titan.email
📥 IMAP (Servidor de Entrada): imap.titan.email
```

### Portas e Criptografia

**SMTP (Envio de Emails):**
- **Porta 587**: STARTTLS (Recomendado)
- **Porta 993**: SSL/TLS (Alternativo)

**IMAP (Recebimento de Emails):**
- **Porta 993**: SSL/TLS

### Credenciais de Acesso

```
👤 Usuário: suporte@alphabit.vu (endereço completo)
🔑 Senha: Jad828657##
🔐 Autenticação: Obrigatória
📧 Domínio: alphabit.vu
```

## ⚙️ CONFIGURAÇÃO NO SUPABASE

### SMTP Settings (Authentication > Settings)

```
✅ Enable custom SMTP: ATIVADO

📧 SMTP Host: smtp.titan.email
🔌 SMTP Port: 587
🔐 SMTP User: suporte@alphabit.vu
🔑 SMTP Pass: Jad828657##
📨 Sender Email: noreply@alphabit.vu
📝 Sender Name: AlphaBit Support
🔒 Authentication: LOGIN
🛡️ Encryption: STARTTLS
```

## 📱 CONFIGURAÇÃO EM CLIENTES DE EMAIL

### Microsoft Outlook

**Configuração Manual:**
1. Arquivo > Adicionar Conta > Configuração manual
2. Escolha IMAP

**Servidor de Entrada (IMAP):**
- Servidor: `imap.titan.email`
- Porta: `993`
- Criptografia: `SSL/TLS`

**Servidor de Saída (SMTP):**
- Servidor: `smtp.titan.email`
- Porta: `587`
- Criptografia: `STARTTLS`
- Autenticação: `Sim`

### Gmail (Adicionar Conta)

**Configurações > Contas e Importação > Adicionar conta de email:**

**IMAP:**
- Servidor: `imap.titan.email`
- Porta: `993`
- SSL: `Sim`

**SMTP:**
- Servidor: `smtp.titan.email`
- Porta: `587`
- TLS: `Sim`

### Mozilla Thunderbird

**Configuração Manual:**

**Servidor de Entrada:**
- Protocolo: `IMAP`
- Servidor: `imap.titan.email`
- Porta: `993`
- SSL: `SSL/TLS`
- Autenticação: `Senha normal`

**Servidor de Saída:**
- Servidor: `smtp.titan.email`
- Porta: `587`
- Segurança: `STARTTLS`
- Autenticação: `Senha normal`

### Apple Mail (iOS/macOS)

**Configurações > Mail > Contas > Adicionar Conta > Outra:**

**IMAP:**
- Servidor: `imap.titan.email`
- Nome de usuário: `suporte@alphabit.vu`
- Senha: `Jad828657##`
- Porta: `993`
- SSL: `Ativado`

**SMTP:**
- Servidor: `smtp.titan.email`
- Nome de usuário: `suporte@alphabit.vu`
- Senha: `Jad828657##`
- Porta: `587`
- SSL: `Ativado`

## 🔍 VERIFICAÇÕES E TESTES

### 1. Teste de Conectividade

**Telnet SMTP:**
```bash
telnet smtp.titan.email 587
```

**Telnet IMAP:**
```bash
telnet imap.titan.email 993
```

### 2. Teste de Autenticação

**OpenSSL SMTP:**
```bash
openssl s_client -connect smtp.titan.email:587 -starttls smtp
```

**OpenSSL IMAP:**
```bash
openssl s_client -connect imap.titan.email:993
```

### 3. Verificar DNS

**Registros MX:**
```bash
nslookup -type=MX alphabit.vu
```

**Registros SPF:**
```bash
nslookup -type=TXT alphabit.vu
```

## 🚨 SOLUÇÃO DE PROBLEMAS

### Erro: "Authentication failed"

**Possíveis causas:**
- Senha incorreta
- Usuário sem formato completo de email
- Conta bloqueada no Titan Email

**Soluções:**
1. Verificar credenciais: `suporte@alphabit.vu` / `Jad828657##`
2. Testar login no webmail Titan Email
3. Verificar se a conta está ativa

### Erro: "Connection timeout"

**Possíveis causas:**
- Firewall bloqueando portas
- Servidor indisponível
- Configuração de rede

**Soluções:**
1. Verificar portas 587 e 993 liberadas
2. Testar com diferentes portas (25, 465, 2525)
3. Verificar conectividade de rede

### Erro: "Certificate error"

**Possíveis causas:**
- Certificado SSL expirado
- Configuração de criptografia incorreta

**Soluções:**
1. Usar STARTTLS em vez de SSL/TLS
2. Verificar certificados do servidor
3. Atualizar cliente de email

## 📊 MONITORAMENTO

### Logs do Supabase

1. Dashboard > Settings > API
2. Verificar logs de SMTP
3. Monitorar tentativas de envio

### Métricas Importantes

- **Taxa de entrega**: % de emails entregues
- **Taxa de bounce**: % de emails rejeitados
- **Taxa de abertura**: % de emails abertos
- **Tempo de resposta**: Latência do servidor SMTP

## 🔐 SEGURANÇA

### Boas Práticas

1. **Senhas fortes**: Use senhas complexas
2. **2FA**: Ative autenticação de dois fatores
3. **Monitoramento**: Monitore tentativas de login
4. **Backup**: Mantenha backup das configurações

### Configurações de Segurança

```
🔒 TLS/SSL: Sempre ativado
🛡️ STARTTLS: Preferencial para SMTP
🔐 Autenticação: Obrigatória
📧 SPF/DKIM: Configurado no DNS
```

## 📞 SUPORTE

### Contatos Titan Email

- **Suporte Técnico**: Consulte painel Titan Email
- **Documentação**: Portal do cliente
- **Status**: Verificar status dos servidores

### Logs e Diagnóstico

**Scripts de teste criados:**
- `test-titan-smtp-user.cjs` - Teste de cadastro
- `verificar-smtp-configurado.cjs` - Verificação de configuração
- `verificar-status-smtp.cjs` - Diagnóstico completo

---

**✅ CONFIGURAÇÃO COMPLETA**: Use essas informações para configurar o Titan Email em qualquer cliente ou sistema.