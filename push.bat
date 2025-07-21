@echo off
echo Enviando modificacoes para o GitHub...
git add .
git status
set /p message="Digite a mensagem do commit: "
git commit -m "%message%"
git push origin main
echo Modificacoes enviadas com sucesso!
pause