
-- Supprimer la table social_accounts qui est utilisée pour OAuth
DROP TABLE IF EXISTS public.social_accounts CASCADE;

-- Supprimer les colonnes OAuth inutiles de la table social_links si elles existent
ALTER TABLE public.social_links 
DROP COLUMN IF EXISTS social_account_id,
DROP COLUMN IF EXISTS is_connected,
DROP COLUMN IF EXISTS access_token,
DROP COLUMN IF EXISTS refresh_token,
DROP COLUMN IF EXISTS expires_at;

-- Supprimer les triggers ou fonctions liés à OAuth s'ils existent
DROP FUNCTION IF EXISTS public.sync_social_analytics(uuid);

-- Nettoyer les policies RLS qui pourraient référencer des données OAuth
DROP POLICY IF EXISTS "Anyone can view social accounts" ON public.social_accounts;
DROP POLICY IF EXISTS "Users can manage their own social accounts" ON public.social_accounts;
