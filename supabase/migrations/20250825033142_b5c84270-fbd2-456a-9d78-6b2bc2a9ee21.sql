-- Criar trigger para ativar depósitos BNB20 automaticamente
CREATE TRIGGER trigger_auto_activate_bnb20_deposits
  AFTER UPDATE ON bnb20_transactions
  FOR EACH ROW
  EXECUTE FUNCTION auto_activate_bnb20_deposits();