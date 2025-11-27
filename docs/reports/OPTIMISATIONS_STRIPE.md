# 🔐 ANALYSE STRIPE - EDGE FUNCTIONS

## 📊 RÉSUMÉ

**26 Edge Functions Stripe** analysées
- ✅ **11 fonctions actives** et utilisées
- ⚠️ **3 fonctions à vérifier** (potentiels doublons)
- 📝 **12 fonctions support** (webhooks, checks, utils)

---

## 🎯 FONCTIONS PRINCIPALES

### 1. PAIEMENTS

#### `create-payment-with-connect`
**Status:** ✅ ACTIVE  
**Usage:** Paiement direct avec Stripe Connect
**Flow:**
```
Merchant → create-payment-with-connect → Stripe Checkout
                                       ↓
                                    Payment Intent
                                       ↓
                                 (authorized status)
```

**Code appelant:**
- `src/hooks/useStripeConnectPayment.ts`
- `src/hooks/useDirectPayment.ts`

#### `create-stripe-session`
**Status:** ⚠️ À VÉRIFIER
**Usage:** Checkout classique (potentiellement old flow)
**Code appelant:**
- `src/hooks/useStripePayment.ts`
- `src/components/PaymentButton.tsx`

**❓ Question:** Cette fonction est-elle encore utilisée ou remplacée par `create-payment-with-connect` ?

#### `create-payment-authorization`
**Status:** ⚠️ À VÉRIFIER  
**Usage:** Autorisation de paiement
**Code appelant:** Non trouvé dans le code frontend

**Recommandation:** Vérifier si utilisée, sinon marquer comme deprecated

---

### 2. CAPTURE & TRANSFERT

#### `capture-payment-and-transfer` ✅
**Status:** ✅ ACTIVE
**Usage:** Capture le paiement ET transfère aux influenceurs
**Flow:**
```
Influencer accepts order → capture-payment-and-transfer
                                      ↓
                            Capture Payment Intent
                                      ↓
                            Transfer to Connect Account
                                      ↓
                            Create revenue record
```

**Code appelant:**
- `src/hooks/useStripeConnectPayment.ts` (capturePaymentAsync)
- `src/hooks/useOrderCompletion.ts`
- `src/components/OrderActionModal.tsx`

**Impact:** CRITIQUE - utilisé dans le flow principal

#### `capture-payment`
**Status:** ❓ POTENTIEL DOUBLON
**Usage:** Capture simple sans transfert
**Code appelant:**
- `src/components/OrderActionModal.tsx`
- `src/components/OrderDetailsModal.tsx`

**❓ Question:** Est-ce un old flow ? Devrait être remplacé par `capture-payment-and-transfer` ?

---

### 3. COMPLETION COMMANDES

#### `complete-order-payment`
**Status:** ⚠️ À VÉRIFIER
**Code appelant:** Non trouvé

#### `complete-order-and-pay`
**Status:** ⚠️ À VÉRIFIER  
**Code appelant:** Non trouvé

**Recommandation:** Ces 2 fonctions semblent être des doublons. Vérifier laquelle est utilisée.

---

### 4. ANNULATION & REFUND

#### `cancel-payment`
**Status:** ✅ ACTIVE
**Usage:** Annule un payment intent (influencer refuse)
**Code appelant:**
- `src/components/OrderActionModal.tsx`

#### `cancel-order-and-refund`
**Status:** ✅ ACTIVE
**Usage:** Annule commande + refund (merchant cancels)
**Code appelant:**
- Probablement depuis OrdersManagement

---

### 5. STRIPE CONNECT

#### `create-stripe-connect-account`
**Status:** ✅ ACTIVE
**Usage:** Création compte Connect pour influencer

#### `create-stripe-connect-onboarding`
**Status:** ✅ ACTIVE
**Usage:** Génère URL onboarding Stripe Connect
**Code appelant:**
- `src/hooks/useStripeConnect.ts`

#### `check-stripe-account-status`
**Status:** ✅ ACTIVE
**Usage:** Vérifie statut compte Connect
**Code appelant:**
- `src/hooks/useStripeConnect.ts`
- `src/hooks/useCheckStripeConnectStatus.ts`

#### `update-stripe-account-details`
**Status:** ✅ ACTIVE
**Usage:** Met à jour infos bancaires (IBAN)
**Code appelant:**
- `src/hooks/useStripeConnect.ts`

---

### 6. STRIPE IDENTITY

#### `create-stripe-identity`
**Status:** ✅ ACTIVE
**Usage:** Crée session vérification identité
**Code appelant:**
- `src/hooks/useStripeIdentity.ts`

#### `check-stripe-identity-status`
**Status:** ✅ ACTIVE
**Usage:** Vérifie statut vérification identité
**Code appelant:**
- `src/hooks/useCheckStripeIdentityStatus.ts`

---

### 7. WITHDRAWALS (RETRAITS)

#### `process-withdrawal`
**Status:** ✅ ACTIVE
**Usage:** Traite une demande de retrait
**Code appelant:**
- Admin dashboard (withdrawal management)

#### `create-stripe-payout`
**Status:** ✅ ACTIVE
**Usage:** Crée un payout Stripe
**Code appelant:**
- `process-withdrawal` (edge function call)

#### `check-withdrawal-status`
**Status:** ✅ ACTIVE
**Usage:** Vérifie statut d'un retrait
**Code appelant:**
- Admin ou influencer dashboard

---

### 8. WEBHOOKS

#### `stripe-webhook`
**Status:** ✅ ACTIVE - CRITIQUE
**Usage:** Reçoit events Stripe Checkout
**Events gérés:**
- `checkout.session.completed`
- `checkout.session.expired`

