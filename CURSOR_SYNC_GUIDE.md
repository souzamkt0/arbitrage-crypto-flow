# 🔗 Guia Completo: Sincronizar Cursor com Supabase

## 🎯 **Objetivo**
Configurar o Cursor para reconhecer e trabalhar perfeitamente com sua Supabase.

## 📋 **Passo a Passo**

### **1. Abrir o Projeto no Cursor**
1. **Abra o Cursor** no seu computador
2. **Clique em "Open Folder"** ou "Abrir Pasta"
3. **Navegue até:** `/Users/macbook/Desktop/arbitrage-crypto-flow`
4. **Selecione a pasta** e clique em "Abrir"

### **2. Verificar Arquivos de Configuração**
Após abrir, você deve ver estes arquivos na raiz:
- ✅ `.cursorrules` - Regras do Cursor
- ✅ `cursor-config.json` - Configuração do projeto
- ✅ `CURSOR_SETUP.md` - Guia de configuração
- ✅ `CURSOR_SYNC_GUIDE.md` - Este guia

### **3. Configurar Variáveis de Ambiente**
1. **Crie um arquivo** `.env.local` na raiz do projeto
2. **Adicione as configurações:**
```env
VITE_SUPABASE_URL=https://cbwpghrkfvczjqzefvix.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

### **4. Obter a Chave Anônima**
1. **Acesse:** https://supabase.com/dashboard/project/cbwpghrkfvczjqzefvix/settings/api
2. **Copie** a "anon public" key
3. **Cole** no arquivo `.env.local`

### **5. Testar a Conexão**
1. **Abra** `test-web-connection.html` no navegador
2. **Clique** em "Testar Conexão"
3. **Verifique** se não há erros

## 🗄️ **Estrutura do Banco (para o Cursor)**

### **Tabela `profiles`**
```sql
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY,
  email TEXT,
  username TEXT,
  profile_completed BOOLEAN DEFAULT false,
  first_name TEXT,
  last_name TEXT,
  cpf TEXT,
  whatsapp TEXT,
  referral_code TEXT,
  referred_by TEXT,
  role TEXT DEFAULT 'user',
  balance DECIMAL DEFAULT 0.00,
  total_profit DECIMAL DEFAULT 0.00,
  status TEXT DEFAULT 'active'
);
```

### **Tabelas Relacionadas**
- `user_investments` - Investimentos dos usuários
- `deposits` - Depósitos
- `withdrawals` - Saques
- `admin_balance_transactions` - Transações do admin
- `community_posts` - Posts da comunidade

## 🔐 **Sistema de Autenticação**

### **Fluxo Completo**
1. **Cadastro** → Email ou Google OAuth
2. **Redirecionamento** → `/complete-profile`
3. **Completar Perfil** → Dados pessoais
4. **Acesso** → Dashboard principal

### **Proteções**
- ✅ Rate limiting
- ✅ Validação de formulários
- ✅ Proteção de rotas
- ✅ Rollback em caso de erro

## 🎯 **Funcionalidades Principais**

### **Sistema de Investimentos**
```typescript
// Robôs disponíveis
const robots = {
  "4.0.0": { rate: 2.0, minInvestment: 10, referrals: 0 },
  "4.0.5": { rate: 2.5, minInvestment: 20, referrals: 10 },
  "4.1.0": { rate: 3.0, minInvestment: 500, referrals: 20 }
};
```

### **Sistema de Indicações**
- Códigos únicos gerados automaticamente
- Progresso de indicações
- Bloqueio de planos superiores

### **Painel Administrativo**
- Gestão completa de usuários
- Impersonação de contas
- Relatórios e estatísticas

## 🛠️ **Comandos para o Cursor**

### **Desenvolvimento**
```bash
npm run dev          # Iniciar servidor
npm run build        # Build para produção
npm run preview      # Preview do build
```

### **Deploy**
```bash
npm run deploy       # Deploy no Vercel
```

## 🔍 **Troubleshooting**

### **Problemas Comuns**

1. **"Cannot access 'supabase' before initialization"**
   - Verificar se o script Supabase está carregado
   - Usar `window.supabase.createClient()`

2. **"Invalid API key"**
   - Verificar chave no `.env.local`
   - Testar conexão com página de teste

3. **"Column not found"**
   - Executar script SQL no Supabase Dashboard
   - Verificar se todas as colunas foram criadas

### **Logs Úteis**
```javascript
// Para debug no Cursor
console.log('🔍 Debug Supabase:', {
  url: import.meta.env.VITE_SUPABASE_URL,
  key: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
});
```

## 📞 **Suporte**

### **Quando pedir ajuda ao Cursor:**
- "Criar função para conectar com Supabase"
- "Implementar autenticação com Google OAuth"
- "Criar sistema de investimentos com robôs"
- "Implementar painel administrativo"
- "Configurar sistema de indicações"

### **Contexto para o Cursor:**
- Projeto: arbitrage-crypto-flow
- Framework: React + Vite + TypeScript
- Database: Supabase (PostgreSQL)
- UI: Shadcn UI + Tailwind CSS
- Deploy: Vercel

## ✅ **Checklist Final**

- [ ] Projeto aberto no Cursor
- [ ] Arquivo `.env.local` criado
- [ ] Chave anônima configurada
- [ ] Conexão testada e funcionando
- [ ] Arquivos de configuração criados
- [ ] Sistema de autenticação funcionando
- [ ] Banco de dados configurado

---

**🎉 Cursor sincronizado com sua Supabase!**

Agora o Cursor entende completamente seu projeto e pode ajudar com:
- Desenvolvimento de novas funcionalidades
- Debug de problemas
- Otimização de código
- Implementação de features
- Configuração de banco de dados

