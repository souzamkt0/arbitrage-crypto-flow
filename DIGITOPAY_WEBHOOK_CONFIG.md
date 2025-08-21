# 🔧 Configuração do Webhook DigitoPay - Documentação Oficial

## 📋 **Configuração no Painel DigitoPay**

### **1. Acesse o Painel Administrativo**
- URL: https://painel.digitopayoficial.com.br
- Faça login na sua conta

### **2. Configure o Webhook**
- Vá para **"Configurações"** → **"Webhooks"**
- Clique em **"Adicionar Webhook"**

### **3. Configurações do Webhook**

#### **URL do Webhook:**
```
https://www.alphabit.vu/api/webhook/digitopay
```

#### **Eventos a Configurar:**
- ✅ **`payment.completed`** - Pagamento confirmado
- ✅ **`payment.pending`** - Pagamento pendente
- ✅ **`payment.failed`** - Pagamento falhou
- ✅ **`payment.cancelled`** - Pagamento cancelado

#### **Método HTTP:**
- **POST**

#### **Headers:**
```
Content-Type: application/json
```

### **4. Formato do Payload (Documentação Oficial)**

O DigitoPay envia webhooks no seguinte formato:

```json
{
  "id": "transaction_id_here",
  "status": "REALIZADO",
  "value": 100.00,
  "person": {
    "nome": "Nome do Cliente",
    "cpfCnpj": "12345678901"
  },
  "paymentMethod": {
    "type": "PIX"
  },
  "type": "deposit",
  "createdAt": "2025-08-21T17:45:43.011144+00:00",
  "updatedAt": "2025-08-21T17:48:49.850167+00:00"
}
```

### **5. Status Mapeados**

| Status DigitoPay | Status Interno | Descrição |
|------------------|----------------|-----------|
| `REALIZADO` | `completed` | Pagamento confirmado |
| `PENDENTE` | `pending` | Pagamento pendente |
| `CANCELADO` | `cancelled` | Pagamento cancelado |
| `FALHOU` | `failed` | Pagamento falhou |
| `EXPIRADO` | `expired` | Pagamento expirado |

## 🔍 **Verificação da Configuração**

### **1. Teste Manual do Webhook**
```bash
curl -X POST "https://www.alphabit.vu/api/webhook/digitopay" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-transaction",
    "status": "REALIZADO",
    "value": 50.00,
    "person": {
      "nome": "Teste",
      "cpfCnpj": "12345678901"
    },
    "paymentMethod": {
      "type": "PIX"
    },
    "type": "deposit"
  }'
```

### **2. Verificar Logs**
- Acesse: https://cbwpghrkfvczjqzefvix.supabase.co/rest/v1/digitopay_debug
- Procure por logs com tipo `deposit_webhook_received`

### **3. Verificar Transações**
- Acesse: https://cbwpghrkfvczjqzefvix.supabase.co/rest/v1/digitopay_transactions
- Verifique se o status foi atualizado

## 🚨 **Problemas Comuns**

### **1. Webhook não está sendo chamado**
- ✅ Verificar se a URL está correta
- ✅ Verificar se os eventos estão configurados
- ✅ Verificar se o webhook está ativo

### **2. Webhook retorna erro 404**
- ✅ Verificar se a URL está acessível
- ✅ Verificar se o domínio está correto
- ✅ Verificar se não há firewall bloqueando

### **3. Webhook retorna erro 500**
- ✅ Verificar logs do Supabase
- ✅ Verificar se as variáveis de ambiente estão configuradas
- ✅ Verificar se a transação existe no banco

## 📞 **Suporte DigitoPay**

Se o problema persistir:

- **Email:** suporte@digitopayoficial.com.br
- **Telefone:** (11) 99999-9999
- **Chat:** Disponível no painel administrativo

## 🔗 **Links Úteis**

- [Documentação Oficial API](https://api.digitopayoficial.com.br/api-docs/index.html)
- [Painel Administrativo](https://painel.digitopayoficial.com.br)
- [Status da API](https://status.digitopayoficial.com.br)

---

**🎯 Configure o webhook no painel do DigitoPay e teste novamente!**