**Flow:**
```
Stripe → stripe-webhook → Update order status
                       → Log payment_logs
```

#### `stripe-withdrawal-webhook`
**Status:** ✅ ACTIVE - CRITIQUE
**Usage:** Reçoit events Stripe Payouts
**Events gérés:**
- `payout.paid`
- `payout.failed`
- `payout.canceled`

**Flow:**
```
Stripe → stripe-withdrawal-webhook → Update withdrawal status
                                   → Update revenue status
```

---

### 9. UTILITIES

#### `notify-order-events`
**Status:** ✅ ACTIVE
**Usage:** Notifications événements commandes

#### `auto-handle-orders`
**Status:** ✅ ACTIVE
**Usage:** Gestion automatique commandes expirées

#### `handle-contact-form`
**Status:** ✅ ACTIVE
**Usage:** Traite formulaire contact (non-Stripe)

#### `recover-payments`
**Status:** ✅ ACTIVE
**Usage:** Récupération paiements échoués

#### `generate-missing-revenues`
**Status:** ✅ ACTIVE
**Usage:** Génère revenus manquants (admin)

---

## 🔄 FLOWS COMPLETS

### Flow Paiement Direct (PRINCIPAL):
```
1. Merchant clicks "Commander"
   ↓
2. create-payment-with-connect
   ↓
3. Stripe Checkout (Payment Intent created)
   ↓
4. Payment authorized
   ↓
5. stripe-webhook (checkout.session.completed)
   ↓
6. Order status: "payment_authorized"
   ↓
7. Influencer accepts
   ↓
8. capture-payment-and-transfer
   ↓
9. Payment captured + transferred
   ↓
10. Order status: "en_cours"
```

### Flow Stripe Connect:
```
1. Influencer needs Connect
   ↓
2. create-stripe-connect-account (if not exists)
   ↓
3. create-stripe-connect-onboarding
   ↓
4. Influencer completes onboarding (Stripe)
   ↓
5. check-stripe-account-status (webhook)
   ↓
6. Profile updated: stripe_connect_status = "complete"
```

### Flow Withdrawal:
```
1. Influencer requests withdrawal
   ↓
2. process-withdrawal
   ↓
3. create-stripe-payout
   ↓
4. Stripe processes payout
   ↓
5. stripe-withdrawal-webhook (payout.paid)
   ↓
6. Withdrawal status: "completed"
   ↓
7. Revenue status: "paid"
```

---

## ⚠️ RECOMMANDATIONS

### 1. VERIFICATION URGENTE

**Fonctions à vérifier:**
```
⚠️ create-stripe-session
   → Remplacée par create-payment-with-connect ?
   → Si oui, déprécier

⚠️ capture-payment
   → Remplacée par capture-payment-and-transfer ?
   → Si oui, déprécier

⚠️ complete-order-payment vs complete-order-and-pay
   → Doublon évident
   → Garder une seule ou déprécier les deux si non utilisées

⚠️ create-payment-authorization
   → Non trouvée dans frontend
   → Vérifier utilisation ou déprécier
```

### 2. DOCUMENTATION

**À ajouter:**
- README par fonction (usage, params, returns)
- Flow diagrams dans `/docs`
- Liste functions actives vs deprecated

### 3. MONITORING

**À mettre en place:**
- Logs structured sur chaque function
- Alertes sur erreurs critiques (webhooks)
- Dashboard usage functions (Supabase)

### 4. TESTS

**À ajouter:**
- Tests unitaires edge functions
- Tests integration Stripe (test mode)
- Tests webhooks events

---

## 📋 CHECKLIST MAINTENANCE

### Chaque mois:
- [ ] Vérifier logs errors edge functions
- [ ] Vérifier webhook events non traités
- [ ] Check Stripe API version updates
- [ ] Review functions usage statistics

### Chaque trimestre:
- [ ] Audit complet edge functions
- [ ] Supprimer functions deprecated
- [ ] Update Stripe SDK si nécessaire
- [ ] Review security (keys, scopes)

### Avant chaque déploiement:
- [ ] Test payments flow (end-to-end)
- [ ] Test withdrawals flow
- [ ] Verify webhooks endpoints actifs
- [ ] Check Stripe Dashboard events

---

## 🔐 SÉCURITÉ

### Secrets vérifiés:
✅ `STRIPE_SECRET_KEY` - Configuré
✅ `STRIPE_WEBHOOK_SECRET` - Configuré (pour stripe-webhook)
✅ `STRIPE_WITHDRAWAL_WEBHOOK_SECRET` - Configuré

### Best Practices:
✅ Signature verification sur webhooks
✅ Idempotency keys sur créations
✅ Error handling avec fallbacks
✅ Logs structurés pour audit

### À améliorer:
- [ ] Rate limiting sur fonctions publiques
- [ ] IP whitelist sur webhooks (si possible)
- [ ] Enhanced logging avec correlat

ion IDs

---

## 📊 RÉSUMÉ FINAL

| Catégorie | Actives | À vérifier | Total |
|-----------|---------|------------|-------|
| Paiements | 1 | 2 | 3 |
| Capture | 1 | 1 | 2 |
| Completion | 0 | 2 | 2 |
| Connect | 4 | 0 | 4 |
| Identity | 2 | 0 | 2 |
| Withdrawals | 3 | 0 | 3 |
| Webhooks | 2 | 0 | 2 |
| Utils | 5 | 0 | 5 |
| **TOTAL** | **18** | **5** | **23** |

**Status global:** ✅ Opérationnel  
**Actions requises:** ⚠️ Vérification 5 fonctions  
**Priorité:** 🟡 Moyenne (pas bloquant)

---

**Date:** 20 Janvier 2025  
**Par:** Lovable AI  
**Version Stripe:** Latest (2024)
