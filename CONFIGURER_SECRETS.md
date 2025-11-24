# 🔐 Guide : Configurer les Secrets pour les Edge Functions

## ⚠️ Problème Actuel

Vos fonctions retournent des erreurs **500** ou **401** car les secrets ne sont pas configurés dans Supabase.

## ✅ Solution : Configurer les Secrets

### Étape 1 : Accéder aux Secrets

1. Allez sur : https://supabase.com/dashboard/project/vklayzyhocjpicnblwfx/settings/functions
2. Ou : **Project Settings** → **Edge Functions** → **Secrets**

### Étape 2 : Ajouter les Secrets Requis

Cliquez sur **"Add a new secret"** et ajoutez ces 4 secrets :

#### 1. `SUPABASE_URL`
- **Valeur** : `https://vklayzyhocjpicnblwfx.supabase.co`
- **Description** : URL de votre projet Supabase

#### 2. `SUPABASE_SERVICE_ROLE_KEY`
- **Où le trouver** : 
  - Allez dans **Project Settings** → **API**
  - Copiez la clé **"service_role"** (⚠️ NE JAMAIS exposer cette clé publiquement)
- **Description** : Clé service role pour accéder à la base de données

#### 3. `STRIPE_SECRET_KEY`
- **Où le trouver** :
  - Allez sur https://dashboard.stripe.com/apikeys
  - Copiez la clé secrète (commence par `sk_live_` ou `sk_test_`)
- **Description** : Clé secrète Stripe pour les paiements

#### 4. `STRIPE_WEBHOOK_SECRET` (optionnel pour certaines fonctions)
- **Où le trouver** :
  - Allez sur https://dashboard.stripe.com/webhooks
  - Créez ou sélectionnez un webhook
  - Copiez le "Signing secret" (commence par `whsec_`)
- **Description** : Secret pour valider les webhooks Stripe

### Étape 3 : Vérifier la Configuration

Après avoir ajouté les secrets, attendez quelques secondes puis testez à nouveau :

```powershell
.\scripts\check-functions.ps1
```

Les erreurs 500 devraient disparaître si les secrets sont correctement configurés.

## 🔍 Vérification des Secrets

Pour vérifier quels secrets sont configurés, vous pouvez utiliser Supabase CLI :

```powershell
supabase secrets list
```

## ⚠️ Notes Importantes

1. **Ne partagez JAMAIS** votre `SUPABASE_SERVICE_ROLE_KEY` publiquement
2. **Ne partagez JAMAIS** votre `STRIPE_SECRET_KEY` publiquement
3. Les secrets sont automatiquement disponibles dans toutes vos Edge Functions via `Deno.env.get('NOM_DU_SECRET')`
4. Après avoir ajouté/modifié des secrets, les fonctions peuvent prendre quelques secondes pour les charger

## 🆘 Si les Erreurs Persistent

1. Vérifiez que les noms des secrets sont **exactement** comme indiqué (sensible à la casse)
2. Vérifiez que les valeurs sont correctes (pas d'espaces avant/après)
3. Consultez les logs des fonctions dans le Dashboard pour voir les erreurs détaillées
4. Redéployez les fonctions après avoir ajouté les secrets : `.\scripts\deploy-functions.ps1`


