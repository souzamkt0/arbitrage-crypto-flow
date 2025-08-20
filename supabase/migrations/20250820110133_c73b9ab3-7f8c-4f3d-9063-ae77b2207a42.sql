-- Habilitar RLS na tabela partners e criar políticas corretas
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Admins can view all partners" ON partners;
DROP POLICY IF EXISTS "Admins can insert partners" ON partners;
DROP POLICY IF EXISTS "Admins can update partners" ON partners;
DROP POLICY IF EXISTS "Admins can delete partners" ON partners;

-- Criar política para que qualquer usuário autenticado possa ver os dados de sócios
-- Isso é necessário para que o PartnerStatusBanner funcione
CREATE POLICY "Anyone authenticated can view partners" ON partners
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Admins podem gerenciar sócios
CREATE POLICY "Admins can manage partners" ON partners
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Sócios podem ver seus próprios dados
CREATE POLICY "Partners can view own data" ON partners
    FOR SELECT 
    USING (user_id = auth.uid());

-- Verificar se há dados na tabela partners
SELECT email, display_name, commission_percentage, status, created_at 
FROM partners 
ORDER BY created_at DESC;

-- Verificar se o admin Souza existe como sócio
SELECT p.email, p.display_name, pr.role, pt.commission_percentage, pt.status
FROM profiles pr
LEFT JOIN partners pt ON pr.email = pt.email
WHERE pr.email = 'souzamkt0@gmail.com';