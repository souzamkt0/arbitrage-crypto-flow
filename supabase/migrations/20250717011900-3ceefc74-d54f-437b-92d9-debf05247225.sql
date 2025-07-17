-- RLS POLICIES PARA TODAS AS TABELAS

-- FUNÇÃO AUXILIAR PARA VERIFICAR SE É ADMIN
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = $1 AND role = 'admin'
  );
$$;

-- 1. PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- 2. INVESTMENT_PLANS POLICIES
CREATE POLICY "Anyone can view active investment plans"
  ON public.investment_plans FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage investment plans"
  ON public.investment_plans FOR ALL
  USING (public.is_admin(auth.uid()));

-- 3. USER_INVESTMENTS POLICIES
CREATE POLICY "Users can view their own investments"
  ON public.user_investments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own investments"
  ON public.user_investments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments"
  ON public.user_investments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all investments"
  ON public.user_investments FOR SELECT
  USING (public.is_admin(auth.uid()));

-- 4. CURRENT_OPERATIONS POLICIES
CREATE POLICY "Users can view operations of their investments"
  ON public.current_operations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_investments ui
      WHERE ui.id = user_investment_id AND ui.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage current operations"
  ON public.current_operations FOR ALL
  USING (true);

-- 5. DEPOSITS POLICIES
CREATE POLICY "Users can view their own deposits"
  ON public.deposits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deposits"
  ON public.deposits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all deposits"
  ON public.deposits FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update deposit status"
  ON public.deposits FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- 6. WITHDRAWALS POLICIES
CREATE POLICY "Users can view their own withdrawals"
  ON public.withdrawals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdrawals"
  ON public.withdrawals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawals"
  ON public.withdrawals FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update withdrawal status"
  ON public.withdrawals FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- 7. TRADING_HISTORY POLICIES
CREATE POLICY "Users can view their own trading history"
  ON public.trading_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert trading history"
  ON public.trading_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all trading history"
  ON public.trading_history FOR SELECT
  USING (public.is_admin(auth.uid()));

-- 8. REFERRALS POLICIES
CREATE POLICY "Users can view their referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "System can create referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can update their referral data"
  ON public.referrals FOR UPDATE
  USING (auth.uid() = referrer_id);

-- 9. RESIDUAL_EARNINGS POLICIES
CREATE POLICY "Users can view their residual earnings"
  ON public.residual_earnings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create residual earnings"
  ON public.residual_earnings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all residual earnings"
  ON public.residual_earnings FOR SELECT
  USING (public.is_admin(auth.uid()));

-- 10. COMMUNITY_POSTS POLICIES
CREATE POLICY "Anyone can view community posts"
  ON public.community_posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.community_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.community_posts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all posts"
  ON public.community_posts FOR ALL
  USING (public.is_admin(auth.uid()));

-- 11. POST_INTERACTIONS POLICIES
CREATE POLICY "Users can view post interactions"
  ON public.post_interactions FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own interactions"
  ON public.post_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions"
  ON public.post_interactions FOR DELETE
  USING (auth.uid() = user_id);

-- 12. TREASURE_CHESTS POLICIES
CREATE POLICY "Users can view their own treasure chests"
  ON public.treasure_chests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own treasure chests"
  ON public.treasure_chests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create treasure chests"
  ON public.treasure_chests FOR INSERT
  WITH CHECK (true);

-- 13. ADMIN_SETTINGS POLICIES
CREATE POLICY "Admins can view admin settings"
  ON public.admin_settings FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage admin settings"
  ON public.admin_settings FOR ALL
  USING (public.is_admin(auth.uid()));

-- 14. API_CONNECTIONS POLICIES
CREATE POLICY "Users can view their own API connections"
  ON public.api_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own API connections"
  ON public.api_connections FOR ALL
  USING (auth.uid() = user_id);

-- 15. MARKET_DATA POLICIES
CREATE POLICY "Anyone can view market data"
  ON public.market_data FOR SELECT
  USING (true);

CREATE POLICY "System can manage market data"
  ON public.market_data FOR ALL
  USING (true);