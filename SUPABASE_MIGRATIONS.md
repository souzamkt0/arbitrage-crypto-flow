# 🚀 Guia de Migrações Automáticas do Supabase

Este guia explica como alterar colunas automaticamente no Supabase usando as ferramentas criadas.

## 📁 Arquivos Criados

- `supabase/migrations/exemplo_alterar_colunas.sql` - Exemplos de todos os tipos de alterações
- `scripts/migrate-supabase.js` - Script Node.js interativo
- `scripts/supabase-helper.sh` - Script Shell interativo
- `SUPABASE_MIGRATIONS.md` - Este guia

## 🛠️ Como Usar

### Opção 1: Script Shell (Recomendado)

```bash
# Executar o helper interativo
./scripts/supabase-helper.sh
```

**Funcionalidades:**
- ✅ Adicionar coluna
- ✅ Alterar tipo de coluna
- ✅ Renomear coluna
- ✅ Remover coluna
- ✅ SQL customizado
- ✅ Mostrar status do Supabase
- ✅ Resetar banco de dados

### Opção 2: Script Node.js

```bash
# Executar o assistente Node.js
node scripts/migrate-supabase.js
```

### Opção 3: Comandos Manuais

```bash
# Criar migração manualmente
npx supabase migration new nome_da_migracao

# Executar migrações
npx supabase migration up

# Resetar banco (cuidado!)
npx supabase db reset
```

## 📝 Exemplos Práticos

### 1. Adicionar Nova Coluna

```sql
ALTER TABLE public.user_investments 
ADD COLUMN IF NOT EXISTS nova_coluna text DEFAULT 'valor_padrao';
```

### 2. Alterar Tipo de Coluna

```sql
ALTER TABLE public.user_investments 
ALTER COLUMN amount TYPE decimal(20,8);
```

### 3. Renomear Coluna

```sql
ALTER TABLE public.user_investments 
RENAME COLUMN old_name TO new_name;
```

### 4. Remover Coluna

```sql
ALTER TABLE public.user_investments 
DROP COLUMN IF EXISTS coluna_desnecessaria;
```

### 5. Adicionar Constraint

```sql
ALTER TABLE public.user_investments 
ADD CONSTRAINT check_amount_positive CHECK (amount >= 0);
```

### 6. Criar Índice

```sql
CREATE INDEX IF NOT EXISTS idx_user_investments_status 
ON public.user_investments(status);
```

### 7. Atualizar Dados

```sql
UPDATE public.user_investments 
SET status = 'active' 
WHERE status IS NULL;
```

## 🔒 Boas Práticas de Segurança

### 1. Sempre Use IF EXISTS/IF NOT EXISTS

```sql
-- ✅ Correto
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS new_field text;
DROP INDEX IF EXISTS old_index;

-- ❌ Evitar
ALTER TABLE public.users ADD COLUMN new_field text;
DROP INDEX old_index;
```

### 2. Teste em Desenvolvimento Primeiro

```bash
# Sempre teste localmente antes de aplicar em produção
npx supabase db reset  # Reset local
npx supabase migration up  # Teste a migração
```

### 3. Backup Antes de Alterações Críticas

```bash
# Fazer backup da produção antes de grandes alterações
npx supabase db dump --data-only > backup.sql
```

### 4. Use Transações para Operações Complexas

```sql
BEGIN;

-- Suas alterações aqui
ALTER TABLE public.users ADD COLUMN new_field text;
UPDATE public.users SET new_field = 'default_value';
ALTER TABLE public.users ALTER COLUMN new_field SET NOT NULL;

COMMIT;
```

## 📊 Monitoramento

### Verificar Status das Migrações

```bash
# Ver status geral
npx supabase status

# Ver histórico de migrações
npx supabase migration list
```

### Logs de Erro

```bash
# Ver logs em tempo real
npx supabase logs

# Ver logs específicos
npx supabase logs --filter="ERROR"
```

## 🚨 Comandos de Emergência

### Reverter Migração (Cuidado!)

```bash
# Resetar para estado anterior (PERDE DADOS!)
npx supabase db reset

# Ou restaurar de backup
psql -h localhost -p 54322 -U postgres -d postgres < backup.sql
```

### Verificar Integridade

```sql
-- Verificar constraints
SELECT conname, contype FROM pg_constraint WHERE conrelid = 'public.user_investments'::regclass;

-- Verificar índices
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'user_investments';

-- Verificar colunas
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_investments';
```

## 🎯 Casos de Uso Comuns

### Adicionar Campo de Timestamp

```sql
ALTER TABLE public.user_investments 
ADD COLUMN IF NOT EXISTS last_updated timestamp with time zone DEFAULT now();

-- Criar trigger para auto-update
CREATE TRIGGER update_user_investments_timestamp
  BEFORE UPDATE ON public.user_investments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### Migrar Dados Entre Colunas

```sql
-- Adicionar nova coluna
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name text;

-- Migrar dados
UPDATE public.users SET full_name = first_name || ' ' || last_name;

-- Remover colunas antigas (opcional)
ALTER TABLE public.users DROP COLUMN IF EXISTS first_name;
ALTER TABLE public.users DROP COLUMN IF EXISTS last_name;
```

### Alterar Precisão de Decimais

```sql
-- Aumentar precisão de valores monetários
ALTER TABLE public.user_investments 
ALTER COLUMN amount TYPE decimal(20,8);

ALTER TABLE public.deposits 
ALTER COLUMN amount_usd TYPE decimal(20,8);
```

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `npx supabase logs`
2. Consulte a documentação: [Supabase Docs](https://supabase.com/docs)
3. Use o arquivo de exemplos: `supabase/migrations/exemplo_alterar_colunas.sql`

---

**⚠️ IMPORTANTE:** Sempre faça backup antes de executar migrações em produção!

**✅ RESPOSTA:** Sim, você pode alterar colunas automaticamente no Supabase usando os scripts criados!