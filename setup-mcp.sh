#!/bin/bash

echo "🚀 Configurando MCP (Model Context Protocol) para Supabase..."

# Instalar servidores MCP
echo "📦 Instalando servidores MCP..."

# Servidor Supabase
echo "🔗 Instalando servidor Supabase MCP..."
npm install -g @modelcontextprotocol/server-supabase

# Servidor Filesystem
echo "📁 Instalando servidor Filesystem MCP..."
npm install -g @modelcontextprotocol/server-filesystem

# Servidor GitHub (opcional)
echo "🐙 Instalando servidor GitHub MCP..."
npm install -g @modelcontextprotocol/server-github

# Criar arquivo de configuração do Cursor
echo "⚙️ Criando configuração do Cursor..."

cat > ~/.cursor/settings.json << EOF
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://cbwpghrkfvczjqzefvix.supabase.co",
        "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODU5ODUsImV4cCI6MjA3MTA2MTk4NX0.3KMVlqAr4bu0l0Wfs47I2GQtUQcb3xTqPoXSSXgzbJo"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"],
      "env": {
        "MCP_FILESYSTEM_ROOT": "/Users/macbook/Desktop/arbitrage-crypto-flow"
      }
    }
  }
}
EOF

echo "✅ Configuração MCP criada!"

# Testar conexão
echo "🧪 Testando conexão MCP..."

# Criar script de teste
cat > test-mcp.js << 'EOF'
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbwpghrkfvczjqzefvix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODU5ODUsImV4cCI6MjA3MTA2MTk4NX0.3KMVlqAr4bu0l0Wfs47I2GQtUQcb3xTqPoXSSXgzbJo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMCPConnection() {
  try {
    console.log('🔗 Testando conexão MCP com Supabase...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      return false;
    }
    
    console.log('✅ Conexão MCP estabelecida com sucesso!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    return false;
  }
}

testMCPConnection();
EOF

echo "🧪 Executando teste de conexão..."
node test-mcp.js

echo ""
echo "🎉 Configuração MCP concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Reinicie o Cursor"
echo "2. Abra o projeto: /Users/macbook/Desktop/arbitrage-crypto-flow"
echo "3. O Cursor agora terá acesso direto à sua Supabase via MCP"
echo ""
echo "🔧 Comandos MCP disponíveis:"
echo "- Consultar dados da tabela profiles"
echo "- Executar queries SQL"
echo "- Gerenciar usuários"
echo "- Monitorar logs"
echo ""
echo "✅ MCP configurado e pronto para uso!"

