-- TRIGGERS E FUNÇÕES AUXILIARES

-- 1. FUNÇÃO PARA ATUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. TRIGGERS PARA UPDATED_AT
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investment_plans_updated_at
  BEFORE UPDATE ON public.investment_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_investments_updated_at
  BEFORE UPDATE ON public.user_investments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_current_operations_updated_at
  BEFORE UPDATE ON public.current_operations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deposits_updated_at
  BEFORE UPDATE ON public.deposits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_withdrawals_updated_at
  BEFORE UPDATE ON public.withdrawals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_residual_earnings_updated_at
  BEFORE UPDATE ON public.residual_earnings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_connections_updated_at
  BEFORE UPDATE ON public.api_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- 4. TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. FUNÇÃO PARA ATUALIZAR CONTADORES DE POSTS
CREATE OR REPLACE FUNCTION public.update_post_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Atualizar contador de posts do usuário
    UPDATE public.profiles 
    SET posts_count = posts_count + 1 
    WHERE user_id = NEW.user_id;
    
    -- Se é uma resposta, atualizar contador de replies do post original
    IF NEW.reply_to_post_id IS NOT NULL THEN
      UPDATE public.community_posts 
      SET replies_count = replies_count + 1 
      WHERE id = NEW.reply_to_post_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar contador de posts do usuário
    UPDATE public.profiles 
    SET posts_count = posts_count - 1 
    WHERE user_id = OLD.user_id;
    
    -- Se era uma resposta, decrementar contador de replies do post original
    IF OLD.reply_to_post_id IS NOT NULL THEN
      UPDATE public.community_posts 
      SET replies_count = replies_count - 1 
      WHERE id = OLD.reply_to_post_id;
    END IF;
    
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. TRIGGER PARA CONTADORES DE POSTS
CREATE TRIGGER update_post_counters_trigger
  AFTER INSERT OR DELETE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_post_counters();

-- 7. FUNÇÃO PARA ATUALIZAR CONTADORES DE INTERAÇÕES
CREATE OR REPLACE FUNCTION public.update_interaction_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar contador baseado no tipo de interação
    IF NEW.type = 'like' THEN
      UPDATE public.community_posts 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.post_id;
    ELSIF NEW.type = 'retweet' THEN
      UPDATE public.community_posts 
      SET retweets_count = retweets_count + 1 
      WHERE id = NEW.post_id;
    ELSIF NEW.type = 'share' THEN
      UPDATE public.community_posts 
      SET shares_count = shares_count + 1 
      WHERE id = NEW.post_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar contador baseado no tipo de interação
    IF OLD.type = 'like' THEN
      UPDATE public.community_posts 
      SET likes_count = GREATEST(likes_count - 1, 0) 
      WHERE id = OLD.post_id;
    ELSIF OLD.type = 'retweet' THEN
      UPDATE public.community_posts 
      SET retweets_count = GREATEST(retweets_count - 1, 0) 
      WHERE id = OLD.post_id;
    ELSIF OLD.type = 'share' THEN
      UPDATE public.community_posts 
      SET shares_count = GREATEST(shares_count - 1, 0) 
      WHERE id = OLD.post_id;
    END IF;
    
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 8. TRIGGER PARA CONTADORES DE INTERAÇÕES
CREATE TRIGGER update_interaction_counters_trigger
  AFTER INSERT OR DELETE ON public.post_interactions
  FOR EACH ROW EXECUTE FUNCTION public.update_interaction_counters();

-- 9. FUNÇÃO PARA CALCULAR COMISSÕES DE INDICAÇÃO
CREATE OR REPLACE FUNCTION public.calculate_referral_commission(
  referred_user_id uuid,
  investment_amount decimal
)
RETURNS void AS $$
DECLARE
  referrer_record RECORD;
  commission_amount decimal;
BEGIN
  -- Buscar o indicador deste usuário
  SELECT r.referrer_id, r.commission_rate 
  INTO referrer_record
  FROM public.referrals r 
  WHERE r.referred_id = referred_user_id 
  AND r.status = 'active';
  
  IF referrer_record IS NOT NULL THEN
    -- Calcular comissão
    commission_amount := investment_amount * (referrer_record.commission_rate / 100);
    
    -- Atualizar saldo de indicação do indicador
    UPDATE public.profiles 
    SET referral_balance = referral_balance + commission_amount
    WHERE user_id = referrer_record.referrer_id;
    
    -- Atualizar total de comissão na tabela de referrals
    UPDATE public.referrals 
    SET total_commission = total_commission + commission_amount
    WHERE referrer_id = referrer_record.referrer_id 
    AND referred_id = referred_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 10. FUNÇÃO PARA CRIAR BAÚS DE TESOURO
CREATE OR REPLACE FUNCTION public.create_treasure_chests(
  user_id_param uuid,
  deposit_id_param uuid
)
RETURNS void AS $$
DECLARE
  i integer;
  prizes decimal[] := ARRAY[1, 2, 3, 5, 8, 10, 15, 20, 25, 30];
  random_prize decimal;
BEGIN
  -- Criar 3 baús para cada depósito qualificado
  FOR i IN 1..3 LOOP
    -- Escolher prêmio aleatório
    random_prize := prizes[1 + floor(random() * array_length(prizes, 1))];
    
    INSERT INTO public.treasure_chests (
      user_id, 
      deposit_id, 
      chest_number, 
      prize_amount
    ) VALUES (
      user_id_param, 
      deposit_id_param, 
      i, 
      random_prize
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;