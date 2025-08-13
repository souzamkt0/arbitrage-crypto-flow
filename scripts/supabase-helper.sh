#!/bin/bash

# Script helper para Supabase - Automatizar alterações de colunas
# Uso: ./scripts/supabase-helper.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para gerar timestamp
generate_timestamp() {
    date +"%Y%m%d%H%M%S"
}

# Função para gerar UUID simples
generate_uuid() {
    if command -v uuidgen &> /dev/null; then
        uuidgen | tr '[:upper:]' '[:lower:]'
    else
        # Fallback UUID generation
        python3 -c "import uuid; print(str(uuid.uuid4()))"
    fi
}

# Função para criar arquivo de migração
create_migration() {
    local name="$1"
    local sql="$2"
    
    local timestamp=$(generate_timestamp)
    local uuid=$(generate_uuid)
    local filename="${timestamp}_${uuid}.sql"
    local filepath="supabase/migrations/${filename}"
    
    # Criar diretório se não existir
    mkdir -p supabase/migrations
    
    # Criar arquivo de migração
    cat > "$filepath" << EOF
-- $name
-- Criado automaticamente em $(date -Iseconds)

$sql
EOF
    
    echo -e "${GREEN}✅ Migração criada: $filename${NC}"
    echo "$filepath"
}

# Função para executar migração
run_migration() {
    echo -e "${BLUE}🚀 Executando migração...${NC}"
    if npx supabase migration up; then
        echo -e "${GREEN}✅ Migração executada com sucesso!${NC}"
    else
        echo -e "${RED}❌ Erro ao executar migração${NC}"
        exit 1
    fi
}

# Função para adicionar coluna
add_column() {
    echo -e "${YELLOW}📝 Adicionar Nova Coluna${NC}"
    read -p "Nome da tabela: " table
    read -p "Nome da coluna: " column
    read -p "Tipo da coluna (ex: text, integer, decimal(10,2)): " type
    read -p "Valor padrão (opcional): " default_value
    
    local sql="ALTER TABLE public.$table \nADD COLUMN IF NOT EXISTS $column $type"
    if [ ! -z "$default_value" ]; then
        sql="$sql DEFAULT '$default_value'"
    fi
    sql="$sql;"
    
    echo -e "\n${BLUE}SQL gerado:${NC}"
    echo "$sql"
    
    read -p "Confirma? (s/n): " confirm
    if [[ $confirm == "s" || $confirm == "sim" ]]; then
        local filepath=$(create_migration "Adicionar coluna $column em $table" "$sql")
        read -p "Executar agora? (s/n): " run_now
        if [[ $run_now == "s" || $run_now == "sim" ]]; then
            run_migration
        fi
    fi
}

# Função para alterar tipo de coluna
alter_column_type() {
    echo -e "${YELLOW}🔄 Alterar Tipo de Coluna${NC}"
    read -p "Nome da tabela: " table
    read -p "Nome da coluna: " column
    read -p "Novo tipo: " new_type
    
    local sql="ALTER TABLE public.$table \nALTER COLUMN $column TYPE $new_type;"
    
    echo -e "\n${BLUE}SQL gerado:${NC}"
    echo "$sql"
    
    read -p "Confirma? (s/n): " confirm
    if [[ $confirm == "s" || $confirm == "sim" ]]; then
        local filepath=$(create_migration "Alterar tipo da coluna $column em $table" "$sql")
        read -p "Executar agora? (s/n): " run_now
        if [[ $run_now == "s" || $run_now == "sim" ]]; then
            run_migration
        fi
    fi
}

# Função para renomear coluna
rename_column() {
    echo -e "${YELLOW}✏️ Renomear Coluna${NC}"
    read -p "Nome da tabela: " table
    read -p "Nome atual da coluna: " old_name
    read -p "Novo nome da coluna: " new_name
    
    local sql="ALTER TABLE public.$table \nRENAME COLUMN $old_name TO $new_name;"
    
    echo -e "\n${BLUE}SQL gerado:${NC}"
    echo "$sql"
    
    read -p "Confirma? (s/n): " confirm
    if [[ $confirm == "s" || $confirm == "sim" ]]; then
        local filepath=$(create_migration "Renomear coluna $old_name para $new_name em $table" "$sql")
        read -p "Executar agora? (s/n): " run_now
        if [[ $run_now == "s" || $run_now == "sim" ]]; then
            run_migration
        fi
    fi
}

