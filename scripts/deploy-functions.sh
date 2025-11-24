#!/bin/bash
# Script pour déployer toutes les Edge Functions Supabase

set -e

echo "🚀 Déploiement des Edge Functions Supabase..."
echo ""

# Liste de toutes les fonctions à déployer
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

SUCCESS_COUNT=0
FAILED_COUNT=0
FAILED_FUNCTIONS=()

for func in "${FUNCTIONS[@]}"; do
  echo "📦 Déploiement de $func..."
  
  if supabase functions deploy "$func" --no-verify-jwt 2>/dev/null; then
    echo "✅ $func déployé avec succès"
    ((SUCCESS_COUNT++))
  else
    echo "❌ Échec du déploiement de $func"
    ((FAILED_COUNT++))
    FAILED_FUNCTIONS+=("$func")
  fi
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Résumé du déploiement :"
echo "✅ Succès : $SUCCESS_COUNT"
echo "❌ Échecs : $FAILED_COUNT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED_COUNT -gt 0 ]; then
  echo ""
  echo "⚠️  Fonctions en échec :"
  for func in "${FAILED_FUNCTIONS[@]}"; do
    echo "   - $func"
  done
  echo ""
  echo "💡 Vérifiez :"
  echo "   1. Que Supabase CLI est installé : npm install -g supabase"
  echo "   2. Que vous êtes connecté : supabase login"
  echo "   3. Que le projet est lié : supabase link --project-ref vklayzyhocjpicnblwfx"
  exit 1
else
  echo ""
  echo "🎉 Toutes les fonctions ont été déployées avec succès !"
  exit 0
fi

