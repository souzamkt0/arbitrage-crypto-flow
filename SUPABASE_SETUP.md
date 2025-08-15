# Configuração do Supabase para Upload de Fotos

## Pré-requisitos

1. **Docker Desktop**: Instale o Docker Desktop para desenvolvimento local
   - Download: https://docs.docker.com/desktop
   - Certifique-se de que o Docker está rodando

2. **Conta no Supabase**: Crie uma conta em https://supabase.com

## Configuração Local (Desenvolvimento)

### 1. Iniciar Supabase Local
```bash
# Iniciar os serviços do Supabase localmente
npx supabase start

# Aplicar as migrações
npx supabase db push
```

### 2. Configurar Storage Bucket
Após iniciar o Supabase local, execute o script SQL no dashboard:

1. Acesse: http://localhost:54323 (Supabase Studio local)
2. Vá para "SQL Editor"
3. Execute o conteúdo do arquivo `create-storage-bucket.sql`

## Configuração em Produção

### 1. Criar Projeto no Supabase
1. Acesse https://supabase.com/dashboard
2. Crie um novo projeto
3. Anote a URL e a chave anon do projeto

### 2. Linkar Projeto Local
```bash
# Linkar com o projeto remoto
npx supabase link --project-ref SEU_PROJECT_REF

# Aplicar migrações
npx supabase db push
```

### 3. Configurar Storage Bucket em Produção
1. Acesse o dashboard do seu projeto no Supabase
2. Vá para "Storage" > "Buckets"
3. Crie um bucket chamado "user-photos" com as seguintes configurações:
   - Public: ✅ Sim
   - File size limit: 5MB
   - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

4. Vá para "SQL Editor" e execute o conteúdo do arquivo `create-storage-bucket.sql`

## Estrutura da Tabela photo_uploads

A migração `20250115000003_create_photo_uploads_table.sql` cria uma tabela com os seguintes campos:

- `id`: UUID único do upload
- `user_id`: ID do usuário (referência para auth.users)
- `file_name`: Nome original do arquivo
- `file_size`: Tamanho em bytes
- `file_type`: Tipo MIME
- `file_url`: URL pública do arquivo
- `storage_path`: Caminho no storage
- `upload_date`: Data do upload
- `is_active`: Status ativo/inativo
- `metadata`: Metadados em JSON
- `created_at` / `updated_at`: Timestamps

## Políticas de Segurança (RLS)

A tabela possui Row Level Security habilitado com as seguintes políticas:

- Usuários podem ver apenas seus próprios uploads
- Usuários podem inserir apenas seus próprios uploads
- Usuários podem atualizar apenas seus próprios uploads
- Usuários podem deletar apenas seus próprios uploads

## Uso na Aplicação

Para usar o upload de fotos na aplicação:

1. Configure as variáveis de ambiente do Supabase no `.env`
2. Use o cliente Supabase para fazer upload para o bucket "user-photos"
3. Salve as informações do upload na tabela `photo_uploads`
4. Use a URL pública para exibir as imagens nos posts

## Comandos Úteis

```bash
# Ver status dos serviços
npx supabase status

# Parar serviços locais
npx supabase stop

# Reset do banco local
npx supabase db reset

# Gerar tipos TypeScript
npx supabase gen types typescript --local > src/types/supabase.ts
```