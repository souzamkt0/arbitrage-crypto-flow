# 🚀 Instruções de Deploy Automático para Vercel

Este projeto possui um script automatizado para deploy no Vercel que sempre atualiza o repositório antes do deploy.

## 📋 Como usar

### Opção 1: Comando npm (Recomendado)
```bash
npm run deploy
```

### Opção 2: Script direto
```bash
./deploy-vercel.sh
```

## 🔧 O que o script faz

1. **Verifica** se está em um repositório Git
2. **Adiciona** todas as mudanças (`git add .`)
3. **Faz commit** automaticamente com timestamp se houver mudanças
4. **Envia** as mudanças para o repositório (`git push`)
5. **Informa** que o Vercel detectará automaticamente as mudanças

## 📱 Acompanhar o Deploy

Após executar o comando, acesse:
- [Vercel Dashboard](https://vercel.com/dashboard) para acompanhar o progresso do deploy

## ⚠️ Requisitos

- Repositório Git configurado
- Projeto conectado ao Vercel
- Permissões de push para o repositório

## 🎯 Vantagens

- ✅ Sempre atualiza o repositório antes do deploy
- ✅ Commit automático com timestamp
- ✅ Feedback visual do processo
- ✅ Detecção automática pelo Vercel
- ✅ Comando simples e rápido

## 🔄 Deploy Contínuo

O Vercel está configurado para fazer deploy automático sempre que houver mudanças na branch principal. Este script garante que suas mudanças locais sejam sempre enviadas para o repositório.