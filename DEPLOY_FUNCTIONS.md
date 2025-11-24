# Guide de Déploiement des Edge Functions Supabase

## 🔴 Problème

L'erreur `404: NOT_FOUND` avec l'ID `cdg1::1zn7j-...` indique qu'une ou plusieurs Edge Functions Supabase ne sont pas déployées sur votre projet Supabase.

## ✅ Solution

Vous devez déployer toutes les Edge Functions sur Supabase. Voici comment procéder :

### Option 1 : Déploiement via CLI Supabase (Recommandé)

1. **Installer Supabase CLI** (si ce n'est pas déjà fait) :
   ```bash
   npm install -g supabase
   ```

2. **Se connecter à Supabase** :
   ```bash
   supabase login
   ```

3. **Lier votre projet** :
   ```bash
   supabase link --project-ref vklayzyhocjpicnblwfx
   ```

4. **Déployer toutes les fonctions** :
   ```bash
   # Déployer une fonction spécifique
   supabase functions deploy <nom-de-la-fonction>
   
   # Déployer toutes les fonctions (script à créer)
   npm run supabase:deploy:all
   ```

### Option 2 : Déploiement via Dashboard Supabase

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard/project/vklayzyhocjpicnblwfx)
2. Naviguer vers **Edge Functions**
3. Pour chaque fonction dans `supabase/functions/` :
   - Cliquer sur **Deploy Function**
   - Uploader le dossier de la fonction
   - Configurer les variables d'environnement si nécessaire

### Liste des Fonctions à Déployer

Voici toutes les fonctions qui doivent être déployées :

#### Fonctions de Paiement
- ✅ `create-payment-with-connect`
- ✅ `capture-payment-and-transfer`
- ✅ `cancel-payment`
- ✅ `create-stripe-session`
- ✅ `complete-order-and-pay`
- ✅ `cancel-order-and-refund`
- ✅ `recover-payments`

#### Fonctions Stripe Connect
- ✅ `create-stripe-connect-onboarding`
- ✅ `create-stripe-connect-account`
- ✅ `check-stripe-account-status`
- ✅ `create-stripe-account-link`
- ✅ `update-stripe-account-details`
- ✅ `test-stripe-account-link`

#### Fonctions Stripe Identity
- ✅ `create-stripe-identity`
- ✅ `check-stripe-identity-status`

#### Fonctions de Retrait
- ✅ `process-withdrawal`
- ✅ `create-stripe-payout`
- ✅ `check-withdrawal-status`

#### Fonctions de Gestion
- ✅ `search-influencers`
- ✅ `handle-contact-form`
- ✅ `notify-order-events`
- ✅ `auto-handle-orders`
- ✅ `generate-missing-revenues`
- ✅ `cleanup-orphan-orders`
- ✅ `sync-revenues-with-stripe`

#### Webhooks
- ✅ `stripe-webhook`
- ✅ `stripe-withdrawal-webhook`

#### Fonctions Legacy
- ✅ `create-payment-authorization`

### Script de Déploiement Automatique

Pour déployer toutes les fonctions en une seule fois, créez un script :

```bash
#!/bin/bash
# deploy-all-functions.sh

FUNCTIONS=(
  "create-payment-with-connect"
  "capture-payment-and-transfer"
  "cancel-payment"
  "create-stripe-session"
  "complete-order-and-pay"
  "cancel-order-and-refund"
  "recover-payments"
  "create-stripe-connect-onboarding"
  "create-stripe-connect-account"
  "check-stripe-account-status"
  "create-stripe-account-link"
  "update-stripe-account-details"
  "test-stripe-account-link"
  "create-stripe-identity"
  "check-stripe-identity-status"
  "process-withdrawal"
  "create-stripe-payout"
  "check-withdrawal-status"
  "search-influencers"
  "handle-contact-form"
  "notify-order-events"
  "auto-handle-orders"
  "generate-missing-revenues"
  "cleanup-orphan-orders"
  "sync-revenues-with-stripe"
  "stripe-webhook"
  "stripe-withdrawal-webhook"
  "create-payment-authorization"
)

for func in "${FUNCTIONS[@]}"; do
  echo "Deploying $func..."
  supabase functions deploy "$func" --no-verify-jwt
  if [ $? -eq 0 ]; then
    echo "✅ $func deployed successfully"
  else
    echo "❌ Failed to deploy $func"
  fi
done
```

### Vérification

Après le déploiement, vérifiez que les fonctions sont disponibles :

1. Dans le Dashboard Supabase → Edge Functions
2. Toutes les fonctions doivent apparaître avec le statut "Active"
3. Testez une fonction depuis votre application

### Variables d'Environnement Requises

Assurez-vous que ces secrets sont configurés dans Supabase :

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Pour configurer les secrets :
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🚨 Erreurs Courantes

### "Function not found"
- La fonction n'est pas déployée → Déployez-la

### "Unauthorized"
- Vérifiez que `verify_jwt` est correctement configuré dans `supabase/config.toml`
- Vérifiez que l'utilisateur est authentifié

### "Internal Server Error"
- Vérifiez les logs de la fonction dans le Dashboard Supabase
- Vérifiez que les secrets sont correctement configurés

## 📚 Ressources

- [Documentation Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

