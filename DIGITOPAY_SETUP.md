# 🚀 Configuração do DigitoPay - Sistema de Pagamentos

## 📋 Pré-requisitos

1. **Conta DigitoPay**: Crie uma conta em [DigitoPay](https://digitopay.com.br)
2. **Credenciais da API**: Obtenha suas credenciais de produção
3. **Supabase**: Projeto configurado e rodando

## 🔧 Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# DigitoPay Configuration
VITE_DIGITOPAY_CLIENT_ID=your_digitopay_client_id_here
VITE_DIGITOPAY_CLIENT_SECRET=your_digitopay_client_secret_here
VITE_DIGITOPAY_WEBHOOK_SECRET=your_digitopay_webhook_secret_here
```

### 2. Executar Migrações

Execute as migrações do Supabase para criar as tabelas necessárias:

```bash
# Se você tem o Supabase CLI instalado
supabase db push

# Ou execute manualmente a migração:
# supabase/migrations/20250717022000-digito-pay-integration.sql
```

### 3. Configurar Webhooks

Configure os webhooks no painel do DigitoPay:

**URL do Webhook de Depósito:**
```
https://your-project.supabase.co/functions/v1/digitopay-webhook
```

**URL do Webhook de Saque:**
```
https://your-project.supabase.co/functions/v1/digitopay-webhook
```

### 4. Deploy das Funções Serverless

```bash
# Deploy da função de webhook
supabase functions deploy digitopay-webhook

# Configurar variáveis de ambiente da função
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🏗️ Estrutura do Sistema

### Tabelas Criadas

1. **`digitopay_transactions`**: Armazena todas as transações
2. **`digitopay_debug`**: Logs de debug para troubleshooting
3. **Campos adicionais em `profiles`**: CPF, first_name, last_name

### Componentes React

1. **`DigitoPayDeposit`**: Componente para depósitos
2. **`DigitoPayWithdrawal`**: Componente para saques
3. **`DigitoPayHistory`**: Histórico de transações

### Serviços

1. **`DigitoPayService`**: Classe principal para integração com a API
2. **Webhook Handler**: Função serverless para processar notificações

## 🔄 Fluxo de Funcionamento

### Depósitos
1. Usuário preenche formulário de depósito
2. Sistema cria cobrança na API DigitoPay
3. Retorna QR Code e código PIX
4. Usuário paga via app bancário
5. DigitoPay envia webhook de confirmação
6. Sistema atualiza saldo automaticamente

### Saques
1. Usuário preenche formulário de saque
2. Sistema valida saldo e dados
3. Cria solicitação de saque na API DigitoPay
4. DigitoPay processa o pagamento
5. Sistema recebe webhook de confirmação
6. Atualiza status da transação

## 🛠️ Funcionalidades

### ✅ Implementadas
- [x] Autenticação com API DigitoPay
- [x] Criação de depósitos PIX
- [x] Criação de saques PIX
- [x] Webhooks para confirmação
- [x] Histórico de transações
- [x] Logs de debug
- [x] Interface responsiva
- [x] Validação de dados
- [x] Atualização automática de saldos

### 🔧 Configurações Avançadas

#### Tipos de Chave PIX Suportados
- CPF
- CNPJ
- E-mail
- Telefone
- Chave Aleatória (EVP)

#### Status de Transações
- `pending`: Aguardando pagamento
- `completed`: Concluído
- `failed`: Falhou
- `cancelled`: Cancelado

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de Autenticação**
   - Verifique as credenciais da API
   - Confirme se a conta está ativa

2. **Webhook não recebido**
   - Verifique a URL do webhook
   - Confirme se a função está deployada
   - Verifique os logs em `digitopay_debug`

3. **Transação não encontrada**
   - Verifique se o `trx_id` está correto
   - Confirme se a transação foi salva no banco

### Logs de Debug

Consulte a tabela `digitopay_debug` para ver logs detalhados:

```sql
SELECT * FROM digitopay_debug 
ORDER BY created_at DESC 
LIMIT 50;
```

## 📱 Interface do Usuário

### Página de Depósito
- Aba "DigitoPay PIX" para integração real
- Aba "PIX Simulado" para testes
- Aba "USDT BNB20" para criptomoedas

### Página de Saque
- Aba "DigitoPay PIX" para saques automáticos
- Aba "Saque Manual" para processamento manual

### Histórico
- Lista todas as transações
- Detalhes completos de cada operação
- Status em tempo real

## 🔒 Segurança

- Todas as credenciais são armazenadas em variáveis de ambiente
- Row Level Security (RLS) habilitado
- Validação de dados no frontend e backend
- Logs de auditoria para todas as operações

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs em `digitopay_debug`
2. Consulte a documentação da API DigitoPay
3. Entre em contato com o suporte técnico

---

**Versão**: 1.0.0  
**Última atualização**: Julho 2025  
**Compatibilidade**: React 18+, Supabase 2.x 