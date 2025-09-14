-- Corriger la fonction pour calculer le solde disponible avec la bonne table
CREATE OR REPLACE FUNCTION public.get_influencer_available_balance(user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN COALESCE((
    SELECT SUM(net_amount)
    FROM public.influencer_revenues
    WHERE influencer_id = user_id 
    AND status = 'available'
  ), 0);
END;
$$;