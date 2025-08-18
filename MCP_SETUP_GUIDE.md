# 🔗 Configuração MCP (Model Context Protocol) para Supabase

## 🎯 **O que é MCP?**
MCP (Model Context Protocol) permite que o Cursor acesse diretamente sua Supabase e outros serviços externos.

## 📋 **Configuração Atual**

### ✅ **Servidores MCP Instalados:**
- ✅ **Filesystem MCP** - Acesso ao sistema de arquivos
- ✅ **GitHub MCP** - Integração com GitHub

### ⚠️ **Servidor Supabase MCP:**
- ❌ **Não disponível** ainda (pacote não existe)
- ✅ **Configuração alternativa** implementada

## 🔧 **Configuração Manual do Cursor**

### **1. Abrir Configurações do Cursor**
1. **Abra o Cursor**
2. **Pressione** `Cmd + ,` (ou `Ctrl + ,`)
3. **Procure** por "MCP" ou "Model Context Protocol"

### **2. Adicionar Configuração MCP**
Adicione esta configuração nas configurações do Cursor:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"],
      "env": {
        "MCP_FILESYSTEM_ROOT": "/Users/macbook/Desktop/arbitrage-crypto-flow"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

### **3. Configurar Supabase (Alternativa)**
Como o servidor Supabase MCP não existe, use esta configuração:

```json
{
  "supabase": {
    "url": "https://cbwpghrkfvczjqzefvix.supabase.co",
    "projectId": "cbwpghrkfvczjqzefvix",
    "tables": {
      "profiles": {
        "description": "Perfis de usuários",
        "columns": {
          "user_id": "UUID - ID único do usuário",
          "email": "TEXT - Email do usuário",
          "username": "TEXT - Nome de usuário",
          "profile_completed": "BOOLEAN - Se o perfil foi completado",
          "first_name": "TEXT - Nome",
          "last_name": "TEXT - Sobrenome",
          "cpf": "TEXT - CPF do usuário",
          "whatsapp": "TEXT - WhatsApp do usuário",
          "referral_code": "TEXT - Código de indicação",
          "referred_by": "TEXT - Quem indicou",
          "role": "TEXT - Papel (user, admin, partner)",
          "balance": "DECIMAL - Saldo da conta",
          "total_profit": "DECIMAL - Lucro total",
          "status": "TEXT - Status da conta"
        }
      }
    }
  }
}
```

## 🎯 **Funcionalidades MCP Disponíveis**

### **Filesystem MCP**
- ✅ **Navegar** pelos arquivos do projeto
- ✅ **Ler** código fonte
- ✅ **Analisar** estrutura do projeto
- ✅ **Sugerir** melhorias

### **GitHub MCP**
- ✅ **Acessar** repositórios
- ✅ **Ver** histórico de commits
- ✅ **Analisar** issues e PRs
- ✅ **Integrar** com GitHub

### **Supabase (via Configuração)**
- ✅ **Entender** estrutura do banco
- ✅ **Sugerir** queries SQL
- ✅ **Otimizar** operações de banco
- ✅ **Criar** novas tabelas/colunas

## 🛠️ **Comandos Úteis para o Cursor**

### **Com Supabase:**
```
"Analisar a tabela profiles e sugerir otimizações"
"Criar query SQL para buscar usuários com mais de 10 indicações"
"Implementar função para calcular lucro total dos usuários"
"Verificar se há usuários com profile_completed = false"
```

### **Com Filesystem:**
```
"Analisar a estrutura do projeto React"
"Verificar se há componentes não utilizados"
"Otimizar imports e dependências"
"Sugerir melhorias na organização do código"
```

### **Com GitHub:**
```
"Verificar histórico de commits recentes"
"Analisar issues abertas no repositório"
"Verificar se há conflitos de merge"
"Sugerir melhorias baseadas no histórico"
```

## 🔍 **Troubleshooting MCP**

### **Problemas Comuns:**

1. **"MCP server not found"**
   - Verificar se os servidores estão instalados
   - Reiniciar o Cursor

2. **"Permission denied"**
   - Verificar permissões do diretório
   - Executar com privilégios adequados

3. **"Connection failed"**
   - Verificar configuração de rede
   - Testar conectividade

### **Logs Úteis:**
```bash
# Verificar servidores MCP instalados
npm list -g | grep modelcontextprotocol

# Testar conexão com Supabase
node test-mcp.js
```

## 📞 **Suporte MCP**

### **Quando usar MCP:**
- **Desenvolvimento** de novas funcionalidades
- **Debug** de problemas de banco
- **Otimização** de queries SQL
- **Análise** de código existente
- **Integração** com serviços externos

### **Contexto para o Cursor:**
```
Projeto: arbitrage-crypto-flow
Framework: React + Vite + TypeScript
Database: Supabase (PostgreSQL)
MCP: Filesystem + GitHub + Supabase config
```

## ✅ **Checklist MCP**

- [ ] Servidores MCP instalados
- [ ] Configuração do Cursor atualizada
- [ ] Supabase configurado
- [ ] Teste de conexão realizado
- [ ] Funcionalidades testadas

---

**🎉 MCP configurado e pronto para uso!**

Agora o Cursor pode:
- Acessar diretamente o sistema de arquivos
- Integrar com GitHub
- Entender sua estrutura de banco Supabase
- Sugerir melhorias baseadas no contexto completo

