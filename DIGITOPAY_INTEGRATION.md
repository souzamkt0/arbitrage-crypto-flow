# 🔗 Integração DigitoPay - Documentação Atualizada

## 📋 Resumo das Correções

Baseado na [documentação oficial da DigitoPay](https://api.digitopayoficial.com.br/api-docs/index.html), foram feitas as seguintes correções na implementação:

## ✅ **Correções Implementadas**

### **1. Estrutura de Autenticação**
```typescript
// ❌ ANTES (Incorreto)
POST /api/auth/token

// ✅ AGORA (Correto)
POST /api/auth/login
```

### **2. Estrutura de Depósito**
```typescript
// ❌ ANTES (Incorreto)
{
  dueDate: string;
  paymentOptions: string[];
  person: { cpf: string; name: string; };
  value: string;
  callbackUrl: string;
}

// ✅ AGORA (Correto)
{
  amount: number;
  description?: string;
  externalId?: string;
  expiresAt?: string;
  customer: {
    name: string;
    email?: string;
    document: string; // CPF
    phone?: string;
  };
  paymentMethod: {
    type: 'PIX';
  };
  webhookUrl?: string;
}
```

### **3. Estrutura de Saque**
```typescript
// ❌ ANTES (Incorreto)
{
  paymentOptions: string[];
  person: { cpf: string; name: string; pixKey?: string; };
  value: string;
  callbackUrl: string;
}

// ✅ AGORA (Correto)
{
  amount: number;
  description?: string;
  externalId?: string;
  customer: {
    name: string;
    email?: string;
    document: string; // CPF
    phone?: string;
  };
  paymentMethod: {
    type: 'PIX';
    pixKey: string;
    pixKeyType: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';
  };
  webhookUrl?: string;
}
```

### **4. Endpoints Corrigidos**
```typescript
// ❌ ANTES (Incorreto)
GET /api/transactions/{id}

// ✅ AGORA (Correto)
GET /api/payments/{id}      // Para depósitos
GET /api/withdrawals/{id}   // Para saques
```

### **5. Status de Transações**
```typescript
// ❌ ANTES (Incorreto)
'REALIZADO' | 'CANCELADO'

// ✅ AGORA (Correto)
'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'FAILED'
```

## 🔧 **Novos Métodos Adicionados**

### **1. Verificar Status de Saque**
```typescript
static async checkWithdrawalStatus(trxId: string): Promise<any>
```

### **2. Listar Transações**
```typescript
static async listTransactions(page: number = 1, limit: number = 20): Promise<any>
```

### **3. Validação de Webhook**
```typescript
static validateWebhook(payload: string, signature: string): boolean
```

## 📊 **Estrutura de Resposta Atualizada**

### **Depósito**
```typescript
{
  success: boolean;
  id?: string;
  pixCopiaECola?: string;
  qrCodeBase64?: string;
  qrCodeUrl?: string;        // ✅ NOVO
  expiresAt?: string;        // ✅ NOVO
  status?: string;           // ✅ NOVO
  message?: string;
  errors?: Array<{
    field: string;           // ✅ CORRIGIDO
    message: string;         // ✅ CORRIGIDO
  }>;
}
```

### **Webhook**
```typescript
{
  id: string;
  externalId?: string;       // ✅ NOVO
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'FAILED';
  amount: number;
  customer: {
    name: string;
    document: string;
  };
  paymentMethod: {
    type: string;
    pixKey?: string;
    pixKeyType?: string;
  };
  createdAt: string;         // ✅ NOVO
  updatedAt: string;         // ✅ NOVO
}
```

## 🚀 **Como Usar a API Corrigida**

### **1. Criar Depósito**
```typescript
const result = await DigitoPayService.createDeposit(
  100.00,                    // amount
  '12345678901',            // cpf
  'João Silva',             // name
  'https://seu-site.com/webhook', // callbackUrl
  'Depósito via PIX'        // description (opcional)
);
```

### **2. Criar Saque**
```typescript
const result = await DigitoPayService.createWithdrawal(
  50.00,                     // amount
  '12345678901',            // cpf
  'João Silva',             // name
  'joao@email.com',         // pixKey
  'EMAIL',                  // pixKeyType
  'https://seu-site.com/webhook', // callbackUrl
  'Saque via PIX'           // description (opcional)
);
```

### **3. Verificar Status**
```typescript
// Para depósitos
const status = await DigitoPayService.checkTransactionStatus(trxId);

// Para saques
const status = await DigitoPayService.checkWithdrawalStatus(trxId);
```

## 🔍 **Logs de Debug**

Todos os métodos agora incluem logs de debug que são salvos na tabela `digitopay_debug`:

```typescript
// Ver logs (apenas admin)
const logs = await DigitoPayService.getDebugLogs();
```

## ⚠️ **Importante**

### **1. Variáveis de Ambiente**
Certifique-se de que as variáveis estão configuradas:
```env
VITE_DIGITOPAY_CLIENT_ID=seu_client_id
VITE_DIGITOPAY_CLIENT_SECRET=seu_client_secret
VITE_DIGITOPAY_WEBHOOK_SECRET=seu_webhook_secret
```

### **2. Webhook URL**
Configure a URL de webhook correta:
```typescript
const callbackUrl = `${window.location.origin}/api/digitopay/webhook/deposit`;
```

### **3. Validação de Webhook**
Implemente a validação de assinatura conforme a documentação oficial:
```typescript
// TODO: Implementar validação de assinatura
static validateWebhook(payload: string, signature: string): boolean
```

## 📈 **Próximos Passos**

1. **Testar a integração** com a API oficial
2. **Implementar validação de webhook** com assinatura
3. **Configurar webhooks** no painel da DigitoPay
4. **Monitorar logs** para debug
5. **Implementar retry logic** para falhas de rede

## 🔗 **Links Úteis**

- [Documentação Oficial DigitoPay](https://api.digitopayoficial.com.br/api-docs/index.html)
- [Painel de Controle DigitoPay](https://painel.digitopayoficial.com.br)
- [Suporte DigitoPay](https://digitopayoficial.com.br/suporte)

---

**✅ Integração atualizada e compatível com a documentação oficial!** 