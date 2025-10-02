-- Supprimer l'ancienne policy qui bloquait l'accès
DROP POLICY IF EXISTS "Users can view public profiles with limited data" ON public.profiles;

-- Créer une nouvelle policy qui permet aux utilisateurs authentifiés de voir les profils publics des influenceurs
CREATE POLICY "Authenticated users can view public influencer profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (role = 'influenceur' AND is_profile_public = true AND is_banned = false AND is_verified = true)
  OR (auth.uid() = id)
  OR is_current_user_admin()
);