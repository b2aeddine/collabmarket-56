# 💰 Système de Revenus Stripe - Documentation

## 📋 Vue d'ensemble

Le système de revenus de Collabmarket a été complètement refondu pour garantir que **tous les montants affichés correspondent à de vraies transactions Stripe capturées**.

---

## 🎯 Principes fondamentaux

### ✅ Ce qui est compté comme revenu

**UNIQUEMENT** les commandes qui remplissent TOUS ces critères :
- ✅ `payment_captured = true`
- ✅ `stripe_payment_intent_id IS NOT NULL`
- ✅ Statut dans : `['paid', 'en_cours', 'delivered', 'terminée']`

### ❌ Ce qui n'est PAS compté

- ❌ Commandes avec `status = 'pending'`
- ❌ Commandes annulées ou refusées
- ❌ Commandes sans `stripe_payment_intent_id`
- ❌ Commandes avec `payment_captured = false`

---

## 🔄 Flow de paiement corrigé

### 1. Création de commande
```
Utilisateur clique "Payer" 
→ create-payment-with-connect (Edge Function)
→ Création PaymentIntent Stripe (avec metadata)
→ Création Checkout Session
→ PAS de commande en DB à ce stade
→ Redirection vers Stripe Checkout
```

**Important** : La commande n'est créée qu'après paiement réussi !

### 2. Paiement réussi
```
Utilisateur paye sur Stripe
→ checkout.session.completed (Webhook)
→ Création de la commande en DB avec status='paid'
→ Commande créée avec toutes les metadata
```

### 3. Annulation
```
Utilisateur annule
→ checkout.session.expired (Webhook)
→ Suppression des commandes pending orphelines
→ AUCUNE commande en DB = AUCUN revenu fictif
```

### 4. Capture du paiement (quand l'influenceur accepte)
```
Influenceur accepte la commande
→ capture-payment-and-transfer (Edge Function)
→ Stripe capture le PaymentIntent
→ payment_captured = true
→ Création du revenu dans influencer_revenues
→ Fonds disponibles pour retrait
```

---

## 📊 Calcul des revenus

### Fonction SQL : `get_influencer_available_balance`
```sql
SELECT SUM(ir.net_amount)
FROM influencer_revenues ir
INNER JOIN orders o ON ir.order_id = o.id
WHERE ir.influencer_id = $1 
  AND ir.status = 'available'
  AND o.payment_captured = true  -- ✅ Vérifie la capture
  AND o.stripe_payment_intent_id IS NOT NULL  -- ✅ Vérifie l'ID Stripe
```

### Fonction SQL : `get_merchant_total_spent`
```sql
SELECT SUM(o.total_amount)
FROM orders o
WHERE o.merchant_id = $1
  AND o.payment_captured = true  -- ✅ Paiements capturés uniquement
  AND o.stripe_payment_intent_id IS NOT NULL  -- ✅ Avec ID Stripe
```

---

## 🧹 Nettoyage des données invalides

### Fonction SQL : `cleanup_invalid_revenues()`
Supprime automatiquement :
- Les revenus pour commandes non capturées
- Les revenus pour commandes sans `stripe_payment_intent_id`
- Les entrées dans `influencer_revenues` ET `revenues` (legacy)

### Edge Function : `sync-revenues-with-stripe`
Vérifie chaque commande avec Stripe API :
- ✅ Valide les paiements réels
- ❌ Supprime les revenus fictifs
- 🔄 Crée les revenus manquants pour paiements vérifiés

---

## 🔐 Edge Functions clés

### 1. `create-payment-with-connect`
- Crée PaymentIntent avec commission plateforme (10%)
- Stocke toutes les données dans metadata Stripe
- **NE CRÉE PAS** la commande immédiatement

### 2. `stripe-webhook`
- `checkout.session.completed` : Crée la commande
- `checkout.session.expired` : Supprime les commandes pending
- `payment_intent.succeeded` : Marque payment_captured = true

### 3. `capture-payment-and-transfer`
- Capture le paiement Stripe
- Crée le revenu dans `influencer_revenues`
- Crée l'enregistrement dans `stripe_transfers`
- Évite les doublons

### 4. `sync-revenues-with-stripe`
- Synchronisation complète avec Stripe
- Vérifie tous les PaymentIntent
- Nettoie les données invalides

### 5. `cleanup-orphan-orders`
- Nettoie les commandes pending expirées
- Vérifie le statut Stripe des sessions
- Supprime ce qui n'est plus valide

