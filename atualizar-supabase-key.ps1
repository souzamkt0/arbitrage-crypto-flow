# Script para atualizar a Supabase anon key
Write-Host "Configurando Supabase anon key..." -ForegroundColor Green

Write-Host ""
Write-Host "INSTRUCOES:" -ForegroundColor Yellow
Write-Host "1. Acesse: https://supabase.com" -ForegroundColor Cyan
Write-Host "2. Clique no seu projeto" -ForegroundColor Cyan
Write-Host "3. Settings -> API" -ForegroundColor Cyan
Write-Host "4. Copie a 'anon public' key" -ForegroundColor Cyan
Write-Host "5. Cole abaixo quando solicitado" -ForegroundColor Cyan
Write-Host ""

# Solicitar a anon key
$anonKey = Read-Host "Cole a Supabase anon key aqui"

if ($anonKey -and $anonKey -ne "") {
    # Ler o arquivo .env atual
    $envContent = Get-Content ".env" -Raw
    
    # Substituir a anon key
    $envContent = $envContent -replace "VITE_SUPABASE_ANON_KEY=.*", "VITE_SUPABASE_ANON_KEY=$anonKey"
    
    # Salvar o arquivo atualizado
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    
    Write-Host ""
    Write-Host "Supabase anon key configurada com sucesso!" -ForegroundColor Green
    Write-Host "O servidor deve reiniciar automaticamente..." -ForegroundColor Yellow
    Write-Host "Teste a pagina: http://localhost:8081/deposit" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Nenhuma chave foi fornecida!" -ForegroundColor Red
    Write-Host "Execute o script novamente e cole a anon key." -ForegroundColor Yellow
} 