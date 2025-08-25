-- Função para ativar depósitos BNB20 automaticamente
CREATE OR REPLACE FUNCTION public.auto_activate_bnb20_deposits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Se o status mudou para 'finished' em bnb20_transactions e é depósito
  IF OLD.status != 'finished' AND NEW.status = 'finished' AND NEW.type = 'deposit' THEN
    -- Atualizar saldo do usuário
    UPDATE profiles 
    SET balance = COALESCE(balance, 0) + NEW.amount_usd
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;