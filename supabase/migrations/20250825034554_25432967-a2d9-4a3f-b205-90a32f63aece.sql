-- CORREÇÃO CRÍTICA: Remover políticas inseguras que permitem acesso total
-- 1. Corrigir política "System can manage current operations" que permite acesso total

-- Remover política insegura
DROP POLICY IF EXISTS "System can manage current operations" ON current_operations;

-- Criar política mais segura para current_operations
CREATE POLICY "Users can view their own current operations" 
ON current_operations FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_investments ui 
  WHERE ui.id = current_operations.user_investment_id 
  AND ui.user_id = auth.uid()
));

CREATE POLICY "System can insert current operations" 
ON current_operations FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update current operations" 
ON current_operations FOR UPDATE 
USING (true);

-- 2. Corrigir política "Anyone can view daily market rates" - muito permissiva
DROP POLICY IF EXISTS "Anyone can view daily market rates" ON daily_market_rates;

CREATE POLICY "Authenticated users can view daily market rates" 
ON daily_market_rates FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 3. Corrigir política "System can manage market data" - muito permissiva  
DROP POLICY IF EXISTS "System can manage market data" ON market_data;

CREATE POLICY "Authenticated users can view market data" 
ON market_data FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert market data" 
ON market_data FOR INSERT 
WITH CHECK (true);