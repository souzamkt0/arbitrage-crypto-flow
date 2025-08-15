#!/bin/bash

# Script para deploy automatizado no Vercel
# Este script sempre atualiza o repositório e faz o deploy

echo "🚀 Iniciando deploy automatizado para Vercel..."

# Verificar se estamos em um repositório git
if [ ! -d ".git" ]; then
    echo "❌ Erro: Este não é um repositório Git"
    exit 1
fi

# Adicionar todas as mudanças
echo "📝 Adicionando mudanças..."
git add .

# Verificar se há mudanças para commit
if git diff --staged --quiet; then
    echo "ℹ️  Nenhuma mudança para commit"
else
    # Fazer commit com timestamp
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
    echo "💾 Fazendo commit das mudanças..."
    git commit -m "Deploy automático - $TIMESTAMP"
fi

# Push para o repositório
echo "⬆️  Enviando para o repositório..."
git push origin main || git push origin master

if [ $? -eq 0 ]; then
    echo "✅ Repositório atualizado com sucesso!"
    echo "🌐 O Vercel irá detectar automaticamente as mudanças e fazer o deploy"
    echo "📱 Acesse: https://vercel.com/dashboard para acompanhar o deploy"
else
    echo "❌ Erro ao fazer push para o repositório"
    exit 1
fi

echo "🎉 Deploy iniciado com sucesso!"