
-- Ajouter une colonne identity_status à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN identity_status text DEFAULT 'pending'::text;

-- Ajouter une contrainte pour valider les valeurs possibles
ALTER TABLE public.profiles 
ADD CONSTRAINT check_identity_status 
CHECK (identity_status IN ('pending', 'verified', 'rejected'));

-- Créer une table pour stocker les documents d'identité
CREATE TABLE public.identity_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('carte_identite', 'passeport', 'permis_conduire', 'carte_sejour')),
  document_front_url text NOT NULL,
  document_back_url text, -- Nullable car le passeport n'a qu'un recto
  uploaded_at timestamp with time zone DEFAULT now(),
  verified_at timestamp with time zone,
  verified_by uuid REFERENCES public.profiles(id),
  status text DEFAULT 'pending'::text CHECK (status IN ('pending', 'verified', 'rejected')),
  rejection_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS pour la table identity_documents
ALTER TABLE public.identity_documents ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs puissent créer leurs propres documents
CREATE POLICY "Users can insert their own identity documents" 
ON public.identity_documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent voir leurs propres documents
CREATE POLICY "Users can view their own identity documents" 
ON public.identity_documents 
FOR SELECT 
USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent modifier leurs propres documents
CREATE POLICY "Users can update their own identity documents" 
ON public.identity_documents 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Créer le bucket de stockage pour les identités
INSERT INTO storage.buckets (id, name, public) 
VALUES ('identities', 'identities', false);

-- Créer le bucket de stockage pour les avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- RLS pour le bucket identities - seuls les propriétaires peuvent accéder
CREATE POLICY "Users can upload their own identity documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'identities' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own identity documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'identities' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS pour le bucket avatars - public en lecture, propriétaires en écriture
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
