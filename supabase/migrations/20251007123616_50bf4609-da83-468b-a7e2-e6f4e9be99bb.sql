-- Mettre à jour les politiques RLS pour les contestations afin que les admins voient tout

-- Supprimer l'ancienne politique admin
DROP POLICY IF EXISTS "Admins peuvent voir toutes les contestations" ON public.contestations;

-- Recréer la politique avec une condition plus robuste
CREATE POLICY "Admins peuvent voir toutes les contestations" 
ON public.contestations
FOR SELECT
TO authenticated
USING (
  -- Les admins voient tout via is_current_user_admin()
  is_current_user_admin() = true
  OR 
  -- Les participants voient leurs propres contestations
  influencer_id = auth.uid() 
  OR 
  merchant_id = auth.uid()
);

-- S'assurer que les admins peuvent aussi voir tous les disputes
DROP POLICY IF EXISTS "Users can view their own disputes" ON public.disputes;

CREATE POLICY "Users can view their own disputes" 
ON public.disputes
FOR SELECT
TO authenticated
USING (
  is_current_user_admin() = true
  OR
  user_id = auth.uid() 
  OR 
  (SELECT orders.influencer_id FROM orders WHERE orders.id = disputes.order_id) = auth.uid() 
  OR 
  (SELECT orders.merchant_id FROM orders WHERE orders.id = disputes.order_id) = auth.uid()
);