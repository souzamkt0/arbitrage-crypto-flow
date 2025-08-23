-- Habilitar RLS na tabela withdrawals
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Verificar políticas existentes para withdrawals
SELECT policyname, cmd, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'withdrawals' 
ORDER BY policyname;

-- Criar política para visualização se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'withdrawals' 
        AND policyname = 'Users can view their own withdrawals'
    ) THEN
        CREATE POLICY "Users can view their own withdrawals" ON withdrawals
        FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;
END $$;