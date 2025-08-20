-- Ver quem é o sócio atual
SELECT email, display_name, commission_percentage, status, created_at 
FROM partners 
ORDER BY created_at DESC;

-- Verificar se você (usuário atual) é sócio
-- Primeiro vamos ver todos os profiles para identificar emails
SELECT email, display_name, role, created_at
FROM profiles 
WHERE role IN ('admin', 'partner')
ORDER BY created_at DESC;

-- Adicionar um sócio de teste se necessário (você pode me dizer seu email)
-- Por enquanto vou adicionar um exemplo
INSERT INTO partners (email, display_name, commission_percentage, status)
VALUES ('exemplo@teste.com', 'Usuário Teste', 1.00, 'active')
ON CONFLICT (email) DO NOTHING;

-- Verificar dados finais
SELECT email, display_name, commission_percentage, status, created_at 
FROM partners 
ORDER BY created_at DESC;