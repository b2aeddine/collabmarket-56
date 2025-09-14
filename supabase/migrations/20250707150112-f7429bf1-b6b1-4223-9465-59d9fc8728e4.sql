
-- Ajouter des champs pour le partage de profil dans la table profiles
ALTER TABLE public.profiles 
ADD COLUMN custom_username TEXT UNIQUE,
ADD COLUMN is_profile_public BOOLEAN DEFAULT false,
ADD COLUMN profile_share_count INTEGER DEFAULT 0;

-- Créer un index pour optimiser les recherches par custom_username
CREATE INDEX idx_profiles_custom_username ON public.profiles(custom_username) WHERE custom_username IS NOT NULL;

-- Ajouter une contrainte pour s'assurer que custom_username respecte un format spécifique
ALTER TABLE public.profiles 
ADD CONSTRAINT custom_username_format 
CHECK (custom_username ~ '^[a-zA-Z0-9_]{3,30}$');
