# Guia Rápido - Teste do Bot de Arbitragem

## 🚀 Como Testar o Sistema

### 1. Acesse o Sistema
```bash
# O servidor já está rodando em:
http://localhost:8081
```

### 2. Configure a API de Trading

**Passo 1**: Vá para Configurações
```
http://localhost:8081/settings
```

**Passo 2**: Configure suas credenciais da API
- **API Key**: Sua chave da API
- **Secret Key**: Sua chave secreta da API

**Passo 3**: Teste a conexão
- Use o componente de teste da API na página
- Verifique se todos os testes passam:
  - ✅ Ping da API
  - ✅ Validação de credenciais
  - ✅ Informações da conta
  - ✅ Saldos
  - ✅ Preços do mercado

### 3. Configure Parâmetros de Trading

Na página de configurações, ajuste:

- **Lucro Mínimo**: 1.5% (recomendado para começar)
- **Volume Máximo**: Baseado no seu saldo
- **Nível de Risco**: 3 (médio)
- **Estratégia**: Escolha uma das 4 disponíveis

### 4. Teste o Bot

**Passo 1**: Acesse a página do Bot
```
http://localhost:8081/bot
```

**Passo 2**: Verifique a conexão
- O bot deve conectar automaticamente com a API
- Status deve mostrar "connected"
- Última sincronização deve ser atualizada

**Passo 3**: Monitore as oportunidades
- Lista de oportunidades de arbitragem deve aparecer
- Dados devem atualizar a cada 30 segundos
- Estratégias atualizam a cada 5 horas

### 5. Verifique os Dados

**Dashboard do Bot mostra**:
- ✅ Status da API
- ✅ Saldo sincronizado da sua conta
- ✅ Oportunidades de arbitragem
- ✅ Estatísticas de performance
- ✅ Velocidade de análise

## 🔍 O que Verificar

### ✅ Conexão com API
- Status: "connected"
- Latência: < 100ms
- Última sincronização: atualizada

### ✅ Oportunidades de Arbitragem
- Lista com pelo menos 5-10 oportunidades
- Diferentes estratégias (Cross-Exchange, Triangular, etc.)
- Lucros potenciais acima do mínimo configurado

### ✅ Dados em Tempo Real
- Preços atualizando a cada 30 segundos
- Estatísticas do bot atualizadas
- Análise de velocidade funcionando

### ✅ Configurações Aplicadas
- Parâmetros de trading salvos
- Credenciais da API funcionando
- Testes de conectividade passando

## 🚨 Problemas Comuns

### API não conecta
```bash
# Verifique:
1. Credenciais corretas da API
2. Permissões da API (leitura + trading)
3. Internet funcionando
4. Console do navegador (F12) para erros
```

### Bot não mostra oportunidades
```bash
# Verifique:
1. Se o bot está ativo
2. Lucro mínimo configurado
3. Estratégias selecionadas
4. Dados do CoinMarketCap carregando
```

### Dados não sincronizam
```bash
# Verifique:
1. Status da API
2. Saldo disponível na conta
3. Permissões da API
4. Logs no console
```

## 📊 Monitoramento

### Console do Navegador (F12)
```javascript
// Verifique mensagens como:
"Conectando com a API..."
"API conectada!"
"Oportunidades de arbitragem carregadas"
```

### Logs do Sistema
- Página do bot mostra logs em tempo real
- Status de cada operação
- Erros e avisos

## 🎯 Próximos Passos

1. **Teste com valores pequenos** primeiro
2. **Monitore as operações** por algumas horas
3. **Ajuste parâmetros** conforme necessário
4. **Verifique performance** e lucros
5. **Configure notificações** se disponível

## 📞 Suporte

Se encontrar problemas:
1. Verifique esta documentação
2. Use o componente de teste da API para diagnóstico
3. Verifique logs no console
4. Teste com credenciais diferentes

---

**⚠️ Importante**: Este é um sistema de demonstração. Sempre teste com valores pequenos e monitore as operações. 