# 🔍 Debug da Página de Depósito

## 🚨 **Problema**
A página de depósito não está carregando no localhost.

## ✅ **Soluções Implementadas**

### **1. ErrorBoundary Adicionado**
- Criado componente `ErrorBoundary` para capturar erros
- Adicionado logs de debug no console
- Página agora mostra detalhes do erro se algo der errado

### **2. Logs de Debug**
- Adicionados `console.log` para rastrear o carregamento
- Verificação de usuário e perfil
- Logs de erro detalhados

## 🔧 **Como Testar**

### **Passo 1: Acessar a Página**
1. Abra o navegador
2. Vá para: `http://localhost:8081/deposit`
3. Abra as ferramentas de desenvolvedor (F12)

### **Passo 2: Verificar Console**
Procure por estas mensagens no console:
```
🚀 Deposit component loading...
👤 User: [dados do usuário]
📋 Profile: [dados do perfil]
```

### **Passo 3: Verificar Erros**
Se houver erro, você verá:
- **ErrorBoundary** mostrando detalhes do erro
- **Console** com stack trace completo
- **Network tab** para verificar requisições

## 🐛 **Possíveis Causas**

### **1. Tabelas do DigitoPay Faltantes**
**Sintoma:** Erro relacionado a `digitopay_transactions` ou `digitopay_debug`
**Solução:** Execute o script `create-digitopay-tables.sql` no Supabase

### **2. Problema de Autenticação**
**Sintoma:** Erro relacionado a `useAuth` ou `user`
**Solução:** Verificar se o usuário está logado

### **3. Problema de Importação**
**Sintoma:** Erro de módulo não encontrado
**Solução:** Verificar se todos os componentes existem

### **4. Problema de Roteamento**
**Sintoma:** Página não encontrada (404)
**Solução:** Verificar se a rota está configurada

## 📋 **Checklist de Verificação**

### **No Console do Navegador:**
- [ ] Mensagem "🚀 Deposit component loading..." aparece
- [ ] Dados do usuário são mostrados
- [ ] Dados do perfil são mostrados
- [ ] Não há erros vermelhos

### **Na Página:**
- [ ] Página carrega completamente
- [ ] Tabs são exibidas corretamente
- [ ] Componentes DigitoPay carregam
- [ ] ErrorBoundary não é exibido

### **No Network Tab:**
- [ ] Requisições para Supabase funcionam
- [ ] Não há requisições falhando
- [ ] Status 200 para APIs

## 🔧 **Comandos para Testar**

### **1. Verificar Servidor**
```bash
npm run dev
```

### **2. Verificar Build**
```bash
npm run build
```

### **3. Verificar Tipos**
```bash
npx tsc --noEmit
```

### **4. Limpar Cache**
```bash
npm run clean
# ou
rm -rf node_modules/.cache
```

## 📊 **Estrutura da Página**

```
Deposit.tsx
├── ErrorBoundary
├── Header (Voltar + Título)
├── Tabs
│   ├── DigitoPay PIX (Real)
│   ├── PIX Simulado
│   ├── USDT BNB20
│   ├── Teste DB
│   └── Debug
└── Support Info
```

## 🚀 **Próximos Passos**

1. **Execute o teste** seguindo o guia acima
2. **Verifique o console** para logs e erros
3. **Se houver erro**, copie a mensagem completa
4. **Execute o script SQL** se for problema de tabelas
5. **Reinicie o servidor** se necessário

## 📞 **Se Ainda Não Funcionar**

1. **Copie o erro completo** do console
2. **Verifique se as tabelas existem** no Supabase
3. **Teste outras páginas** para ver se é problema geral
4. **Verifique a conexão** com o Supabase

---

**🎯 Com o ErrorBoundary e logs, agora é possível identificar exatamente onde está o problema!** 