# Função para remover coluna
drop_column() {
    echo -e "${YELLOW}🗑️ Remover Coluna${NC}"
    read -p "Nome da tabela: " table
    read -p "Nome da coluna: " column
    
    local sql="ALTER TABLE public.$table \nDROP COLUMN IF EXISTS $column;"
    
    echo -e "\n${RED}⚠️ ATENÇÃO: Esta operação é irreversível!${NC}"
    echo -e "${BLUE}SQL gerado:${NC}"
    echo "$sql"
    
    read -p "Tem certeza? Digite 'CONFIRMO' para continuar: " confirm
    if [[ $confirm == "CONFIRMO" ]]; then
        local filepath=$(create_migration "Remover coluna $column de $table" "$sql")
        read -p "Executar agora? (s/n): " run_now
        if [[ $run_now == "s" || $run_now == "sim" ]]; then
            run_migration
        fi
    else
        echo -e "${RED}❌ Operação cancelada${NC}"
    fi
}

# Função para SQL customizado
custom_sql() {
    echo -e "${YELLOW}⚡ SQL Customizado${NC}"
    read -p "Nome da migração: " migration_name
    echo "Digite o SQL (termine com uma linha contendo apenas 'END'):"
    
    local sql=""
    while IFS= read -r line; do
        if [[ "$line" == "END" ]]; then
            break
        fi
        sql="$sql$line\n"
    done
    
    echo -e "\n${BLUE}SQL gerado:${NC}"
    echo -e "$sql"
    
    read -p "Confirma? (s/n): " confirm
    if [[ $confirm == "s" || $confirm == "sim" ]]; then
        local filepath=$(create_migration "$migration_name" "$sql")
        read -p "Executar agora? (s/n): " run_now
        if [[ $run_now == "s" || $run_now == "sim" ]]; then
            run_migration
        fi
    fi
}

# Função para mostrar status do Supabase
show_status() {
    echo -e "${BLUE}📊 Status do Supabase${NC}"
    npx supabase status
}

# Função para resetar banco
reset_db() {
    echo -e "${RED}⚠️ ATENÇÃO: Isso irá resetar todo o banco de dados!${NC}"
    read -p "Tem certeza? Digite 'RESET' para continuar: " confirm
    if [[ $confirm == "RESET" ]]; then
        echo -e "${BLUE}🔄 Resetando banco de dados...${NC}"
        npx supabase db reset
        echo -e "${GREEN}✅ Banco resetado com sucesso!${NC}"
    else
        echo -e "${RED}❌ Operação cancelada${NC}"
    fi
}

# Menu principal
show_menu() {
    echo -e "${BLUE}🔧 Supabase Helper - Automatizar Alterações${NC}\n"
    echo "1. Adicionar coluna"
    echo "2. Alterar tipo de coluna"
    echo "3. Renomear coluna"
    echo "4. Remover coluna"
    echo "5. SQL customizado"
    echo "6. Mostrar status"
    echo "7. Resetar banco"
    echo "8. Sair"
    echo
}

# Loop principal
while true; do
    show_menu
    read -p "Escolha uma opção (1-8): " choice
    
    case $choice in
        1) add_column ;;
        2) alter_column_type ;;
        3) rename_column ;;
        4) drop_column ;;
        5) custom_sql ;;
        6) show_status ;;
        7) reset_db ;;
        8) echo -e "${GREEN}👋 Até logo!${NC}"; exit 0 ;;
        *) echo -e "${RED}❌ Opção inválida${NC}" ;;
    esac
    
    echo
    read -p "Pressione Enter para continuar..."
    clear
done