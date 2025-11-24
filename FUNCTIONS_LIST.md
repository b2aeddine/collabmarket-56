# 📋 Liste Complète des Edge Functions à Déployer

## 🎯 Instructions Rapides

1. Allez sur : https://supabase.com/dashboard/project/vklayzyhocjpicnblwfx/functions
2. Pour chaque fonction ci-dessous, cliquez sur **"Deploy Function"**
3. Donnez le nom de la fonction
4. Copiez le contenu du fichier `index.ts` correspondant
5. Collez et déployez

---

## 📦 Fonctions par Catégorie

### 💳 Fonctions de Paiement (7 fonctions)

| Nom de la Fonction | Chemin du Fichier |
|-------------------|-------------------|
| `capture-payment-and-transfer` | `supabase/functions/capture-payment-and-transfer/index.ts` |
| `cancel-payment` | `supabase/functions/cancel-payment/index.ts` |
| `create-stripe-session` | `supabase/functions/create-stripe-session/index.ts` |
| `complete-order-and-pay` | `supabase/functions/complete-order-and-pay/index.ts` |
| `cancel-order-and-refund` | `supabase/functions/cancel-order-and-refund/index.ts` |
| `recover-payments` | `supabase/functions/recover-payments/index.ts` |
| `create-payment-with-connect` | `supabase/functions/create-payment-with-connect/index.ts` |

### 🔗 Fonctions Stripe Connect (6 fonctions)

| Nom de la Fonction | Chemin du Fichier |
|-------------------|-------------------|
| `create-stripe-connect-onboarding` | `supabase/functions/create-stripe-connect-onboarding/index.ts` |
| `create-stripe-connect-account` | `supabase/functions/create-stripe-connect-account/index.ts` |
| `check-stripe-account-status` | `supabase/functions/check-stripe-account-status/index.ts` |
| `create-stripe-account-link` | `supabase/functions/create-stripe-account-link/index.ts` |
| `update-stripe-account-details` | `supabase/functions/update-stripe-account-details/index.ts` |
| `test-stripe-account-link` | `supabase/functions/test-stripe-account-link/index.ts` |

### 🆔 Fonctions Stripe Identity (2 fonctions)

| Nom de la Fonction | Chemin du Fichier |
|-------------------|-------------------|
| `create-stripe-identity` | `supabase/functions/create-stripe-identity/index.ts` |
| `check-stripe-identity-status` | `supabase/functions/check-stripe-identity-status/index.ts` |

### 💰 Fonctions de Retrait (3 fonctions)

| Nom de la Fonction | Chemin du Fichier |
|-------------------|-------------------|
| `process-withdrawal` | `supabase/functions/process-withdrawal/index.ts` |
| `create-stripe-payout` | `supabase/functions/create-stripe-payout/index.ts` |
| `check-withdrawal-status` | `supabase/functions/check-withdrawal-status/index.ts` |

### 🔍 Fonctions Utilitaires (7 fonctions)

| Nom de la Fonction | Chemin du Fichier |
|-------------------|-------------------|
| `search-influencers` | `supabase/functions/search-influencers/index.ts` |
| `handle-contact-form` | `supabase/functions/handle-contact-form/index.ts` |
| `notify-order-events` | `supabase/functions/notify-order-events/index.ts` |
| `auto-handle-orders` | `supabase/functions/auto-handle-orders/index.ts` |
| `generate-missing-revenues` | `supabase/functions/generate-missing-revenues/index.ts` |
| `cleanup-orphan-orders` | `supabase/functions/cleanup-orphan-orders/index.ts` |
| `sync-revenues-with-stripe` | `supabase/functions/sync-revenues-with-stripe/index.ts` |

### 🔔 Webhooks (2 fonctions)

| Nom de la Fonction | Chemin du Fichier |
|-------------------|-------------------|
| `stripe-webhook` | `supabase/functions/stripe-webhook/index.ts` |
| `stripe-withdrawal-webhook` | `supabase/functions/stripe-withdrawal-webhook/index.ts` |

### 🔐 Fonctions Legacy (1 fonction)

| Nom de la Fonction | Chemin du Fichier |
|-------------------|-------------------|
| `create-payment-authorization` | `supabase/functions/create-payment-authorization/index.ts` |

---

## ✅ Total : 28 fonctions à déployer

## 🔑 Secrets Requis

Avant de déployer, assurez-vous que ces secrets sont configurés dans Supabase :

1. Allez dans **Project Settings** → **Edge Functions** → **Secrets**
2. Ajoutez :
   - `STRIPE_SECRET_KEY` (votre clé secrète Stripe)
   - `STRIPE_WEBHOOK_SECRET` (votre secret webhook Stripe)
   - `SUPABASE_URL` (`https://vklayzyhocjpicnblwfx.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY` (trouvable dans Project Settings → API)

## 🚀 Ordre de Déploiement Recommandé

1. **Priorité 1** (Fonctions critiques) :
   - `capture-payment-and-transfer`
   - `cancel-payment`
   - `create-stripe-session`
   - `complete-order-and-pay`

2. **Priorité 2** (Stripe Connect) :
   - `create-stripe-connect-onboarding`
   - `check-stripe-account-status`
   - `create-stripe-account-link`

3. **Priorité 3** (Autres fonctions) :
   - Toutes les autres fonctions

## 📝 Note

Les fonctions utilisent des fichiers partagés dans `supabase/functions/_shared/`. Assurez-vous que ces fichiers sont également disponibles lors du déploiement (ils sont généralement inclus automatiquement).

