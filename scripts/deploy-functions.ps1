# Script PowerShell pour déployer toutes les Edge Functions Supabase

Write-Host "🚀 Déploiement des Edge Functions Supabase..." -ForegroundColor Cyan
Write-Host ""

$functions = @(
  "create-payment-with-connect",
  "capture-payment-and-transfer",
  "cancel-payment",
  "create-stripe-session",
  "complete-order-and-pay",
  "cancel-order-and-refund",
  "recover-payments",
  "create-stripe-connect-onboarding",
  "create-stripe-connect-account",
  "check-stripe-account-status",
  "create-stripe-account-link",
  "update-stripe-account-details",
  "test-stripe-account-link",
  "create-stripe-identity",
  "check-stripe-identity-status",
  "process-withdrawal",
  "create-stripe-payout",
  "check-withdrawal-status",
  "search-influencers",
  "handle-contact-form",
  "notify-order-events",
  "auto-handle-orders",
  "generate-missing-revenues",
  "cleanup-orphan-orders",
  "sync-revenues-with-stripe",
  "stripe-webhook",
  "stripe-withdrawal-webhook",
  "create-payment-authorization"
)

$successCount = 0
$failedCount = 0
$failedFunctions = @()

foreach ($func in $functions) {
  Write-Host "📦 Déploiement de $func..." -ForegroundColor Yellow
  
  supabase functions deploy $func --no-verify-jwt 2>&1 | Out-Null
  
  if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ $func déployé avec succès" -ForegroundColor Green
    $successCount++
  } else {
    Write-Host "❌ Échec du déploiement de $func" -ForegroundColor Red
    $failedCount++
    $failedFunctions += $func
  }
  Write-Host ""
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 Résumé du déploiement :" -ForegroundColor Cyan
Write-Host "✅ Succès : $successCount" -ForegroundColor Green
Write-Host "❌ Échecs : $failedCount" -ForegroundColor Red
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if ($failedCount -gt 0) {
  Write-Host ""
  Write-Host "⚠️  Fonctions en échec :" -ForegroundColor Yellow
  foreach ($func in $failedFunctions) {
    Write-Host "   - $func" -ForegroundColor Red
  }
  Write-Host ""
  Write-Host "💡 Vérifiez :" -ForegroundColor Yellow
  Write-Host "   1. Que Supabase CLI est installé"
  Write-Host "   2. Que vous êtes connecté : supabase login"
  Write-Host "   3. Que le projet est lié : supabase link --project-ref vklayzyhocjpicnblwfx"
  exit 1
} else {
  Write-Host ""
  Write-Host "🎉 Toutes les fonctions ont été déployées avec succès !" -ForegroundColor Green
  exit 0
}
