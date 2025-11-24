# 🚀 Guide Simple : Déployer les Edge Functions Supabase

## ⚠️ Problème Actuel

Vous voyez l'erreur **404: NOT_FOUND** car les Edge Functions ne sont pas déployées sur Supabase.

## ✅ Solution la Plus Simple : Via le Dashboard Supabase

### Étape 1 : Accéder au Dashboard
1. Allez sur : https://supabase.com/dashboard/project/vklayzyhocjpicnblwfx
2. Connectez-vous si nécessaire

### Étape 2 : Accéder aux Edge Functions
1. Dans le menu de gauche, cliquez sur **Edge Functions**
2. Vous verrez la liste des fonctions (si certaines sont déjà déployées)

### Étape 3 : Déployer les Fonctions

**Option A : Déploiement via l'interface (recommandé pour commencer)**

Pour chaque fonction dans le dossier `supabase/functions/` :

1. Cliquez sur **"Deploy a new function"** ou **"New Function"**
2. Donnez le nom de la fonction (ex: `capture-payment-and-transfer`)
3. Copiez le contenu du fichier `index.ts` de la fonction
4. Collez-le dans l'éditeur
5. Cliquez sur **Deploy**

**Option B : Déploiement via ZIP (plus rapide)**

1. Pour chaque fonction dans `supabase/functions/` :
   - Compressez le dossier de la fonction en ZIP
   - Dans le Dashboard, cliquez sur **"Deploy from ZIP"**
   - Uploadez le fichier ZIP

### Étape 4 : Configurer les Secrets (Important !)

1. Dans le Dashboard, allez dans **Project Settings** → **Edge Functions** → **Secrets**
2. Ajoutez ces secrets (si pas déjà configurés) :
   - `STRIPE_SECRET_KEY` = votre clé secrète Stripe (commence par `sk_`)
   - `STRIPE_WEBHOOK_SECRET` = votre secret webhook Stripe (commence par `whsec_`)
   - `SUPABASE_URL` = `https://vklayzyhocjpicnblwfx.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = votre clé service role (trouvable dans Project Settings → API)

## 📋 Liste des Fonctions à Déployer (28 fonctions)

### Fonctions Critiques (à déployer en priorité)

1. ✅ `capture-payment-and-transfer` - Capture les paiements
2. ✅ `cancel-payment` - Annule les paiements
3. ✅ `recover-payments` - Récupère les paiements en erreur
4. ✅ `create-stripe-session` - Crée une session Stripe
5. ✅ `complete-order-and-pay` - Finalise une commande
6. ✅ `cancel-order-and-refund` - Annule et rembourse une commande

### Fonctions Stripe Connect

7. ✅ `create-stripe-connect-onboarding` - Onboarding Stripe Connect
8. ✅ `check-stripe-account-status` - Vérifie le statut du compte
9. ✅ `create-stripe-account-link` - Crée un lien de compte
10. ✅ `update-stripe-account-details` - Met à jour les détails
11. ✅ `create-stripe-connect-account` - Crée un compte Connect

### Fonctions Stripe Identity

12. ✅ `create-stripe-identity` - Crée une vérification d'identité
13. ✅ `check-stripe-identity-status` - Vérifie le statut d'identité

### Fonctions de Retrait

14. ✅ `process-withdrawal` - Traite un retrait
15. ✅ `create-stripe-payout` - Crée un paiement
16. ✅ `check-withdrawal-status` - Vérifie le statut d'un retrait

### Fonctions Utilitaires

17. ✅ `search-influencers` - Recherche d'influenceurs
18. ✅ `handle-contact-form` - Gère le formulaire de contact
19. ✅ `notify-order-events` - Notifie les événements de commande
20. ✅ `auto-handle-orders` - Gère automatiquement les commandes
21. ✅ `generate-missing-revenues` - Génère les revenus manquants
22. ✅ `cleanup-orphan-orders` - Nettoie les commandes orphelines
23. ✅ `sync-revenues-with-stripe` - Synchronise les revenus avec Stripe

### Webhooks

24. ✅ `stripe-webhook` - Webhook Stripe principal
25. ✅ `stripe-withdrawal-webhook` - Webhook pour les retraits

### Fonctions Legacy

26. ✅ `create-payment-with-connect` - Paiement avec Connect
27. ✅ `create-payment-authorization` - Autorisation de paiement
28. ✅ `test-stripe-account-link` - Test de lien de compte

## 🔍 Comment Identifier Quelle Fonction Manque ?

Quand vous voyez l'erreur 404, regardez dans la console du navigateur (F12) :
- L'URL de la fonction appelée sera visible
- Exemple : `https://vklayzyhocjpicnblwfx.supabase.co/functions/v1/capture-payment-and-transfer`
- Le nom de la fonction est dans l'URL : `capture-payment-and-transfer`

## ✅ Vérification Après Déploiement

1. Dans le Dashboard → Edge Functions, toutes les fonctions doivent apparaître
2. Testez une fonction depuis votre application
3. L'erreur 404 devrait disparaître

## 🆘 Besoin d'Aide ?

Si vous avez des problèmes :
1. Vérifiez les logs dans le Dashboard → Edge Functions → Logs
2. Vérifiez que les secrets sont bien configurés
3. Vérifiez que le code de la fonction est correct

## 📝 Note Importante

Le déploiement via le Dashboard est plus simple mais prend plus de temps. Si vous avez beaucoup de fonctions à déployer, considérez d'installer Supabase CLI et d'utiliser les scripts fournis (`scripts/deploy-functions.ps1`).

