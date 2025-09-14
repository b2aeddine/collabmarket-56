-- Supprimer l'ancienne contrainte
ALTER TABLE social_links DROP CONSTRAINT social_links_platform_check;

-- Ajouter la nouvelle contrainte avec snapchat et x
ALTER TABLE social_links ADD CONSTRAINT social_links_platform_check 
CHECK (platform = ANY (ARRAY['instagram'::text, 'tiktok'::text, 'youtube'::text, 'x'::text, 'snapchat'::text]));