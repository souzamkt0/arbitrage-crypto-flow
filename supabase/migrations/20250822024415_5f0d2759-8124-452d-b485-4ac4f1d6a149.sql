-- Melhorar RLS para admin ver todas as transações
-- Adicionar política para admins verem todas as transações

-- Permitir que admins vejam todos os dados da tabela digitopay_transactions
DROP POLICY IF EXISTS "Admins can view all digitopay transactions" ON digitopay_transactions;
CREATE POLICY "Admins can view all digitopay transactions" 
ON digitopay_transactions 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Permitir que admins atualizem transações digitopay
DROP POLICY IF EXISTS "Admins can update digitopay transactions" ON digitopay_transactions;
CREATE POLICY "Admins can update digitopay transactions"
ON digitopay_transactions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Garantir que admins podem ver todos os depósitos
DROP POLICY IF EXISTS "Admins have full control over deposits" ON deposits;
CREATE POLICY "Admins have full control over deposits"
ON deposits
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Função para ativar automaticamente depósitos aprovados
CREATE OR REPLACE FUNCTION auto_activate_deposits()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status mudou para 'completed' em digitopay_transactions
  IF OLD.status != 'completed' AND NEW.status = 'completed' AND NEW.type = 'deposit' THEN
    -- Atualizar saldo do usuário
    UPDATE profiles 
    SET balance = balance + NEW.amount_brl
    WHERE user_id = NEW.user_id;
    
    -- Log da ativação
    RAISE NOTICE 'Depósito ativado automaticamente: user_id=%, amount=%', NEW.user_id, NEW.amount_brl;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para ativação automática
DROP TRIGGER IF EXISTS auto_activate_deposits_trigger ON digitopay_transactions;
CREATE TRIGGER auto_activate_deposits_trigger
  AFTER UPDATE ON digitopay_transactions
  FOR EACH ROW
  EXECUTE FUNCTION auto_activate_deposits();