# 🚀 Configuração do Cursor para Supabase

## 📋 Pré-requisitos

1. **Cursor instalado** no seu computador
2. **Projeto aberto** no Cursor
3. **Supabase configurado** e funcionando

## 🔧 Configuração Rápida

### 1. Abrir o Projeto no Cursor
```bash
# No terminal do Cursor
cd /Users/macbook/Desktop/arbitrage-crypto-flow
cursor .
```

### 2. Verificar Configurações
- ✅ Arquivo `.cursorrules` criado
- ✅ Arquivo `cursor-config.json` criado
- ✅ Supabase client configurado

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` com:
```env
VITE_SUPABASE_URL=https://cbwpghrkfvczjqzefvix.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

## 🗄️ Estrutura do Banco de Dados

### Tabela `profiles`
```sql
- user_id (UUID) - ID único do usuário
- email (TEXT) - Email do usuário
- username (TEXT) - Nome de usuário
- profile_completed (BOOLEAN) - Se o perfil foi completado
- first_name (TEXT) - Nome
- last_name (TEXT) - Sobrenome
- cpf (TEXT) - CPF do usuário
- whatsapp (TEXT) - WhatsApp do usuário
- referral_code (TEXT) - Código de indicação
- referred_by (TEXT) - Quem indicou
- role (TEXT) - Papel (user, admin, partner)
- balance (DECIMAL) - Saldo da conta
- total_profit (DECIMAL) - Lucro total
- status (TEXT) - Status da conta
```

## 🔐 Autenticação

### Configuração Atual
- ✅ **Google OAuth** configurado
- ✅ **Email/Password** funcionando
- ✅ **Redirecionamento** para `/complete-profile`
- ✅ **Proteção de rotas** ativa

### Fluxo de Cadastro
1. Usuário se registra (email ou Google)
2. Redirecionado para `/complete-profile`
3. Completa dados pessoais
4. Acessa o dashboard

## 🎯 Funcionalidades Principais

### Sistema de Investimentos
- 🤖 **Robô 4.0.0** - Taxa 2.0% diário
- 🚀 **Robô 4.0.5** - Taxa 2.5% diário (requer 10 indicações)
- 💎 **Robô 4.1.0** - Taxa 3.0% diário (requer 20 indicações)

### Sistema de Indicações
- 📊 **Códigos únicos** para cada usuário
- 🎁 **Sistema de recompensas**
- 📈 **Progresso de indicações**

### Painel Administrativo
- 👥 **Gestão de usuários**
- 🔄 **Impersonação** de contas
- 📊 **Relatórios** e estatísticas

## 🛠️ Comandos Úteis

### Desenvolvimento
```bash
npm run dev          # Iniciar servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
```

### Deploy
```bash
npm run deploy       # Deploy no Vercel
```

## 🔍 Troubleshooting

### Problemas Comuns

1. **Erro de conexão Supabase**
   - Verificar URL e chave no `.env.local`
   - Testar conexão com `test-web-connection.html`

2. **Erro de colunas faltando**
   - Executar script SQL no Supabase Dashboard
   - Verificar se todas as colunas foram criadas

3. **Erro de autenticação**
   - Verificar configuração do Google OAuth
   - Testar fluxo de cadastro completo

## 📞 Suporte

Para problemas específicos:
1. Verificar logs no console do navegador
2. Testar conexão com Supabase
3. Verificar configurações de ambiente

---

**✅ Cursor configurado e pronto para uso!**

