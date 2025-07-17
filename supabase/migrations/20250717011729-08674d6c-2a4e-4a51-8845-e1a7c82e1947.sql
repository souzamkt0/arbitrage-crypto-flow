-- ALPHABIT SYSTEM - BANCO DE DADOS COMPLETO

-- 1. PROFILES TABLE (Usuários) 
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  display_name text,
  email text,
  bio text,
  avatar text,
  verified boolean DEFAULT false,
  city text,
  state text,
  location text,
  whatsapp text,
  followers_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  posts_count integer DEFAULT 0,
  join_date text,
  last_login timestamp with time zone,
  api_connected boolean DEFAULT false,
  balance decimal(15,2) DEFAULT 0.00,
  referral_balance decimal(15,2) DEFAULT 0.00,
  residual_balance decimal(15,2) DEFAULT 0.00,
  total_profit decimal(15,2) DEFAULT 0.00,
  level integer DEFAULT 1,
  badge text DEFAULT 'Iniciante',
  earnings decimal(10,3) DEFAULT 0.000,
  monthly_earnings decimal(10,3) DEFAULT 0.000,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. INVESTMENT_PLANS TABLE (Planos de Investimento)
CREATE TABLE public.investment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  daily_rate decimal(5,3) NOT NULL,
  minimum_amount decimal(15,2) NOT NULL,
  maximum_amount decimal(15,2) NOT NULL,
  duration_days integer NOT NULL,
  description text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. USER_INVESTMENTS TABLE (Investimentos dos Usuários)
CREATE TABLE public.user_investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_plan_id uuid NOT NULL REFERENCES public.investment_plans(id),
  amount decimal(15,2) NOT NULL,
  daily_rate decimal(5,3) NOT NULL,
  start_date timestamp with time zone DEFAULT now(),
  end_date timestamp with time zone NOT NULL,
  total_earned decimal(15,2) DEFAULT 0.00,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  days_remaining integer,
  current_day_progress integer DEFAULT 0,
  today_earnings decimal(15,2) DEFAULT 0.00,
  daily_target decimal(15,2) NOT NULL,
  operations_completed integer DEFAULT 0,
  total_operations integer DEFAULT 15,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. CURRENT_OPERATIONS TABLE (Operações em Tempo Real)
CREATE TABLE public.current_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_investment_id uuid NOT NULL REFERENCES public.user_investments(id) ON DELETE CASCADE,
  pair text NOT NULL,
  buy_price decimal(15,8) NOT NULL,
  sell_price decimal(15,8) NOT NULL,
  profit decimal(15,2) NOT NULL,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  time_remaining integer DEFAULT 60,
  status text DEFAULT 'executing' CHECK (status IN ('executing', 'completed')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 5. DEPOSITS TABLE (Depósitos)
CREATE TABLE public.deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_usd decimal(15,2) NOT NULL,
  amount_brl decimal(15,2),
  type text NOT NULL CHECK (type IN ('pix', 'usdt_bnb20')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'rejected', 'processing')),
  holder_name text,
  cpf text,
  sender_name text,
  pix_code text,
  wallet_address text,
  exchange_rate decimal(8,4),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 6. WITHDRAWALS TABLE (Saques)
CREATE TABLE public.withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_usd decimal(15,2) NOT NULL,
  amount_brl decimal(15,2),
  type text NOT NULL CHECK (type IN ('pix', 'usdt_bnb20')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed')),
  holder_name text,
  cpf text,
  pix_key_type text CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
  pix_key text,
  wallet_address text,
  fee decimal(15,2) NOT NULL DEFAULT 0.00,
  net_amount decimal(15,2) NOT NULL,
  exchange_rate decimal(8,4),
  processing_date timestamp with time zone,
  completed_date timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 7. TRADING_HISTORY TABLE (Histórico de Operações)
CREATE TABLE public.trading_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_id text NOT NULL,
  pair text NOT NULL,
  type text DEFAULT 'arbitrage' CHECK (type IN ('arbitrage', 'scalping', 'swing', 'grid')),
  strategy text,
  buy_price decimal(15,8) NOT NULL,
  sell_price decimal(15,8) NOT NULL,
  amount decimal(15,8) NOT NULL,
  profit decimal(15,2) NOT NULL,
  profit_percent decimal(8,4) NOT NULL,
  status text DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'cancelled')),
  exchange_1 text DEFAULT 'Binance Spot',
  exchange_2 text DEFAULT 'Binance Futures',
  execution_time integer, -- em segundos
  created_at timestamp with time zone DEFAULT now()
);

-- 8. REFERRALS TABLE (Sistema de Indicações)
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  commission_rate decimal(5,2) DEFAULT 5.00,
  total_commission decimal(15,2) DEFAULT 0.00,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

-- 9. RESIDUAL_EARNINGS TABLE (Ganhos Residuais)
CREATE TABLE public.residual_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_id uuid REFERENCES public.user_investments(id),
  amount decimal(15,2) NOT NULL,
  percentage decimal(5,2) NOT NULL,
  level integer NOT NULL, -- nível na rede (1=direto, 2=segundo nível, etc)
  type text DEFAULT 'investment' CHECK (type IN ('investment', 'trading', 'bonus')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 10. COMMUNITY_POSTS TABLE (Posts da Comunidade)
CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  likes_count integer DEFAULT 0,
  retweets_count integer DEFAULT 0,
  replies_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  hashtags text[],
  mentions text[],
  reply_to_post_id uuid REFERENCES public.community_posts(id),
  reply_to_username text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 11. POST_INTERACTIONS TABLE (Interações com Posts)
CREATE TABLE public.post_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('like', 'retweet', 'share')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, post_id, type)
);

-- 12. TREASURE_CHESTS TABLE (Baús de Tesouro)
CREATE TABLE public.treasure_chests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deposit_id uuid REFERENCES public.deposits(id),
  chest_number integer NOT NULL CHECK (chest_number BETWEEN 1 AND 3),
  prize_amount decimal(15,2) NOT NULL,
  opened boolean DEFAULT false,
  opened_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- 13. ADMIN_SETTINGS TABLE (Configurações do Admin)
CREATE TABLE public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 14. API_CONNECTIONS TABLE (Conexões de API)
CREATE TABLE public.api_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_provider text NOT NULL CHECK (api_provider IN ('binance', 'okx', 'bybit')),
  api_key_encrypted text NOT NULL,
  secret_key_encrypted text NOT NULL,
  is_active boolean DEFAULT true,
  test_connection_status text DEFAULT 'pending' CHECK (test_connection_status IN ('pending', 'success', 'failed')),
  last_test_at timestamp with time zone,
  permissions jsonb, -- permissões da API
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 15. MARKET_DATA TABLE (Dados de Mercado)
CREATE TABLE public.market_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  price decimal(15,8) NOT NULL,
  volume_24h decimal(20,8),
  change_24h decimal(8,4),
  high_24h decimal(15,8),
  low_24h decimal(15,8),
  market_cap decimal(20,2),
  rank integer,
  data_source text DEFAULT 'coinmarketcap',
  created_at timestamp with time zone DEFAULT now()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.current_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residual_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treasure_chests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;