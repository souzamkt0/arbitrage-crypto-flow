# 🔧 Solução: Tabelas do DigitoPay Faltantes

## 🚨 **Problema Identificado**

A página de depósito não está abrindo porque as tabelas do DigitoPay não foram criadas no banco de dados:
- `digitopay_transactions` ❌
- `digitopay_debug` ❌

## ✅ **Solução**

### **Passo 1: Acessar o Painel do Supabase**

1. Vá para: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: `cbwpghrkfvczjqzefvix`

### **Passo 2: Executar o Script SQL**

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em **New Query**
3. Copie e cole o conteúdo do arquivo `create-digitopay-tables.sql`
4. Clique em **Run** para executar

### **Passo 3: Verificar se as Tabelas Foram Criadas**

Após executar o script, você deve ver uma tabela com o resultado:
```
table_name              | status
-----------------------|--------
digitopay_transactions  | ✅ Criada
digitopay_debug         | ✅ Criada
```

## 📋 **O que o Script Faz**

### **1. Cria as Tabelas:**
- **`digitopay_transactions`** - Armazena todas as transações do DigitoPay
- **`digitopay_debug`** - Armazena logs de debug para troubleshooting

### **2. Configura Segurança:**
- **Row Level Security (RLS)** habilitado
- **Políticas de acesso** configuradas
- **Usuários** podem ver apenas suas próprias transações
- **Admins** podem ver todas as transações

### **3. Otimiza Performance:**
- **Índices** criados para consultas rápidas
- **Triggers** para atualização automática de timestamps

## 🔍 **Verificação Manual**

Se quiser verificar manualmente se as tabelas existem:

```sql
-- Verificar tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'digitopay%';

-- Verificar estrutura da tabela
\d digitopay_transactions
\d digitopay_debug
```

## 🚀 **Após Executar o Script**

1. **Reinicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

2. **Acesse a página de depósito:**
   - Vá para: http://localhost:8080/deposit
   - A página deve carregar normalmente

3. **Teste a funcionalidade:**
   - Tente criar um depósito
   - Verifique se não há erros no console

## 🐛 **Se Ainda Houver Problemas**

### **1. Verificar Console do Navegador:**
- Abra as ferramentas de desenvolvedor (F12)
- Vá para a aba **Console**
- Procure por erros relacionados ao Supabase

### **2. Verificar Logs do Supabase:**
- No painel do Supabase, vá para **Logs**
- Verifique se há erros de RLS ou permissões

### **3. Verificar Tipos TypeScript:**
```bash
npx supabase gen types typescript --project-id cbwpghrkfvczjqzefvix > src/integrations/supabase/types.ts
```

## 📊 **Estrutura das Tabelas Criadas**

### **digitopay_transactions**
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- trx_id (text, unique)
- type (deposit/withdrawal)
- amount (decimal)
- amount_brl (decimal)
- status (pending/processing/completed/failed/cancelled)
- pix_code (text)
- qr_code_base64 (text)
- pix_key (text)
- pix_key_type (CPF/CNPJ/EMAIL/PHONE/RANDOM)
- person_name (text)
- person_cpf (text)
- gateway_response (jsonb)
- callback_data (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

### **digitopay_debug**
```sql
- id (uuid, primary key)
- tipo (text)
- payload (jsonb)
- created_at (timestamp)
```

## ✅ **Checklist de Verificação**

- [ ] Script SQL executado com sucesso
- [ ] Tabelas criadas no banco
- [ ] Políticas de segurança configuradas
- [ ] Servidor reiniciado
- [ ] Página de depósito carrega
- [ ] Funcionalidade de depósito funciona
- [ ] Logs de debug funcionando

---

**🎉 Após seguir estes passos, a página de depósito deve funcionar normalmente!** 