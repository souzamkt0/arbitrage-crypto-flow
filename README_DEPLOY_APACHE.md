# 🚀 Deploy no VPS com aaPanel + Apache

## 📋 Resumo Rápido

Este guia te ajudará a fazer o deploy do sistema de arbitragem crypto no seu VPS usando aaPanel com Apache.

## 🛠️ Passos Rápidos

### 1. **Preparar o VPS**
```bash
# Conectar no VPS via SSH
ssh root@SEU_IP_VPS

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2
```

### 2. **Configurar aaPanel**
1. Acesse `http://SEU_IP:8888`
2. Vá em **Software Store**
3. Instale **Apache** e **Git**

### 3. **Deploy Automatizado**
```bash
# Fazer upload do script para o VPS
# Ou copiar o conteúdo do deploy-apache.sh

# Executar o script
chmod +x deploy-apache.sh
./deploy-apache.sh
```

### 4. **Configurar Site no aaPanel**
1. **Website → Add Site**
2. **Domain:** seu-dominio.com
3. **Root Directory:** `/www/wwwroot/arbitrage-crypto-flow/dist`
4. **PHP Version:** None

### 5. **Configurar SSL**
1. **Website → SSL**
2. Escolha **Let's Encrypt**

## 📁 Arquivos Importantes

- `deploy-apache.sh` - Script de deploy automatizado
- `apache-vhost.conf` - Configuração de exemplo do VirtualHost
- `DEPLOY_VPS_APACHE.md` - Guia completo detalhado

## 🔧 Comandos Úteis

### **Gerenciar Aplicação**
```bash
# Ver status
pm2 status

# Reiniciar
pm2 restart arbitrage-crypto-flow

# Ver logs
pm2 logs arbitrage-crypto-flow
```

### **Gerenciar Apache**
```bash
# Reiniciar Apache
sudo systemctl restart apache2

# Ver logs
sudo tail -f /var/log/apache2/error.log
```

### **Atualizar Aplicação**
```bash
cd /www/wwwroot/arbitrage-crypto-flow
git pull origin main
npm install
npm run build
pm2 restart arbitrage-crypto-flow
```

## 🌐 URLs Importantes

- **Aplicação:** `http://SEU_IP:3000` (desenvolvimento)
- **Site:** `http://seu-dominio.com` (produção)
- **aaPanel:** `http://SEU_IP:8888`

## 🔍 Troubleshooting

### **Problema: Aplicação não carrega**
```bash
# Verificar se está rodando
pm2 status

# Verificar logs
pm2 logs arbitrage-crypto-flow

# Verificar porta
netstat -tulpn | grep :3000
```

### **Problema: Apache não funciona**
```bash
# Verificar status
sudo systemctl status apache2

# Verificar configuração
sudo apache2ctl configtest

# Verificar logs
sudo tail -f /var/log/apache2/error.log
```

### **Problema: React Router não funciona**
```bash
# Verificar se mod_rewrite está ativo
sudo a2enmod rewrite
sudo systemctl restart apache2

# Verificar .htaccess
cat /www/wwwroot/arbitrage-crypto-flow/dist/.htaccess
```

## 📊 Monitoramento

### **Configurar no aaPanel:**
1. **Monitor → Alertas**
2. Configure alertas para CPU, Memória e Disco

### **Uptime Monitor:**
- **UptimeRobot** (gratuito)
- Configure para monitorar seu domínio

## 🔒 Segurança

### **Firewall**
```bash
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

### **SSL/HTTPS**
- Configure Let's Encrypt no aaPanel
- Force HTTPS redirect

## 📈 Performance

### **Otimizações Apache:**
- Gzip compression habilitado
- Cache de assets estáticos
- Headers de segurança configurados

### **Otimizações PM2:**
- Auto-restart em caso de erro
- Limite de memória configurado
- Logs organizados

## 🆘 Suporte

Se encontrar problemas:

1. **Verifique os logs** primeiro
2. **Teste localmente** antes do deploy
3. **Consulte a documentação** completa em `DEPLOY_VPS_APACHE.md`
4. **Verifique as configurações** do aaPanel

## 🎯 Checklist Final

- [ ] VPS configurado
- [ ] aaPanel instalado
- [ ] Apache instalado
- [ ] Node.js 18+ instalado
- [ ] Script de deploy executado
- [ ] Site configurado no aaPanel
- [ ] SSL configurado
- [ ] Firewall configurado
- [ ] Monitoramento ativo

**Sistema pronto para produção! 🚀** 