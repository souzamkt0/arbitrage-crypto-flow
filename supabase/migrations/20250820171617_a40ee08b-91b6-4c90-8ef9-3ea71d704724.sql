-- Atualizar referral_code para ser igual ao username quando não existir ou for diferente
UPDATE profiles 
SET referral_code = username 
WHERE referral_code IS NULL 
   OR referral_code != username
   OR referral_code LIKE '%_%';