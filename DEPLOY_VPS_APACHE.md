# 🚀 Guia de Deploy - VPS com aaPanel + Apache

## 📋 Pré-requisitos

### 1. **VPS Configurado**
- ✅ VPS com Ubuntu 20.04+ ou CentOS 7+
- ✅ aaPanel instalado
- ✅ Node.js 18+ instalado
- ✅ Git instalado

### 2. **Domínio (Opcional mas Recomendado)**
- 🌐 Domínio configurado
- 🔒 SSL/HTTPS configurado

## 🛠️ Passo a Passo - Deploy no aaPanel com Apache

### **Passo 1: Preparar o VPS**

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version

# Instalar PM2 (Process Manager)
sudo npm install -g pm2
```

### **Passo 2: Configurar aaPanel**

1. **Acesse o aaPanel** (geralmente `http://SEU_IP:8888`)
2. **Vá para "Software Store"**
3. **Instale:**
   - ✅ **Apache** (Web Server)
   - ✅ **Node.js** (se não estiver instalado)
   - ✅ **Git** (se não estiver instalado)

### **Passo 3: Clonar o Projeto**

```bash
# Criar diretório para o projeto
sudo mkdir -p /www/wwwroot/arbitrage-crypto-flow
cd /www/wwwroot/arbitrage-crypto-flow

# Clonar o repositório
git clone https://github.com/SEU_USUARIO/arbitrage-crypto-flow.git .

# Ou fazer upload via aaPanel File Manager
```

### **Passo 4: Configurar Variáveis de Ambiente**

```bash
# Criar arquivo .env
nano .env
```

**Conteúdo do .env:**
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://cbwpghrkfvczjqzefvix.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNid3BnaHJrZnZjempxemVmdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTM4ODMsImV4cCI6MjA2ODI4OTg4M30.DxGYGfC1Ge589yiPCQuC8EyMD_ium4NOpD8coYAtYz8

# DigitoPay Configuration
VITE_DIGITOPAY_CLIENT_ID=da0cdf6c-06dd-4e04-a046-abd00e8b43ed
VITE_DIGITOPAY_CLIENT_SECRET=3f58b8f4-e101-4076-a844-3a64c7915b1a
VITE_DIGITOPAY_WEBHOOK_SECRET=https://api.digitopayoficial.com.br/api

# Environment
NODE_ENV=production
```

### **Passo 5: Instalar Dependências e Build**

```bash
# Instalar dependências
npm install

# Build para produção
npm run build

# Verificar se o build foi criado
ls -la dist/
```

### **Passo 6: Configurar PM2**

```bash
# Criar arquivo ecosystem.config.js
nano ecosystem.config.js
```

**Conteúdo do ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'arbitrage-crypto-flow',
    script: 'npm',
    args: 'run preview',
    cwd: '/www/wwwroot/arbitrage-crypto-flow',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/www/wwwroot/arbitrage-crypto-flow/logs/err.log',
    out_file: '/www/wwwroot/arbitrage-crypto-flow/logs/out.log',
    log_file: '/www/wwwroot/arbitrage-crypto-flow/logs/combined.log',
    time: true
  }]
};
```

```bash
# Criar diretório de logs
mkdir -p logs

# Iniciar aplicação com PM2
pm2 start ecosystem.config.js

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar com o sistema
pm2 startup
```

### **Passo 7: Configurar Apache no aaPanel**

1. **Acesse aaPanel → Website**
2. **Clique em "Add Site"**
3. **Configure:**
   - **Domain:** seu-dominio.com (ou IP)
   - **Root Directory:** /www/wwwroot/arbitrage-crypto-flow/dist
   - **PHP Version:** None

4. **Após criar, edite o site:**
   - **Settings → Configuration**
   - **Substitua o conteúdo por:**

```apache
<VirtualHost *:80>
    ServerName seu-dominio.com
    ServerAlias www.seu-dominio.com
    DocumentRoot /www/wwwroot/arbitrage-crypto-flow/dist
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/arbitrage-error.log
    CustomLog ${APACHE_LOG_DIR}/arbitrage-access.log combined
    
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
    
    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "no-referrer-when-downgrade"
    
    # Handle React Router
    <Directory /www/wwwroot/arbitrage-crypto-flow/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Rewrite rules for React Router
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Cache static assets
    <IfModule mod_expires.c>
        ExpiresActive on
        ExpiresByType text/css "access plus 1 year"
        ExpiresByType application/javascript "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType image/jpg "access plus 1 year"
        ExpiresByType image/jpeg "access plus 1 year"
        ExpiresByType image/gif "access plus 1 year"
        ExpiresByType image/ico "access plus 1 year"
        ExpiresByType image/svg+xml "access plus 1 year"
    </IfModule>
    
    # API proxy (se necessário)
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3000/api/
    ProxyPassReverse /api/ http://localhost:3000/api/
</VirtualHost>
```

### **Passo 8: Habilitar Módulos Apache Necessários**

