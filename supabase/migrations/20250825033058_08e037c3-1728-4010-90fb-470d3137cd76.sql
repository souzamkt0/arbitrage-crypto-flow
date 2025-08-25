-- Criar trigger para ativar depósitos BNB20 automaticamente
CREATE OR REPLACE FUNCTION public.auto_activate_bnb20_deposits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Se o status mudou para 'finished' em bnb20_transactions
  IF OLD.status != 'finished' AND NEW.status = 'finished' AND NEW.type = 'deposit' THEN
    -- Atualizar saldo do usuário
    UPDATE profiles 
    SET balance = balance + NEW.amount_usd
    WHERE user_id = NEW.user_id;
    
    -- Log da ativação
    RAISE NOTICE 'Depósito BNB20 ativado automaticamente: user_id=%, amount_usd=%', NEW.user_id, NEW.amount_usd;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar trigger na tabela bnb20_transactions
DROP TRIGGER IF EXISTS trigger_auto_activate_bnb20_deposits ON bnb20_transactions;
CREATE TRIGGER trigger_auto_activate_bnb20_deposits
  AFTER UPDATE ON bnb20_transactions
  FOR EACH ROW
  EXECUTE FUNCTION auto_activate_bnb20_deposits();