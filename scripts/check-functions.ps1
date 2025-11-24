# Script pour verifier le statut des fonctions Supabase

Write-Host "Verification des fonctions Supabase..." -ForegroundColor Cyan
Write-Host ""

$functions = @(
    "capture-payment-and-transfer",
    "cancel-payment",
    "create-stripe-session",
    "check-stripe-account-status",
    "create-stripe-connect-onboarding",
    "search-influencers",
    "handle-contact-form"
)

$baseUrl = "https://vklayzyhocjpicnblwfx.supabase.co/functions/v1"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrbGF5enlob2NqcGljbmJsd2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3ODA4MDMsImV4cCI6MjA2NzM1NjgwM30.pUSBHigrCNULCQAPdYCKixt7OYNICKHCgbBaelFqJE8"

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $anonKey"
    "apikey" = $anonKey
}

$successCount = 0
$notFoundCount = 0
$errorCount = 0

foreach ($func in $functions) {
    Write-Host "Test de '$func'..." -ForegroundColor Yellow -NoNewline
    
    $testUrl = "$baseUrl/$func"
    
    try {
        $response = Invoke-WebRequest -Uri $testUrl -Method POST -Headers $headers -Body '{}' -ContentType "application/json" -ErrorAction Stop
        Write-Host " OK (Status: $($response.StatusCode))" -ForegroundColor Green
        $successCount++
    } catch {
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            
            if ($statusCode -eq 404) {
                Write-Host " ERREUR 404 - La fonction n'existe pas ou n'est pas deployee!" -ForegroundColor Red
                $notFoundCount++
            } elseif ($statusCode -eq 400) {
                Write-Host " OK (400 = parametres invalides, mais la fonction repond)" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host " Erreur $statusCode" -ForegroundColor Yellow
                $errorCount++
            }
        } else {
            Write-Host " Erreur de connexion" -ForegroundColor Yellow
            $errorCount++
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Resume:" -ForegroundColor Cyan
Write-Host "Fonctions accessibles: $successCount" -ForegroundColor Green
Write-Host "Fonctions 404 (non trouvees): $notFoundCount" -ForegroundColor Red
Write-Host "Autres erreurs: $errorCount" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

if ($notFoundCount -gt 0) {
    Write-Host ""
    Write-Host "Solutions:" -ForegroundColor Cyan
    Write-Host "1. Verifiez le Dashboard: https://supabase.com/dashboard/project/vklayzyhocjpicnblwfx/functions" -ForegroundColor Yellow
    Write-Host "2. Redeployez les fonctions manquantes: .\scripts\deploy-functions.ps1" -ForegroundColor Yellow
    Write-Host "3. Verifiez les secrets: Project Settings > Edge Functions > Secrets" -ForegroundColor Yellow
}
