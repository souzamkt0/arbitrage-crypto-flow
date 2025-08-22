-- Remover tabelas relacionadas à comunidade
DROP TABLE IF EXISTS post_interactions CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS custom_users CASCADE;

-- Remover tabelas relacionadas ao Facebook/Social (se não estiverem sendo usadas)
DROP TABLE IF EXISTS facebook_activities CASCADE;
DROP TABLE IF EXISTS facebook_albums CASCADE;
DROP TABLE IF EXISTS facebook_comments CASCADE;
DROP TABLE IF EXISTS facebook_friendships CASCADE;
DROP TABLE IF EXISTS facebook_likes CASCADE;
DROP TABLE IF EXISTS facebook_notifications CASCADE;
DROP TABLE IF EXISTS facebook_photos CASCADE;
DROP TABLE IF EXISTS facebook_posts CASCADE;
DROP TABLE IF EXISTS facebook_profiles CASCADE;
DROP TABLE IF EXISTS facebook_shares CASCADE;
DROP TABLE IF EXISTS social_comments CASCADE;
DROP TABLE IF EXISTS social_follows CASCADE;