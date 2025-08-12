# 🔄 Migração das Tabelas DigitoPay

## 📊 **Análise da Sua Estrutura Atual**

Baseado na sua tabela `debug` que está funcionando, identifiquei que a estrutura é mais simples e eficiente:

### **✅ Sua estrutura que funciona:**
```sql
debug table:
- id (SERIAL PRIMARY KEY)
- tipo (text) - "retorno Deposit", "webhookDeposit"
- trx (text) - transaction ID ou NULL
- payload (json) - dados completos
- created_at (timestamp)
```

## 🔧 **Script de Migração Simplificado**

### **1. Execute este script no Supabase:**

```sql
-- SCRIPT SIMPLIFICADO PARA TABELAS DIGITOPAY
-- Baseado na estrutura que já funciona no seu sistema

-- 1. TABELA DE TRANSAÇÕES (simplificada)
CREATE TABLE IF NOT EXISTS public.digitopay_transactions (
  id SERIAL PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  trx text UNIQUE NOT NULL, -- ID da transação (como na sua tabela)
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  amount decimal(15,2) NOT NULL,
  amount_brl decimal(15,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  pix_code text,
  qr_code_base64 text,
  pix_key text,
  pix_key_type text,
  person_name text,
  person_cpf text,
  gateway_response jsonb, -- Resposta da API
  callback_data jsonb, -- Dados do webhook
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 2. TABELA DE DEBUG (igual à sua estrutura)
CREATE TABLE IF NOT EXISTS public.digitopay_debug (
  id SERIAL PRIMARY KEY,
  tipo text NOT NULL, -- "retorno Deposit", "webhookDeposit", etc.
  trx text, -- ID da transação (pode ser NULL)
  payload jsonb NOT NULL, -- Dados completos
  created_at timestamp DEFAULT now()
);

-- 3. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_digitopay_transactions_user_id ON public.digitopay_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_digitopay_transactions_trx ON public.digitopay_transactions(trx);
CREATE INDEX IF NOT EXISTS idx_digitopay_transactions_status ON public.digitopay_transactions(status);
CREATE INDEX IF NOT EXISTS idx_digitopay_debug_tipo ON public.digitopay_debug(tipo);
CREATE INDEX IF NOT EXISTS idx_digitopay_debug_trx ON public.digitopay_debug(trx);

-- 4. ROW LEVEL SECURITY
ALTER TABLE public.digitopay_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digitopay_debug ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES
-- Usuários podem ver suas próprias transações
CREATE POLICY "Users can view own transactions" ON public.digitopay_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem criar suas transações
CREATE POLICY "Users can create transactions" ON public.digitopay_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sistema pode inserir logs de debug
CREATE POLICY "System can insert debug logs" ON public.digitopay_debug
  FOR INSERT WITH CHECK (true);

-- Admins podem ver todos os logs
CREATE POLICY "Admins can view all debug logs" ON public.digitopay_debug
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 6. TRIGGER PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_digitopay_transactions_updated_at
  BEFORE UPDATE ON public.digitopay_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🎯 **Principais Mudanças**

### **1. Estrutura Simplificada**
- ✅ `id` como `SERIAL` (auto increment)
- ✅ `trx` em vez de `trx_id`
- ✅ Estrutura igual à sua tabela `debug`

### **2. Compatibilidade**
- ✅ Mantém a mesma estrutura de logs
- ✅ Usa os mesmos tipos de dados
- ✅ Compatível com webhooks existentes

### **3. Funcionalidades**
- ✅ Logs de debug com `tipo` e `trx`
- ✅ Transações com rastreamento completo
- ✅ Segurança com RLS
- ✅ Índices para performance

## 🚀 **Como Executar**

### **Passo 1: Acesse o Supabase**
1. Vá para o dashboard do Supabase
2. Clique em "SQL Editor"
3. Cole o script acima

### **Passo 2: Execute o Script**
1. Clique em "Run"
2. Verifique se não há erros
3. Confirme que as tabelas foram criadas

### **Passo 3: Teste a Página**
1. Acesse: `http://localhost:8081/deposit`
2. Verifique se carrega sem erros
3. Teste o tab "DigitoPay PIX"

## 📋 **Verificação**

### **Após executar o script, verifique:**

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('digitopay_transactions', 'digitopay_debug');

-- Verificar estrutura da tabela debug
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'digitopay_debug'
ORDER BY ordinal_position;
```

## 🔍 **Logs Esperados**

Após a migração, você deve ver logs como:

```json
// Tipo: "authenticate"
{
  "success": true,
  "accessToken": "..."
}

// Tipo: "createDeposit" 
{
  "request": {...},
  "response": {...}
}

// Tipo: "webhookDeposit"
{
  "cpfCnpj": "78949190206",
  "nome": "PETRON...",
  "status": "PAID"
}
```

## ✅ **Benefícios da Nova Estrutura**

1. **Compatibilidade** - Igual à sua estrutura que funciona
2. **Simplicidade** - Menos complexa que a anterior
3. **Performance** - Índices otimizados
4. **Segurança** - RLS configurado
5. **Rastreabilidade** - Logs completos

---

**🎯 Esta estrutura é baseada na sua tabela `debug` que já está funcionando e recebendo webhooks do DigitoPay!** 