-- Corrigir problema crítico de RLS não habilitado
-- Verificar e habilitar RLS em todas as tabelas que precisam

-- Habilitar RLS nas tabelas que ainda não têm
ALTER TABLE IF EXISTS current_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS market_data ENABLE ROW LEVEL SECURITY;  
ALTER TABLE IF EXISTS investment_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS social_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS treasure_chests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS trading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS partner_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS partner_withdrawals ENABLE ROW LEVEL SECURITY;

-- Verificar se todas as tabelas críticas têm RLS habilitado
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'webhook_logs'
  ) THEN
    CREATE TABLE webhook_logs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      provider TEXT NOT NULL,
      event_type TEXT NOT NULL,
      external_id TEXT,
      payload JSONB,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
    
    -- Política para logs de webhook (só admins podem ver)
    CREATE POLICY "Admins can view webhook logs" ON webhook_logs
      FOR SELECT USING (is_admin(auth.uid()));
      
    CREATE POLICY "System can insert webhook logs" ON webhook_logs  
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;