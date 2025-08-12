-- SCRIPT PARA TABELA DIGITOPAY_DEBUG COMPLETA
-- Estrutura original completa

-- TABELA DE DEBUG COMPLETA
CREATE TABLE IF NOT EXISTS public.digitopay_debug (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL, -- Tipo de operação (authenticate, createDeposit, etc.)
  payload jsonb NOT NULL, -- Dados completos da operação
  created_at timestamp with time zone DEFAULT now()
);

-- ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_digitopay_debug_tipo ON public.digitopay_debug(tipo);
CREATE INDEX IF NOT EXISTS idx_digitopay_debug_created_at ON public.digitopay_debug(created_at);

-- ROW LEVEL SECURITY
ALTER TABLE public.digitopay_debug ENABLE ROW LEVEL SECURITY;

-- POLICIES
-- Sistema pode inserir logs de debug
CREATE POLICY "System can insert digitopay debug logs" ON public.digitopay_debug
  FOR INSERT WITH CHECK (true);

-- Admins podem ver todos os logs
CREATE POLICY "Admins can view all digitopay debug logs" ON public.digitopay_debug
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- VERIFICAÇÃO
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'digitopay_debug'
ORDER BY ordinal_position; 