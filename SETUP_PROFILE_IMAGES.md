# Configuração de Upload de Imagens de Perfil

Este guia explica como configurar o upload de fotos de perfil e capa no Supabase.

## 📋 Pré-requisitos

- Projeto Supabase configurado
- Acesso ao Dashboard do Supabase
- Variáveis de ambiente configuradas no arquivo `.env`

## 🚀 Configuração dos Buckets

### Passo 1: Executar Script SQL

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para seu projeto
3. Navegue até **SQL Editor**
4. Execute o script `create-profile-buckets.sql` que foi criado na raiz do projeto

### Passo 2: Verificar Buckets Criados

Após executar o script, você deve ter:

- **profile-images**: Para fotos de perfil (limite: 5MB)
- **cover-images**: Para fotos de capa (limite: 10MB)

### Passo 3: Verificar Políticas RLS

O script cria automaticamente as seguintes políticas:

#### Para profile-images:
- ✅ Usuários podem fazer upload de suas próprias imagens
- ✅ Imagens são publicamente visíveis
- ✅ Usuários podem deletar suas próprias imagens
- ✅ Usuários podem atualizar suas próprias imagens

#### Para cover-images:
- ✅ Usuários podem fazer upload de suas próprias imagens de capa
- ✅ Imagens são publicamente visíveis
- ✅ Usuários podem deletar suas próprias imagens de capa
- ✅ Usuários podem atualizar suas próprias imagens de capa

## 🔧 Funcionalidades Implementadas

### Componente ProfileImageUpload

Localizado em `src/components/ProfileImageUpload.tsx`, este componente oferece:

- **Upload de imagens**: Suporte para JPEG, PNG, WebP e GIF
- **Validação de tamanho**: 5MB para perfil, 10MB para capa
- **Preview em tempo real**: Visualização antes do upload
- **Remoção de imagens**: Deletar imagens existentes
- **Feedback visual**: Loading states e mensagens de erro/sucesso

### Integração na Página de Edição

A página `src/pages/EditProfile.tsx` foi atualizada para incluir:

- **Upload de foto de perfil**: Botão de câmera no avatar
- **Upload de foto de capa**: Botão na área da capa
- **Integração com autenticação**: Usa o ID do usuário logado

## 📱 Como Usar

1. **Acesse a página de edição de perfil**
2. **Para foto de perfil**: Clique no ícone de câmera no avatar
3. **Para foto de capa**: Clique no botão "Editar capa"
4. **Selecione uma imagem** do seu dispositivo
5. **Aguarde o upload** e confirmação

## 🔒 Segurança

- **Autenticação obrigatória**: Apenas usuários logados podem fazer upload
- **Isolamento por usuário**: Cada usuário só pode acessar suas próprias imagens
- **Validação de tipo**: Apenas formatos de imagem permitidos
- **Limite de tamanho**: Proteção contra uploads muito grandes

## 🐛 Solução de Problemas

### Erro: "Bucket não encontrado"
- Verifique se o script SQL foi executado corretamente
- Confirme se os buckets foram criados no Storage do Supabase

### Erro: "Permissão negada"
- Verifique se as políticas RLS foram criadas
- Confirme se o usuário está autenticado

### Erro: "Arquivo muito grande"
- Verifique os limites: 5MB para perfil, 10MB para capa
- Comprima a imagem antes do upload

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   └── ProfileImageUpload.tsx    # Componente de upload
├── pages/
│   └── EditProfile.tsx           # Página de edição integrada
└── hooks/
    └── useAuth.tsx               # Hook de autenticação
```

## 🎯 Próximos Passos

- [ ] Implementar redimensionamento automático de imagens
- [ ] Adicionar suporte para múltiplos formatos
- [ ] Implementar cache de imagens
- [ ] Adicionar compressão automática

---

**Nota**: Certifique-se de que as variáveis de ambiente do Supabase estão configuradas corretamente no arquivo `.env` antes de testar a funcionalidade.