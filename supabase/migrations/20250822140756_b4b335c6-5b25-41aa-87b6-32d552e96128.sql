-- Função para calcular saldo disponível para saque
CREATE OR REPLACE FUNCTION public.calculate_available_withdrawal_balance(user_id_param uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_balance NUMERIC := 0;
    pending_withdrawals NUMERIC := 0;
    available_balance NUMERIC := 0;
BEGIN
    -- Buscar saldo atual do usuário
    SELECT COALESCE(balance, 0) INTO current_balance
    FROM profiles 
    WHERE user_id = user_id_param;
    
    -- Calcular total de saques pendentes
    SELECT COALESCE(SUM(amount_usd), 0) INTO pending_withdrawals
    FROM withdrawals 
    WHERE user_id = user_id_param 
    AND status IN ('pending', 'processing');
    
    -- Calcular saldo disponível (saldo atual - saques pendentes)
    available_balance := current_balance - pending_withdrawals;
    
    -- Garantir que não seja negativo
    IF available_balance < 0 THEN
        available_balance := 0;
    END IF;
    
    RETURN available_balance;
END;
$$;

-- Função para sincronizar saldo de saque de um usuário específico
CREATE OR REPLACE FUNCTION public.sync_user_withdrawal_balance(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    available_balance NUMERIC;
    user_email TEXT;
    result JSON;
BEGIN
    -- Verificar se o usuário existe
    SELECT email INTO user_email
    FROM profiles 
    WHERE user_id = target_user_id;
    
    IF user_email IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Usuário não encontrado'
        );
    END IF;
    
    -- Calcular saldo disponível
    SELECT calculate_available_withdrawal_balance(target_user_id) INTO available_balance;
    
    -- Atualizar campo withdrawal_balance se existir, ou usar o balance atual
    UPDATE profiles 
    SET updated_at = NOW()
    WHERE user_id = target_user_id;
    
    RETURN json_build_object(
        'success', true,
        'user_email', user_email,
        'total_balance', (SELECT balance FROM profiles WHERE user_id = target_user_id),
        'available_withdrawal_balance', available_balance,
        'pending_withdrawals', (
            SELECT COALESCE(SUM(amount_usd), 0) 
            FROM withdrawals 
            WHERE user_id = target_user_id 
            AND status IN ('pending', 'processing')
        ),
        'message', 'Saldo de saque sincronizado com sucesso'
    );
END;
$$;

-- Função para sincronizar todos os saldos de saque (apenas admins)
CREATE OR REPLACE FUNCTION public.sync_all_withdrawal_balances()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    users_count INTEGER := 0;
    result JSON;
BEGIN
    -- Verificar se é admin
    IF NOT is_admin(auth.uid()) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Apenas administradores podem sincronizar todos os saldos'
        );
    END IF;
    
    -- Contar usuários processados
    SELECT COUNT(*) INTO users_count
    FROM profiles;
    
    -- Atualizar todos os profiles (trigger de updated_at)
    UPDATE profiles 
    SET updated_at = NOW()
    WHERE status = 'active';
    
    RETURN json_build_object(
        'success', true,
        'message', 'Todos os saldos de saque foram sincronizados',
        'users_processed', users_count,
        'synchronized_at', NOW()
    );
END;
$$;