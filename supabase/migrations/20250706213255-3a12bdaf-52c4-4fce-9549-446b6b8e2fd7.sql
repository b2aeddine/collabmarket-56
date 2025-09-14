
-- Créer la table profile_categories pour lier les profils aux catégories
CREATE TABLE public.profile_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(profile_id, category_id)
);

-- Activer RLS sur la table profile_categories
ALTER TABLE public.profile_categories ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tout le monde de voir les catégories des profils
CREATE POLICY "Anyone can view profile categories" 
  ON public.profile_categories 
  FOR SELECT 
  USING (true);

-- Politique pour permettre aux utilisateurs de gérer leurs propres catégories
CREATE POLICY "Users can manage their own profile categories" 
  ON public.profile_categories 
  FOR ALL 
  USING (profile_id = auth.uid());
