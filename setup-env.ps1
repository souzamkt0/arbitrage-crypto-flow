# Script para configurar o arquivo .env
Write-Host "Configurando arquivo .env para DigitoPay..." -ForegroundColor Green

# Conteúdo do arquivo .env
$envContent = @"
# Supabase Configuration
VITE_SUPABASE_URL=https://cbwpghrkfvczjqzefvix.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# DigitoPay Configuration
VITE_DIGITOPAY_CLIENT_ID=da0cdf6c-06dd-4e04-a046-abd00e8b43ed
VITE_DIGITOPAY_CLIENT_SECRET=3f58b8f4-e101-4076-a844-3a64c7915b1a
VITE_DIGITOPAY_WEBHOOK_SECRET=your_webhook_secret_here

# API Keys
VITE_NEWSDATA_API_KEY=pub_7d30bec4ab0045e59c9fc2e3836551ad
VITE_COINMARKETCAP_API_KEY=0f376f16-1d3f-4a3d-83fb-7b3731b1db3c

# Environment
NODE_ENV=development
"@

# Criar o arquivo .env
$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "Arquivo .env criado com sucesso!" -ForegroundColor Green
Write-Host "Credenciais do DigitoPay configuradas:" -ForegroundColor Yellow
Write-Host "   - Client ID: da0cdf6c-06dd-4e04-a046-abd00e8b43ed" -ForegroundColor Cyan
Write-Host "   - Client Secret: 3f58b8f4-e101-4076-a844-3a64c7915b1a" -ForegroundColor Cyan
Write-Host "   - Webhook Secret: your_webhook_secret_here (precisa configurar)" -ForegroundColor Red
Write-Host ""
Write-Host "O servidor deve reiniciar automaticamente..." -ForegroundColor Yellow
Write-Host "Acesse: http://localhost:8081/deposit" -ForegroundColor Green 