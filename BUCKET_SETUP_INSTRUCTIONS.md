# Instruções para Configurar o Bucket de Imagens

O sistema de upload de fotos requer que o bucket `post-images` seja criado no Supabase. Siga estas instruções:

## 1. Acesse o Supabase Dashboard

1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione o projeto: `cbwpghrkfvczjqzefvix`

## 2. Navegue para Storage

1. No menu lateral, clique em **Storage**
2. Clique em **Create a new bucket**

## 3. Configure o Bucket

**Nome do bucket:** `post-images`

**Configurações:**
- ✅ Public bucket (marque esta opção)
- **File size limit:** 5242880 (5MB)
- **Allowed MIME types:** 
  - image/jpeg
  - image/png
  - image/gif
  - image/webp

## 4. Configurar Políticas RLS (Row Level Security)

Após criar o bucket, vá para **SQL Editor** e execute este código:

```sql
-- Política para leitura pública
CREATE POLICY "Allow public read access on post-images" 
ON storage.objects
FOR SELECT 
USING (bucket_id = 'post-images');

-- Política para upload de usuários autenticados
CREATE POLICY "Allow authenticated users to upload to post-images" 
ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'post-images' AND
  auth.role() = 'authenticated'
);

-- Política para deletar próprios arquivos
CREATE POLICY "Allow users to delete own files from post-images" 
ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'post-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para atualizar próprios arquivos
CREATE POLICY "Allow users to update own files in post-images" 
ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'post-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 5. Verificar Configuração

Após executar os passos acima:

1. Volte para a aplicação
2. Tente fazer upload de uma imagem em um post
3. Se ainda houver erro, verifique:
   - Se o bucket foi criado corretamente
   - Se as políticas RLS foram aplicadas
   - Se o usuário está autenticado

## Solução de Problemas

### Erro: "Bucket not found"
- Verifique se o bucket `post-images` foi criado
- Confirme que o nome está correto (sem espaços ou caracteres especiais)

### Erro: "Row-level security policy violation"
- Execute as políticas RLS fornecidas acima
- Verifique se o usuário está autenticado

### Erro: "File size too large"
- Verifique se a imagem é menor que 5MB
- Considere redimensionar a imagem antes do upload

---

**Nota:** Estas configurações são necessárias apenas uma vez. Após a configuração inicial, o sistema funcionará normalmente para todos os usuários.