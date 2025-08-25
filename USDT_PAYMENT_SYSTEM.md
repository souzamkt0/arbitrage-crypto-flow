# Sistema de Pagamentos USDT - NOWPayments Integration

Este documento descreve o sistema completo de pagamentos USDT implementado com integração nativa Supabase + Lovable + NOWPayments API.

## 🏗️ Arquitetura do Sistema

### Componentes Principais

1. **Frontend React Components**
   - `USDTPayments.tsx` - Interface principal do sistema
   - `USDTPaymentDashboard.tsx` - Dashboard administrativo
   - `USDTPaymentService.ts` - Serviços de integração

2. **Edge Functions (Supabase)**
   - `nowpayments-payment-gateway` - Gateway principal de pagamentos
   - `nowpayments-webhook` - Processamento de webhooks
   - `nowpayments-create-payment` - Criação de pagamentos
   - `nowpayments-status` - Consulta de status

3. **Database Tables**
   - `bnb20_transactions` - Transações de pagamento
   - `supported_currencies` - Moedas suportadas
   - `payment_stats` - Estatísticas de pagamentos
   - `nowpayments_webhooks` - Log de webhooks

## 🔧 Configuração

### 1. Variáveis de Ambiente (Supabase Secrets)

Configure o secret no Supabase:
```bash
NOWPAYMENTS_API_KEY=your_nowpayments_api_key_here
```

### 2. Estrutura do Banco de Dados

As tabelas foram criadas automaticamente com as migrações:

