-- CORRIGIR CONTROLE TOTAL DO ADMIN - POLÍTICAS RLS COMPLETAS

-- 1. Criar políticas para tabelas sem RLS
-- Facebook Activities
ALTER TABLE facebook_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all facebook activities" ON facebook_activities 
FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can view public facebook activities" ON facebook_activities 
FOR SELECT USING (privacy = 'public' OR user_id = auth.uid());

-- Facebook Albums  
ALTER TABLE facebook_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all facebook albums" ON facebook_albums 
FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can view public facebook albums" ON facebook_albums 
FOR SELECT USING (privacy = 'public' OR owner_id = auth.uid());

-- Facebook Friendships
ALTER TABLE facebook_friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all facebook friendships" ON facebook_friendships 
FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can manage their own facebook friendships" ON facebook_friendships 
FOR ALL USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Facebook Notifications
ALTER TABLE facebook_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all facebook notifications" ON facebook_notifications 
FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can view their own facebook notifications" ON facebook_notifications 
FOR SELECT USING (recipient_id = auth.uid());

-- Facebook Photos
ALTER TABLE facebook_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all facebook photos" ON facebook_photos 
FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can view public facebook photos" ON facebook_photos 
FOR SELECT USING (true);

-- Facebook Shares
ALTER TABLE facebook_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all facebook shares" ON facebook_shares 
FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can manage their own facebook shares" ON facebook_shares 
FOR ALL USING (user_id = auth.uid());

-- Partner Withdrawals
ALTER TABLE partner_withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage all partner withdrawals" ON partner_withdrawals 
FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Partners can view their own withdrawals" ON partner_withdrawals 
FOR SELECT USING (partner_id = auth.uid());

-- Social Shares
CREATE POLICY "Admins can manage all social shares" ON social_shares 
FOR ALL USING (is_admin(auth.uid()));

-- 2. GARANTIR CONTROLE TOTAL DO ADMIN EM TODAS AS TABELAS CRÍTICAS

-- Atualizar políticas de profiles para controle total do admin
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins have full control over profiles" ON profiles 
FOR ALL USING (is_admin(auth.uid()));

-- Atualizar políticas de user_investments para controle total do admin
DROP POLICY IF EXISTS "Admins can view all user investments" ON user_investments;
CREATE POLICY "Admins have full control over user_investments" ON user_investments 
FOR ALL USING (is_admin(auth.uid()));

-- Atualizar políticas de deposits para controle total do admin
DROP POLICY IF EXISTS "Admins can view all deposits" ON deposits;
DROP POLICY IF EXISTS "Admins can update deposit status" ON deposits;
CREATE POLICY "Admins have full control over deposits" ON deposits 
FOR ALL USING (is_admin(auth.uid()));

-- Atualizar políticas de withdrawals para controle total do admin  
DROP POLICY IF EXISTS "Admins can view all withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Admins can update withdrawal status" ON withdrawals;
CREATE POLICY "Admins have full control over withdrawals" ON withdrawals 
FOR ALL USING (is_admin(auth.uid()));

-- Garantir que digitopay_transactions tenha controle total do admin
CREATE POLICY "Admins have full control over digitopay_transactions" ON digitopay_transactions 
FOR ALL USING (is_admin(auth.uid()));