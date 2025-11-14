-- Supprimer l'ancienne policy restrictive
DROP POLICY IF EXISTS "Influenceurs peuvent créer leurs contestations" ON public.contestations;

-- Créer une nouvelle policy qui permet aux participants (influenceur OU commerçant) de créer une contestation
CREATE POLICY "Participants peuvent créer des contestations" 
ON public.contestations 
FOR INSERT 
WITH CHECK (
  (influencer_id = auth.uid()) OR (merchant_id = auth.uid())
);