```bash
# Habilitar módulos necessários
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate
sudo a2enmod proxy
sudo a2enmod proxy_http

# Reiniciar Apache
sudo systemctl restart apache2
```

### **Passo 9: Configurar .htaccess**

Criar arquivo `/www/wwwroot/arbitrage-crypto-flow/dist/.htaccess`:

```apache
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
```

### **Passo 10: Configurar SSL/HTTPS**

1. **No aaPanel → Website → SSL**
2. **Escolha:**
   - **Let's Encrypt** (gratuito)
   - **Ou upload seu certificado**

### **Passo 11: Configurar Firewall**

```bash
# Abrir portas necessárias
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

## 🔧 Comandos Úteis

### **Gerenciar Aplicação**
```bash
# Ver status
pm2 status

# Reiniciar aplicação
pm2 restart arbitrage-crypto-flow

# Ver logs
pm2 logs arbitrage-crypto-flow

# Parar aplicação
pm2 stop arbitrage-crypto-flow

# Deletar aplicação
pm2 delete arbitrage-crypto-flow
```

### **Gerenciar Apache**
```bash
# Verificar status
sudo systemctl status apache2

# Reiniciar Apache
sudo systemctl restart apache2

# Ver logs
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/apache2/access.log

# Testar configuração
sudo apache2ctl configtest
```

### **Atualizar Aplicação**
```bash
cd /www/wwwroot/arbitrage-crypto-flow

# Pull das mudanças
git pull origin main

# Instalar dependências
npm install

# Build
npm run build

# Reiniciar PM2
pm2 restart arbitrage-crypto-flow

# Reiniciar Apache (se necessário)
sudo systemctl restart apache2
```

## 🚀 Deploy Automático com GitHub Actions

### **Criar .github/workflows/deploy-apache.yml:**

```yaml
name: Deploy to VPS with Apache

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        VITE_DIGITOPAY_CLIENT_ID: ${{ secrets.VITE_DIGITOPAY_CLIENT_ID }}
        VITE_DIGITOPAY_CLIENT_SECRET: ${{ secrets.VITE_DIGITOPAY_CLIENT_SECRET }}
        VITE_DIGITOPAY_WEBHOOK_SECRET: ${{ secrets.VITE_DIGITOPAY_WEBHOOK_SECRET }}
    
    - name: Deploy to VPS
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        script: |
          cd /www/wwwroot/arbitrage-crypto-flow
          git pull origin main
          npm install
          npm run build
          pm2 restart arbitrage-crypto-flow
          sudo systemctl restart apache2
```

## 🔍 Troubleshooting

### **Problema: Aplicação não inicia**
```bash
# Verificar logs
pm2 logs arbitrage-crypto-flow

# Verificar se a porta está em uso
netstat -tulpn | grep :3000

# Verificar permissões
ls -la /www/wwwroot/arbitrage-crypto-flow/
```

### **Problema: Apache não carrega**
```bash
# Testar configuração do Apache
sudo apache2ctl configtest

# Reiniciar Apache
sudo systemctl restart apache2

# Verificar logs
sudo tail -f /var/log/apache2/error.log
```

### **Problema: React Router não funciona**
```bash
# Verificar se o mod_rewrite está habilitado
sudo a2enmod rewrite
sudo systemctl restart apache2

# Verificar .htaccess
cat /www/wwwroot/arbitrage-crypto-flow/dist/.htaccess
```

### **Problema: SSL não funciona**
```bash
# Verificar certificado
openssl s_client -connect seu-dominio.com:443

# Renovar Let's Encrypt
certbot renew
```

## 📊 Monitoramento

### **Configurar Monitoramento no aaPanel:**
1. **Vá para "Monitor"**
2. **Configure alertas para:**
   - CPU > 80%
   - Memória > 80%
   - Disco > 90%

### **Configurar Uptime Monitor:**
- **UptimeRobot** (gratuito)
- **Pingdom**
- **StatusCake**

## 🎯 Checklist Final

- [ ] VPS configurado com aaPanel
- [ ] Node.js 18+ instalado
- [ ] Apache instalado e configurado
- [ ] Projeto clonado
- [ ] Variáveis de ambiente configuradas
- [ ] Build executado com sucesso
- [ ] PM2 configurado e rodando
- [ ] Apache configurado com VirtualHost
- [ ] Módulos Apache habilitados
- [ ] .htaccess configurado
- [ ] SSL/HTTPS configurado
- [ ] Firewall configurado
- [ ] Backup automático configurado
- [ ] Monitoramento ativo
- [ ] Deploy automático configurado (opcional)

## 🆘 Suporte

Se encontrar problemas:

1. **Verifique os logs** (PM2, Apache, Aplicação)
2. **Teste localmente** primeiro
3. **Verifique as configurações** do aaPanel
4. **Consulte a documentação** do Vite, React e Apache

**Sistema pronto para produção com Apache! 🚀** 