#### supported_currencies
```sql
CREATE TABLE supported_currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  network TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  min_amount NUMERIC DEFAULT 1.0,
  max_amount NUMERIC DEFAULT 10000.0,
  confirmation_blocks INTEGER DEFAULT 12,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### payment_stats (Admin apenas)
```sql
CREATE TABLE payment_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  currency TEXT NOT NULL,
  network TEXT NOT NULL,
  total_transactions INTEGER DEFAULT 0,
  total_volume NUMERIC DEFAULT 0,
  successful_transactions INTEGER DEFAULT 0,
  failed_transactions INTEGER DEFAULT 0,
  avg_processing_time INTERVAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, currency, network)
);
```

### 3. Moedas Suportadas

O sistema suporta USDT em múltiplas redes:
- **USDT TRC-20** (Rede TRON) - Mais rápida e barata
- **USDT ERC-20** (Rede Ethereum) - Mais segura
- **USDT BSC** (Binance Smart Chain) - Equilibrio custo/velocidade
- **BNB BSC** (Binance Coin) - Moeda nativa da BSC

## 🚀 Como Usar

### Interface do Usuário

1. **Criar Pagamento**
   - Acesse `/usdt-payments`
   - Selecione a moeda (USDT)
   - Escolha a rede (TRC20, ERC20, BSC)
   - Insira o valor em USD
   - Clique em "Criar Pagamento"

2. **Acompanhar Status**
   - Vá para a aba "Histórico"
   - Visualize todas as transações
   - Status em tempo real via webhooks

3. **Dashboard Administrativo**
   - Disponível apenas para admins
   - Estatísticas detalhadas
   - Transações recentes
   - Métricas de performance

### API Edge Functions

#### Criar Pagamento
```typescript
const { data, error } = await supabase.functions.invoke('nowpayments-payment-gateway', {
  body: {
    price_amount: 10.00,
    price_currency: 'usd',
    pay_currency: 'usdttrc20',
    order_id: 'order_123',
    order_description: 'Depósito USDT via TRC20'
  }
});
```

#### Consultar Status
```typescript
const { data, error } = await supabase.functions.invoke('nowpayments-payment-gateway', {
  method: 'GET',
  body: { payment_id: 'payment_id_here' }
});
```

## 🔒 Segurança

### Autenticação
- JWT token validation em todas as edge functions
- Row Level Security (RLS) em todas as tabelas
- Verificação de permissões de admin

### Validação de Webhooks
- Verificação HMAC SHA-512
- Validação de assinatura NOWPayments
- Log de todos os webhooks para auditoria

### Proteção de Dados
- Dados sensíveis apenas em Supabase Secrets
- Criptografia de comunicação HTTPS
- Sanitização de inputs

## 📊 Status de Pagamento

### Fluxo de Status
1. **pending** - Pagamento criado, aguardando
2. **waiting** - Aguardando confirmação blockchain
3. **confirming** - Confirmações em andamento
4. **confirmed** - Confirmado, processando
5. **finished** - Concluído com sucesso
6. **failed** - Falhou
7. **expired** - Expirado
8. **refunded** - Reembolsado

### Atualização Automática
- Webhooks da NOWPayments atualizam status automaticamente
- Triggers do banco atualizam estatísticas em tempo real
- Interface reativa com atualizações instantâneas

## 🔧 Manutenção

### Logs e Monitoramento
- Edge Function logs no Supabase Dashboard
- Webhook logs na tabela `nowpayments_webhooks`
- Estatísticas automáticas na tabela `payment_stats`

### Troubleshooting

#### Erro: "NOWPayments API key não configurada"
```bash
# Configure o secret no Supabase
NOWPAYMENTS_API_KEY=your_api_key
```

#### Erro: "Token inválido ou expirado"
```typescript
// Usuário precisa fazer login novamente
// O sistema já trata isso automaticamente
```

#### Webhook não recebido
1. Verifique URL do webhook na NOWPayments
2. Verifique logs da edge function `nowpayments-webhook`
3. Confirme se IPN secret está configurado

## 🌐 URLs e Endpoints

### Frontend Routes
- `/usdt-payments` - Interface principal
- `/usdt-payments?success=true` - Página de sucesso
- `/usdt-payments?cancel=true` - Página de cancelamento

### Edge Functions
- `nowpayments-payment-gateway` - Gateway principal
- `nowpayments-webhook` - Processamento de webhooks
- `test-nowpayments-integration` - Teste de integração

### Webhook URL
```
https://YOUR_PROJECT.supabase.co/functions/v1/nowpayments-webhook
```

## 📈 Métricas e Analytics

### Dashboard de Admin
- Volume total de transações
- Taxa de sucesso
- Usuários únicos
- Transações por rede
- Estatísticas diárias/mensais

### Relatórios Disponíveis
- Transações por moeda/rede
- Performance por período
- Taxa de conversão
- Tempo médio de processamento

## 🔄 Integração com Saldo

### Atualização Automática
Quando uma transação é marcada como `finished`:
1. Trigger atualiza saldo do usuário
2. Registro na tabela de depósitos
3. Atualização de estatísticas
4. Notificação via webhook (se configurado)

### Reconciliação
- Verificação automática de consistência
- Logs de auditoria completos
- Possibilidade de reprocessamento manual

## 🛠️ Desenvolvimento

### Adicionar Nova Moeda
1. Inserir na tabela `supported_currencies`
2. Atualizar interface do usuário
3. Configurar na NOWPayments
4. Testar integração

### Customização
- Modificar limites min/max por moeda
- Personalizar URLs de sucesso/cancelamento
- Adicionar validações específicas
- Implementar notificações customizadas

## 📞 Suporte

### Debug Mode
Para ativar logs detalhados, adicione ao edge function:
```typescript
console.log('DEBUG:', data);
```

### Monitoramento
- Supabase Dashboard > Functions > Logs
- Supabase Dashboard > Database > Tables
- NOWPayments Dashboard > Transactions

### Contato
- Documentação NOWPayments: https://documenter.getpostman.com/view/7907941/S1a32n38
- Supabase Docs: https://supabase.com/docs
- Lovable Platform: https://lovable.dev

---

**Sistema implementado com ❤️ usando Supabase + Lovable + NOWPayments**