# 📊 Tabela User Data - Guia Completo

Este guia explica como usar a nova tabela `user_data` criada para o sistema.

## 📁 Arquivos Criados

### 1. Migração SQL
**Arquivo:** `supabase/migrations/20250115000001_create_user_table.sql`
- Cria a tabela `user_data` com todos os campos necessários
- Configura índices para melhor performance
- Implementa Row Level Security (RLS)
- Adiciona políticas de segurança

### 2. Script de Migração
**Arquivo:** `apply-user-table-migration.js`
- Script Node.js para aplicar a migração automaticamente
- Testa a conexão com o Supabase
- Verifica se a tabela foi criada corretamente

### 3. Componente React
**Arquivo:** `src/components/UserDataTable.tsx`
- Componente completo para gerenciar dados da tabela
- Funcionalidades CRUD (Create, Read, Update, Delete)
- Interface responsiva e moderna
- Validação de dados

### 4. Página de Demonstração
**Arquivo:** `src/pages/UserData.tsx`
- Página completa mostrando como usar o componente
- Teste de conexão com a tabela
- Documentação integrada
- Status da implementação

## 🗄️ Estrutura da Tabela

```sql
CREATE TABLE user_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Campos da Tabela:
- **id**: Chave primária UUID
- **user_id**: Referência ao usuário autenticado
- **name**: Nome completo (obrigatório)
- **email**: Email único (obrigatório)
- **phone**: Telefone (opcional)
- **address**: Endereço completo (opcional)
- **city**: Cidade (opcional)
- **country**: País (opcional)
- **created_at**: Data de criação
- **updated_at**: Data de atualização

## 🚀 Como Usar

### Passo 1: Aplicar a Migração
```bash
# Execute o script de migração
node apply-user-table-migration.js
```

### Passo 2: Verificar no Supabase Dashboard
1. Acesse seu projeto no Supabase
2. Vá para "Table Editor"
3. Verifique se a tabela `user_data` foi criada
4. Confirme se as políticas RLS estão ativas

### Passo 3: Usar o Componente
```tsx
import UserDataTable from '@/components/UserDataTable';

function MinhaPage() {
  return (
    <div>
      <h1>Meus Dados</h1>
      <UserDataTable />
    </div>
  );
}
```

### Passo 4: Acessar a Página de Demo
- Adicione a rota no seu sistema de rotas
- Acesse `/user-data` para ver a implementação completa

## 🔒 Segurança

### Row Level Security (RLS)
A tabela implementa RLS com as seguintes políticas:

- **SELECT**: Usuários só podem ver seus próprios dados
- **INSERT**: Usuários só podem inserir dados para si mesmos
- **UPDATE**: Usuários só podem atualizar seus próprios dados
- **DELETE**: Usuários só podem excluir seus próprios dados

### Validações
- Email deve ser único
- Nome e email são obrigatórios
- Campos opcionais podem ser nulos

## 🎨 Funcionalidades da Interface

### Componente UserDataTable
- ✅ **Listagem**: Tabela responsiva com todos os dados
- ✅ **Criação**: Modal para adicionar novos registros
- ✅ **Edição**: Modal para editar registros existentes
- ✅ **Exclusão**: Confirmação antes de excluir
- ✅ **Validação**: Campos obrigatórios e formatos
- ✅ **Feedback**: Toasts para sucesso/erro
- ✅ **Loading**: Estados de carregamento

### Página UserData
- ✅ **Status**: Verificação da conexão com a tabela
- ✅ **Documentação**: Informações sobre a implementação
- ✅ **Teste**: Botão para testar a conexão
- ✅ **Troubleshooting**: Dicas para resolver problemas

## 🛠️ Personalização

### Adicionar Novos Campos
1. Modifique a migração SQL
2. Atualize a interface TypeScript
3. Ajuste o formulário no componente
4. Execute a nova migração

### Exemplo de Campo Adicional:
```sql
ALTER TABLE user_data ADD COLUMN birth_date DATE;
```

```tsx
interface UserData {
  // ... campos existentes
  birth_date?: string;
}
```

### Customizar Validações
Edite o componente `UserDataTable.tsx` para adicionar:
- Validações customizadas
- Máscaras de input
- Formatação de dados

## 🐛 Troubleshooting

### Erro: "relation 'user_data' does not exist"
**Solução:** Execute a migração
```bash
node apply-user-table-migration.js
```

### Erro: "RLS policy violation"
**Solução:** Verifique se o usuário está autenticado

### Erro: "duplicate key value violates unique constraint"
**Solução:** Email já existe, use um email diferente

### Tabela não aparece no Supabase
**Soluções:**
1. Verifique as credenciais no `.env`
2. Confirme se o projeto Supabase está correto
3. Execute a migração manualmente no SQL Editor

## 📝 Exemplos de Uso

### Buscar Dados do Usuário
```tsx
const { data, error } = await supabase
  .from('user_data')
  .select('*')
  .eq('user_id', user.id);
```

### Inserir Novo Registro
```tsx
const { error } = await supabase
  .from('user_data')
  .insert({
    user_id: user.id,
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-9999'
  });
```

### Atualizar Registro
```tsx
const { error } = await supabase
  .from('user_data')
  .update({ phone: '(11) 88888-8888' })
  .eq('id', recordId)
  .eq('user_id', user.id);
```

### Excluir Registro
```tsx
const { error } = await supabase
  .from('user_data')
  .delete()
  .eq('id', recordId)
  .eq('user_id', user.id);
```

## 🎯 Próximos Passos

1. **Integrar com o sistema de rotas** da aplicação
2. **Adicionar mais campos** conforme necessário
3. **Implementar filtros e busca** na tabela
4. **Adicionar exportação** de dados
5. **Criar relatórios** baseados nos dados

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do console
2. Teste a conexão com o botão na página
3. Confirme se a migração foi aplicada
4. Verifique as credenciais do Supabase

---

**Criado em:** Janeiro 2025  
**Versão:** 1.0  
**Compatível com:** React + TypeScript + Supabase