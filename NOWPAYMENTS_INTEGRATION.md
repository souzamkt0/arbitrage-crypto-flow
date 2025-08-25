# Integração NOWPayments - Sistema de Pagamentos USDT

Este documento descreve a implementação do sistema de pagamentos USDT utilizando a API do NOWPayments.

## 🔧 Configuração

### 1. Secrets Necessários

Configure os seguintes secrets no Supabase:

```bash
NOWPAYMENTS_API_KEY=your_nowpayments_api_key
NOWPAYMENTS_IPN_SECRET=your_webhook_secret
```

### 2. Tabelas do Banco de Dados

O sistema utiliza as seguintes tabelas:

#### `payments`
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key para auth.users)
- payment_id (text, único) -- ID do NOWPayments
- amount (decimal) -- Valor em USD
- currency_from (text) -- USD
- currency_to (text) -- USDT, USDTERC20, USDTTRC20, USDTBSC
- status (text) -- waiting, confirming, confirmed, finished, failed
- payment_address (text) -- Endereço para pagamento
- actually_paid (decimal) -- Valor realmente pago
- price_amount (decimal) -- Preço em USDT
- created_at (timestamp)
- updated_at (timestamp)
- order_description (text)
- webhook_data (jsonb) -- Dados completos do webhook
```

#### `nowpayments_webhooks`
```sql
- id (uuid, primary key)
- payment_id (text)
- event_type (text)
- status (text)
- signature (text)
- payload (jsonb)
- processed (boolean)
- created_at (timestamp)
- processed_at (timestamp)
- error_message (text)
```

## 🚀 Edge Functions

### 1. `nowpayments-create-payment`

Cria um novo pagamento via NOWPayments API.

**Endpoint:** `POST /functions/v1/nowpayments-create-payment`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "price_amount": 100.00,
  "price_currency": "USD",
  "pay_currency": "usdttrc20",
  "order_id": "order_123456",
  "order_description": "Depósito USDT TRC-20",
  "ipn_callback_url": "https://yoursite.com/api/webhook",
  "success_url": "https://yoursite.com/success",
  "cancel_url": "https://yoursite.com/cancel"
}
```

**Response:**
```json
{
  "success": true,
  "payment_id": "5077125102",
  "pay_address": "TQMfFWpE2dKGWyXWpYRt2F2VxL8Z2mPqRs",
  "pay_amount": 100.45678912,
  "pay_currency": "usdttrc20",
  "price_amount": 100.00,
  "price_currency": "USD",
  "payment_status": "waiting",
  "order_id": "order_123456",
  "order_description": "Depósito USDT TRC-20",
  "created_at": "2024-01-15T10:30:00Z",
  "expires_at": "2024-01-15T11:30:00Z",
  "qr_code_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "database_id": "uuid"
}
```

### 2. `nowpayments-status`

Verifica o status de um pagamento.

