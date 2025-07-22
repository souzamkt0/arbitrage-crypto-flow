#!/bin/bash

# 🚀 Script de Deploy Automatizado para VPS com aaPanel + Apache
# Autor: Sistema de Arbitragem Crypto Flow
# Versão: 1.0

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERRO] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[AVISO] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar se está rodando como root
if [[ $EUID -eq 0 ]]; then
   error "Este script não deve ser executado como root"
fi

# Configurações
PROJECT_NAME="arbitrage-crypto-flow"
PROJECT_PATH="/www/wwwroot/$PROJECT_NAME"
NODE_VERSION="18"
PM2_APP_NAME="arbitrage-crypto-flow"

log "🚀 Iniciando deploy do $PROJECT_NAME com Apache"

# Verificar se o diretório existe
if [ ! -d "$PROJECT_PATH" ]; then
    log "📁 Criando diretório do projeto..."
    sudo mkdir -p "$PROJECT_PATH"
    sudo chown $USER:$USER "$PROJECT_PATH"
fi

# Navegar para o diretório do projeto
cd "$PROJECT_PATH"

# Verificar se é um repositório Git
if [ ! -d ".git" ]; then
    warning "Diretório não é um repositório Git. Inicializando..."
    git init
    git remote add origin https://github.com/SEU_USUARIO/arbitrage-crypto-flow.git
fi

# Pull das mudanças
log "📥 Atualizando código..."
git pull origin main || warning "Erro ao fazer pull. Continuando..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    error "Node.js não está instalado. Execute: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
fi

# Verificar versão do Node.js
NODE_CURRENT_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_CURRENT_VERSION" -lt "$NODE_VERSION" ]; then
    error "Node.js versão $NODE_VERSION+ é necessária. Versão atual: $(node -v)"
fi

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    log "📦 Instalando PM2..."
    sudo npm install -g pm2
fi

# Instalar dependências
log "📦 Instalando dependências..."
npm install

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    log "⚙️ Criando arquivo .env..."
    cat > .env << EOF
# Supabase Configuration
VITE_SUPABASE_URL=https://cbwpghrkfvczjqzefvix.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8

# DigitoPay Configuration
VITE_DIGITOPAY_CLIENT_ID=da0cdf6c-06dd-4e04-a046-abd00e8b43ed
VITE_DIGITOPAY_CLIENT_SECRET=3f58b8f4-e101-4076-a844-3a64c7915b1a
VITE_DIGITOPAY_WEBHOOK_SECRET=https://api.digitopayoficial.com.br/api

# Environment
NODE_ENV=production
EOF
    warning "Arquivo .env criado com configurações padrão. Verifique e ajuste as credenciais!"
fi

# Build do projeto
log "🔨 Fazendo build do projeto..."
npm run build

# Verificar se o build foi criado
if [ ! -d "dist" ]; then
    error "Build não foi criado. Verifique os erros acima."
fi

# Criar diretório de logs
mkdir -p logs

# Criar arquivo de configuração do PM2
log "⚙️ Configurando PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$PM2_APP_NAME',
    script: 'npm',
    args: 'run preview',
    cwd: '$PROJECT_PATH',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '$PROJECT_PATH/logs/err.log',
    out_file: '$PROJECT_PATH/logs/out.log',
    log_file: '$PROJECT_PATH/logs/combined.log',
    time: true
  }]
};
EOF

# Parar aplicação se estiver rodando
if pm2 list | grep -q "$PM2_APP_NAME"; then
    log "🛑 Parando aplicação atual..."
    pm2 stop "$PM2_APP_NAME" || true
    pm2 delete "$PM2_APP_NAME" || true
fi

# Iniciar aplicação com PM2
log "🚀 Iniciando aplicação com PM2..."
pm2 start ecosystem.config.js

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar com o sistema (se não estiver configurado)
if ! pm2 startup | grep -q "already inited"; then
    log "⚙️ Configurando PM2 para iniciar com o sistema..."
    pm2 startup
fi

# Verificar status
log "📊 Verificando status da aplicação..."
pm2 status

# Verificar se a aplicação está rodando
if pm2 list | grep -q "$PM2_APP_NAME.*online"; then
    log "✅ Aplicação iniciada com sucesso!"
else
    error "❌ Falha ao iniciar a aplicação. Verifique os logs: pm2 logs $PM2_APP_NAME"
fi

# Configurar Apache
log "🌐 Configurando Apache..."
if [ -f "/etc/apache2/apache2.conf" ]; then
    info "Apache detectado. Configurando módulos..."
    
    # Habilitar módulos necessários
    sudo a2enmod rewrite 2>/dev/null || warning "Erro ao habilitar mod_rewrite"
    sudo a2enmod headers 2>/dev/null || warning "Erro ao habilitar mod_headers"
    sudo a2enmod expires 2>/dev/null || warning "Erro ao habilitar mod_expires"
    sudo a2enmod deflate 2>/dev/null || warning "Erro ao habilitar mod_deflate"
    sudo a2enmod proxy 2>/dev/null || warning "Erro ao habilitar mod_proxy"
    sudo a2enmod proxy_http 2>/dev/null || warning "Erro ao habilitar mod_proxy_http"
    
    # Criar .htaccess
    log "📝 Criando .htaccess..."
    cat > dist/.htaccess << 'EOF'
# Enable rewrite engine
RewriteEngine On

# Handle React Router
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
Header always set X-Content-Type-Options "nosniff"

# Cache static assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header set Cache-Control "public, immutable"
</FilesMatch>

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
EOF
    
    # Reiniciar Apache
    log "🔄 Reiniciando Apache..."
    sudo systemctl restart apache2
    
    info "Configure o site no aaPanel:"
    info "1. Vá para aaPanel → Website"
    info "2. Adicione um novo site"
    info "3. Configure o root directory como: $PROJECT_PATH/dist"
    info "4. Configure SSL se necessário"
else
    warning "Apache não detectado. Instale via aaPanel Software Store"
fi

# Configurar firewall
log "🔥 Configurando firewall..."
sudo ufw allow 80 2>/dev/null || true
sudo ufw allow 443 2>/dev/null || true
sudo ufw allow 22 2>/dev/null || true

# Verificar portas
log "🔍 Verificando portas..."
netstat -tulpn | grep -E ":(80|443|3000)" || warning "Portas não detectadas"

# Informações finais
log "🎉 Deploy concluído com sucesso!"
echo ""
echo "📋 Informações importantes:"
echo "   • Aplicação: http://localhost:3000"
echo "   • Logs: pm2 logs $PM2_APP_NAME"
echo "   • Status: pm2 status"
echo "   • Reiniciar: pm2 restart $PM2_APP_NAME"
echo ""
echo "🌐 Para configurar o domínio:"
echo "   1. Configure o site no aaPanel"
echo "   2. Configure SSL/HTTPS"
echo "   3. Configure o DNS do domínio"
echo ""
echo "📊 Monitoramento:"
echo "   • PM2: pm2 monit"
echo "   • Logs: tail -f $PROJECT_PATH/logs/combined.log"
echo "   • Apache: sudo tail -f /var/log/apache2/error.log"
echo ""

# Verificar se há atualizações pendentes
if git status --porcelain | grep -q "M\|A\|D"; then
    warning "Há arquivos modificados no repositório. Considere fazer commit das mudanças."
fi

log "✅ Deploy finalizado! Acesse http://SEU_IP:3000 para testar." 