---

## 🚨 Problèmes résolus

### Avant ❌
- Commandes créées avant paiement → annulées mais restaient en DB
- Revenus générés automatiquement pour toutes les commandes "terminée"
- Aucune vérification avec Stripe
- 137.70€ affichés = revenus fictifs
- Commandes "incomplètes" dans Stripe = commandes orphelines

### Après ✅
- Commandes créées UNIQUEMENT après paiement réussi
- Revenus créés UNIQUEMENT lors de la capture (paiement réel)
- Vérification systématique avec Stripe
- Solde affiché = solde réel (0€ si aucun paiement capturé)
- Plus de commandes orphelines

---

## 🎯 Tables de données

### `orders`
Source de vérité pour les commandes.
Champs critiques :
- `payment_captured` : booléen, true si paiement capturé
- `stripe_payment_intent_id` : ID Stripe, null si pas de paiement
- `stripe_session_id` : ID de la session Stripe Checkout

### `influencer_revenues`
Revenus des influenceurs (table principale).
**Condition** : Doit avoir un `order_id` avec `payment_captured = true`

### `revenues`
Table legacy, maintenue pour compatibilité.
Sera supprimée dans une future version.

### `stripe_transfers`
Historique des transferts vers les influenceurs.
Créé lors de `capture-payment-and-transfer`.

---

## 🔧 Maintenance

### Synchronisation manuelle
Si vous suspectez des incohérences :

```bash
# Appeler l'edge function de synchronisation
curl -X POST \
  https://vklayzyhocjpicnblwfx.supabase.co/functions/v1/sync-revenues-with-stripe

# Nettoyer les commandes orphelines
curl -X POST \
  https://vklayzyhocjpicnblwfx.supabase.co/functions/v1/cleanup-orphan-orders
```

### Nettoyage SQL
```sql
-- Nettoyer les revenus invalides
SELECT cleanup_invalid_revenues();

-- Voir les commandes sans paiement capturé
SELECT id, status, total_amount, payment_captured, stripe_payment_intent_id
FROM orders
WHERE payment_captured = false OR stripe_payment_intent_id IS NULL;
```

---

## 📈 Monitoring

### Vérifications régulières

1. **Cohérence des revenus**
```sql
SELECT 
  COUNT(*) as revenue_count,
  SUM(net_amount) as total_net
FROM influencer_revenues ir
INNER JOIN orders o ON ir.order_id = o.id
WHERE o.payment_captured = false; -- Devrait retourner 0
```

2. **Commandes sans paiement**
```sql
SELECT COUNT(*)
FROM orders
WHERE status IN ('paid', 'terminée', 'en_cours')
AND (payment_captured = false OR stripe_payment_intent_id IS NULL); -- Devrait retourner 0
```

3. **Webhook logs**
```sql
SELECT event_type, COUNT(*), MAX(created_at)
FROM payment_logs
GROUP BY event_type
ORDER BY MAX(created_at) DESC;
```

---

## 🎓 Bonnes pratiques

1. **Toujours vérifier `payment_captured`** avant d'afficher des revenus
2. **Ne jamais créer de revenus** sans avoir un `stripe_payment_intent_id`
3. **Utiliser les webhooks** comme source de vérité
4. **Logger toutes les opérations** pour faciliter le debugging
5. **Synchroniser régulièrement** avec Stripe (via `sync-revenues-with-stripe`)

---

## 🔒 Sécurité

- Les revenus ne peuvent être vus que par l'influenceur concerné (RLS)
- Les montants sont calculés côté backend (Edge Functions)
- Les webhooks vérifient les signatures Stripe
- Aucune manipulation frontend possible

---

## 🆘 Troubleshooting

### "Mon solde est à 0€ mais j'ai des commandes"
→ Vérifiez que les commandes ont `payment_captured = true`
→ Exécutez `sync-revenues-with-stripe` pour synchroniser

### "Les revenus ne se mettent pas à jour"
→ Vérifiez les logs du webhook `stripe-webhook`
→ Vérifiez que STRIPE_WEBHOOK_SECRET est configuré

### "Des revenus apparaissent sans paiement"
→ Exécutez `cleanup_invalid_revenues()` en SQL
→ Désactivez `generate-missing-revenues` (déjà fait)

---

**Date de dernière mise à jour** : 23 Novembre 2025
**Version** : 2.0 - Système de revenus basé sur Stripe
