# 🚀 Instruções para Atualizar Planos de Investimento no Supabase

## 📋 Passo a Passo

### 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Faça login na sua conta
- Selecione seu projeto

### 2. Abra o SQL Editor
- No menu lateral, clique em "SQL Editor"
- Clique em "New Query"

### 3. Execute o SQL Abaixo

Copie e cole o código SQL completo abaixo no editor:

```sql
-- 1. Adicionar colunas necessárias
ALTER TABLE public.investment_plans 
ADD COLUMN IF NOT EXISTS required_referrals INTEGER DEFAULT 0 NOT NULL;

ALTER TABLE public.investment_plans 
ADD COLUMN IF NOT EXISTS contract_fee DECIMAL(10,2) DEFAULT 0 NOT NULL;

-- 2. Atualizar Robô 4.0.0 (Iniciante)
UPDATE public.investment_plans 
SET 
  daily_rate = 2.5,
  required_referrals = 0,
  contract_fee = 0,
  maximum_amount = 100,
  description = 'Plano inicial sem necessidade de indicações'
WHERE name ILIKE '%4.0.0%' OR name ILIKE 'Robô 4.0%';

-- 3. Atualizar Robô 4.0.5 (Intermediário)
UPDATE public.investment_plans 
SET 
  daily_rate = 3.0,
  required_referrals = 10,
  contract_fee = 10,
  maximum_amount = 200,
  description = 'Plano intermediário com 10 indicações ativas'
WHERE name ILIKE '%4.0.5%';

-- 4. Atualizar Robô 4.1.0 (Premium)
UPDATE public.investment_plans 
SET 
  daily_rate = 4.0,
  required_referrals = 20,
  contract_fee = 10,
  maximum_amount = 5000,
  description = 'Plano premium com 20 indicações ativas'
WHERE name ILIKE '%4.1.0%';

-- 5. Inserir planos se não existirem
INSERT INTO public.investment_plans (name, daily_rate, minimum_amount, maximum_amount, duration, description, status, required_referrals, contract_fee)
SELECT 'Robô 4.0.0', 2.5, 10, 100, 30, 'Plano inicial sem necessidade de indicações', 'active', 0, 0
WHERE NOT EXISTS (SELECT 1 FROM public.investment_plans WHERE name ILIKE '%4.0.0%');

INSERT INTO public.investment_plans (name, daily_rate, minimum_amount, maximum_amount, duration, description, status, required_referrals, contract_fee)
SELECT 'Robô 4.0.5', 3.0, 20, 200, 30, 'Plano intermediário com 10 indicações ativas', 'active', 10, 10
WHERE NOT EXISTS (SELECT 1 FROM public.investment_plans WHERE name ILIKE '%4.0.5%');

INSERT INTO public.investment_plans (name, daily_rate, minimum_amount, maximum_amount, duration, description, status, required_referrals, contract_fee)
SELECT 'Robô 4.1.0', 4.0, 500, 5000, 30, 'Plano premium com 20 indicações ativas', 'active', 20, 10
WHERE NOT EXISTS (SELECT 1 FROM public.investment_plans WHERE name ILIKE '%4.1.0%');

-- 6. Verificar resultado
SELECT 
  name,
  daily_rate,
  minimum_amount,
  maximum_amount,
  required_referrals,
  contract_fee,
  description,
  status
FROM public.investment_plans 
ORDER BY required_referrals, name;
```

### 4. Executar o SQL
- Clique no botão "Run" (ou pressione Ctrl+Enter)
- Aguarde a execução completar
- Verifique se não há erros na saída

### 5. Verificar Resultado
Após a execução, você deve ver uma tabela com os planos atualizados:

| Nome | Taxa Diária | Mín. USDT | Máx. USDT | Indicações | Taxa Contrato | Status |
|------|-------------|-----------|-----------|------------|---------------|---------|
| Robô 4.0.0 | 2.5 | 10 | 100 | 0 | 0 | active |
| Robô 4.0.5 | 3.0 | 20 | 200 | 10 | 10 | active |
| Robô 4.1.0 | 4.0 | 500 | 5000 | 20 | 10 | active |

## 📊 Resumo das Alterações

### Robô 4.0.0 (Iniciante)
- **Indicações necessárias:** 0 (nenhuma)
- **Taxa diária:** 2,5%
- **Investimento mínimo:** $10 USDT
- **Investimento máximo:** $100 USDT
- **Taxa de contrato:** $0 USDT

### Robô 4.0.5 (Intermediário)
- **Indicações necessárias:** 10 ativos (pessoas indicadas)
- **Taxa diária:** 3,0%
- **Investimento mínimo:** $20 USDT
- **Investimento máximo:** $200 USDT
- **Taxa de contrato:** $10 USDT

### Robô 4.1.0 (Premium)
- **Indicações necessárias:** 20 ativos (pessoas indicadas)
- **Taxa diária:** 4,0%
- **Investimento mínimo:** $500 USDT
- **Investimento máximo:** $5000 USDT
- **Taxa de contrato:** $10 USDT

## 🔍 Verificação Final

Após executar o SQL, você pode verificar se tudo está correto:

1. **No Supabase Dashboard:**
   - Vá para "Table Editor"
   - Selecione a tabela "investment_plans"
   - Verifique se as colunas `required_referrals` e `contract_fee` foram adicionadas
   - Confirme se os valores estão corretos

2. **Na Aplicação:**
   - Acesse a página de investimentos
   - Verifique se a barra de progresso está funcionando corretamente
   - Teste com diferentes números de indicações

## ⚠️ Importante

- **Backup:** Sempre faça backup antes de executar alterações em produção
- **Teste:** Execute primeiro em ambiente de desenvolvimento se possível
- **Verificação:** Confirme se todas as alterações foram aplicadas corretamente

## 🆘 Suporte

Se encontrar algum erro:
1. Verifique se todas as colunas foram criadas
2. Confirme se os dados foram inseridos/atualizados
3. Teste a aplicação para garantir que está funcionando

---

**Status:** ✅ Pronto para execução
**Data:** Janeiro 2025
**Versão:** 1.0