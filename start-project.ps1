# Script PowerShell pour démarrer T-Express
# Utilisation: .\start-project.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  T-Express - Démarrage" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si nous sommes dans le bon dossier
if (-not (Test-Path ".\T-Express-backend") -or -not (Test-Path ".\T-Express-Frontend")) {
    Write-Host "ERREUR: Ce script doit être exécuté depuis le dossier parent contenant T-Express-backend et T-Express-Frontend" -ForegroundColor Red
    exit 1
}

# Fonction pour vérifier si un port est occupé
function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
    return $connection.TcpTestSucceeded
}

# Vérifier les ports
Write-Host "Vérification des ports..." -ForegroundColor Yellow

$backendPort = 8000
$frontendPort = 3000

if (Test-Port $backendPort) {
    Write-Host "⚠️  Le port $backendPort est déjà utilisé" -ForegroundColor Red
    Write-Host "   Le backend Laravel ne pourra pas démarrer" -ForegroundColor Red
    Write-Host ""
}

if (Test-Port $frontendPort) {
    Write-Host "⚠️  Le port $frontendPort est déjà utilisé" -ForegroundColor Red
    Write-Host "   Le frontend Next.js ne pourra pas démarrer" -ForegroundColor Red
    Write-Host ""
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  Démarrage du Backend (Laravel)" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Démarrer le backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
    Set-Location '$PWD\T-Express-backend'
    Write-Host '🚀 Démarrage du backend Laravel...' -ForegroundColor Green
    Write-Host ''
    Write-Host 'Backend accessible sur: http://localhost:8000' -ForegroundColor Cyan
    Write-Host 'API accessible sur: http://localhost:8000/api' -ForegroundColor Cyan
    Write-Host ''
    php artisan serve
"@

# Attendre un peu avant de démarrer le frontend
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  Démarrage du Frontend (Next.js)" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Démarrer le frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
    Set-Location '$PWD\T-Express-Frontend'
    Write-Host '🚀 Démarrage du frontend Next.js...' -ForegroundColor Green
    Write-Host ''
    Write-Host 'Frontend accessible sur: http://localhost:3000' -ForegroundColor Cyan
    Write-Host ''
    npm run dev
"@

Write-Host ""
Write-Host "✅ Les deux serveurs sont en cours de démarrage..." -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔌 Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 API:      http://localhost:8000/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour arrêter les serveurs, fermez les fenêtres PowerShell." -ForegroundColor Yellow
Write-Host ""

# Attendre 5 secondes puis ouvrir le navigateur
Start-Sleep -Seconds 5
Write-Host "🌐 Ouverture du navigateur..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "✨ T-Express est maintenant en cours d'exécution !" -ForegroundColor Green
Write-Host ""
