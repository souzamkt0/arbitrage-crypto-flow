# Funcionalidade de Upload de Imagens na Comunidade

## Resumo das Alterações

Foi implementada a funcionalidade de upload de imagens nos posts da comunidade. As principais alterações incluem:

### 1. Estrutura do Banco de Dados

**Nova coluna adicionada à tabela `community_posts`:**
- `image_url` (TEXT, opcional) - URL da imagem anexada ao post

**Arquivos de migração criados:**
- `supabase/migrations/20250115000002_add_image_to_community_posts.sql`
- `add_image_column_manual.sql` (para execução manual no painel do Supabase)

### 2. Alterações no Frontend

**Arquivos modificados:**
- `src/integrations/supabase/types.ts` - Adicionado campo `image_url` na interface da tabela
- `src/pages/Community.tsx` - Implementada funcionalidade de upload e preview
- `src/components/TwitterPost.tsx` - Adicionada exibição de imagens nos posts

**Novas funcionalidades:**
- Botão de upload de imagem no formulário de criação de posts
- Preview da imagem selecionada antes de postar
- Validação de tipo de arquivo (apenas imagens)
- Validação de tamanho (máximo 5MB)
- Exibição de imagens nos posts com possibilidade de abrir em nova aba
- Botão para remover imagem selecionada

## Como Aplicar a Migração

### Opção 1: Execução Manual no Painel do Supabase

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Vá para o projeto e acesse "SQL Editor"
3. Execute o conteúdo do arquivo `add_image_column_manual.sql`

### Opção 2: Via CLI do Supabase (requer Docker)

```bash
# Primeiro, conecte ao projeto
npx supabase link --project-ref cbwpghrkfvczjqzefvix

# Aplique as migrações
npx supabase db push
```

## Como Usar a Funcionalidade

### Para Usuários:

1. **Criar post com imagem:**
   - Acesse a página da Comunidade
   - Digite o texto do post
   - Clique no ícone de imagem (📷) abaixo do campo de texto
   - Selecione uma imagem (PNG, JPG, GIF, etc.)
   - A imagem aparecerá como preview
   - Clique em "Postar" para publicar

2. **Remover imagem:**
   - Clique no "X" no canto superior direito da imagem de preview

3. **Visualizar imagens:**
   - As imagens aparecem nos posts da timeline
   - Clique na imagem para abrir em nova aba

### Limitações:

- **Tipos de arquivo:** Apenas imagens (PNG, JPG, JPEG, GIF, WebP, etc.)
- **Tamanho máximo:** 5MB por imagem
- **Armazenamento:** Atualmente usando base64 (para produção, recomenda-se usar Supabase Storage)

## Próximos Passos Recomendados

### Para Produção:

1. **Implementar Supabase Storage:**
   - Configurar bucket para imagens
   - Implementar upload real de arquivos
   - Gerar URLs públicas para as imagens

2. **Otimizações:**
   - Compressão automática de imagens
   - Redimensionamento para diferentes tamanhos
   - Lazy loading para melhor performance

3. **Segurança:**
   - Validação de conteúdo de imagem no backend
   - Rate limiting para uploads
   - Moderação de conteúdo

## Estrutura de Arquivos

```
├── supabase/migrations/
│   └── 20250115000002_add_image_to_community_posts.sql
├── src/
│   ├── integrations/supabase/types.ts (modificado)
│   ├── pages/Community.tsx (modificado)
│   └── components/TwitterPost.tsx (modificado)
├── add_image_column_manual.sql (novo)
└── FUNCIONALIDADE_UPLOAD_IMAGENS.md (este arquivo)
```

## Testando a Funcionalidade

1. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse: http://localhost:8080

3. Navegue para a página da Comunidade

4. Teste o upload de imagens nos posts

---

**Nota:** Certifique-se de aplicar a migração do banco de dados antes de testar a funcionalidade em produção.