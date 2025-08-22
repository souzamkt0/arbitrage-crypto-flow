-- Corrigir sistema de depósitos para trabalhar com USD
-- Primeiro remover o trigger, depois a função

DROP TRIGGER IF EXISTS activate_deposits_trigger ON digitopay_transactions;
DROP FUNCTION IF EXISTS auto_activate_deposits() CASCADE;

-- Recriar função corrigida para usar amount (USD)
CREATE OR REPLACE FUNCTION auto_activate_deposits()
RETURNS trigger AS $$
BEGIN
  -- Se o status mudou para 'completed' em digitopay_transactions
  IF OLD.status != 'completed' AND NEW.status = 'completed' AND NEW.type = 'deposit' THEN
    -- Atualizar saldo do usuário usando amount (USD)
    UPDATE profiles 
    SET balance = balance + NEW.amount
    WHERE user_id = NEW.user_id;
    
    -- Inserir registro na tabela deposits usando amount (USD)
    INSERT INTO deposits (
      user_id,
      amount_usd,
      amount_brl,
      type,
      status,
      holder_name,
      cpf,
      pix_code,
      exchange_rate
    ) VALUES (
      NEW.user_id,
      NEW.amount, -- USD
      NEW.amount_brl, -- BRL
      'pix',
      'paid',
      NEW.person_name,
      NEW.person_cpf,
      NEW.pix_code,
      CASE 
        WHEN NEW.amount > 0 THEN NEW.amount_brl / NEW.amount 
        ELSE 5.5 
      END
    );
    
    -- Log da ativação
    RAISE NOTICE 'Depósito ativado automaticamente: user_id=%, amount_usd=%, amount_brl=%', NEW.user_id, NEW.amount, NEW.amount_brl;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger novamente
CREATE TRIGGER activate_deposits_trigger
  AFTER UPDATE ON digitopay_transactions
  FOR EACH ROW
  EXECUTE FUNCTION auto_activate_deposits();