#!/bin/bash

echo "🔧 Configurando ambiente DigitoPay..."

# Copiar arquivo de configuração
if [ -f "config.env" ]; then
    cp config.env .env
    echo "✅ Arquivo .env criado com sucesso!"
else
    echo "❌ Arquivo config.env não encontrado!"
    exit 1
fi

# Verificar se o arquivo foi criado
if [ -f ".env" ]; then
    echo "✅ Configuração do ambiente concluída!"
    echo ""
    echo "📋 Configurações aplicadas:"
    echo "   - Supabase URL: https://cbwpghrkfvczjqzefvix.supabase.co"
    echo "   - DigitoPay Client ID: da0cdf6c-06dd-4e04-a046-abd00e8b43ed"
    echo "   - DigitoPay Client Secret: 3f58b8f4-e101-4076-a844-3a64c7915b1a"
    echo "   - Webhook Secret: your_webhook_secret_here (precisa configurar)"
    echo ""
    echo "🚀 Para aplicar as configurações, reinicie o servidor:"
    echo "   npm run dev"
    echo ""
    echo "🔍 Para testar o DigitoPay, acesse:"
    echo "   http://localhost:8081/deposit"
else
    echo "❌ Erro ao criar arquivo .env"
    exit 1
fi