**Endpoint:** `POST /functions/v1/nowpayments-status`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "payment_id": "5077125102"
}
```

**Response:**
```json
{
  "success": true,
  "payment_id": "5077125102",
  "transaction_id": "uuid",
  "payment_status": "finished",
  "pay_status": "finished",
  "amount": 100.00,
  "currency_from": "USD",
  "currency_to": "USDTTRC20",
  "payment_address": "TQMfFWpE2dKGWyXWpYRt2F2VxL8Z2mPqRs",
  "actually_paid": 100.45678912,
  "price_amount": 100.45678912,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:35:00Z"
}
```

### 3. `nowpayments-webhook`

Processa webhooks do NOWPayments (não requer JWT).

**Endpoint:** `POST /functions/v1/nowpayments-webhook`

**Headers:**
```
Content-Type: application/json
x-nowpayments-sig: <hmac_signature>
```

**Webhook Payload (exemplo):**
```json
{
  "payment_id": "5077125102",
  "payment_status": "finished",
  "pay_address": "TQMfFWpE2dKGWyXWpYRt2F2VxL8Z2mPqRs",
  "price_amount": 100.00,
  "price_currency": "USD",
  "pay_amount": 100.45678912,
  "actually_paid": 100.45678912,
  "pay_currency": "usdttrc20",
  "order_id": "order_123456",
  "order_description": "Depósito USDT TRC-20",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:35:00Z"
}
```

## 💻 Frontend Components

### 1. `USDTCheckout`
Página principal do checkout com 3 etapas:
- Formulário de pagamento
- Tela de pagamento ativa
- Confirmação

### 2. `USDTPaymentForm`
Formulário para criar pagamento com validações:
- Valor entre $10.00 e $10,000.00
- Seleção de tipo USDT (TRC-20, ERC-20, BSC)
- Descrição opcional

### 3. `USDTPaymentActive`
Tela de pagamento ativa com:
- QR Code para pagamento
- Endereço da carteira
- Timer de 15 minutos
- Status em tempo real
- Verificação automática de status

### 4. `USDTPaymentConfirmation`
Página de confirmação com:
- Detalhes da transação
- Status final
- Links para próximos passos

## 🔒 Segurança

### HMAC Verification
Os webhooks são verificados usando HMAC SHA-512:

```javascript
async function verifyHmacSignature(payload, signature, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['verify']
  );

  const signatureBytes = new Uint8Array(
    signature.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
  );
  
  return await crypto.subtle.verify(
    'HMAC', 
    key, 
    signatureBytes, 
    new TextEncoder().encode(payload)
  );
}
```

### Row Level Security (RLS)
- Todas as tabelas têm RLS habilitado
- Usuários só podem ver seus próprios pagamentos
- Webhooks usam service role key para atualizar dados

## 🎯 Fluxo de Pagamento

1. **Usuário cria pagamento**
   - Frontend chama `nowpayments-create-payment`
   - Edge Function chama NOWPayments API
   - Pagamento salvo na tabela `payments`
   - QR Code gerado automaticamente

2. **Usuário faz pagamento**
   - Escaneamento do QR Code ou copy/paste do endereço
   - Pagamento na blockchain

3. **Confirmação automática**
   - NOWPayments detecta pagamento
   - Webhook enviado para `nowpayments-webhook`
   - Status atualizado no banco de dados
   - Usuário recebe confirmação

4. **Verificação manual (opcional)**
   - Frontend pode chamar `nowpayments-status`
   - Verifica status diretamente na API
   - Atualiza banco se necessário

## 📊 Status de Pagamento

- `waiting` - Aguardando pagamento
- `confirming` - Pagamento detectado, aguardando confirmações
- `confirmed` - Pagamento confirmado
- `finished` - Pagamento completamente processado
- `failed` - Pagamento falhou
- `expired` - Pagamento expirou

## 🌐 URLs de Configuração

Configure no NOWPayments dashboard:

- **IPN Callback URL:** `https://yoursite.com/functions/v1/nowpayments-webhook`
- **Success URL:** `https://yoursite.com/usdt-checkout?success=true`
- **Cancel URL:** `https://yoursite.com/usdt-checkout?cancel=true`

## 🛠️ Desenvolvimento Local

1. Configure os secrets no Supabase
2. Execute as migrações das tabelas
3. Deploy das Edge Functions
4. Configure webhook URLs no NOWPayments
5. Teste com pequenos valores

## 🔍 Debugging

### Logs das Edge Functions
```bash
supabase functions logs nowpayments-create-payment
supabase functions logs nowpayments-status
supabase functions logs nowpayments-webhook
```

### Verificar Webhooks
```sql
SELECT * FROM nowpayments_webhooks 
ORDER BY created_at DESC 
LIMIT 10;
```

### Verificar Pagamentos
```sql
SELECT payment_id, status, amount, created_at, updated_at 
FROM payments 
WHERE user_id = 'user_uuid'
ORDER BY created_at DESC;
```

## ⚡ Performance

- QR Codes são gerados em tempo real
- Status é verificado a cada 10 segundos na tela ativa
- Webhooks processam atualizações em tempo real
- Cache não implementado (pode ser adicionado se necessário)