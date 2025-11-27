**CRITIQUE : La clé `STRIPE_SECRET_KEY` est invalide (Erreur 401).**

ACTION REQUISE :
1. Générer une nouvelle clé secrète sur le dashboard Stripe.
2. Mettre à jour les secrets Supabase avec : `supabase secrets set STRIPE_SECRET_KEY=sk_live_...`
3. Supprimer ce fichier une fois fait.
