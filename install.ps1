# Script d'installation T-Express
# Utilisation: .\install.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  T-Express - Installation" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si nous sommes dans le bon dossier
if (-not (Test-Path ".\T-Express-backend") -or -not (Test-Path ".\T-Express-Frontend")) {
    Write-Host "ERREUR: Ce script doit être exécuté depuis le dossier parent" -ForegroundColor Red
    exit 1
}

# Backend
Write-Host "📦 Installation du Backend (Laravel)..." -ForegroundColor Green
Set-Location "T-Express-backend"

if (-not (Test-Path ".env")) {
    Write-Host "   Copie de .env.example vers .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

Write-Host "   Installation des dépendances Composer..." -ForegroundColor Yellow
composer install

Write-Host "   Génération de la clé d'application..." -ForegroundColor Yellow
php artisan key:generate

Write-Host "   ✅ Backend installé !" -ForegroundColor Green
Write-Host ""

# Frontend
Set-Location ".."
Write-Host "📦 Installation du Frontend (Next.js)..." -ForegroundColor Green
Set-Location "T-Express-Frontend"

if (-not (Test-Path ".env.local")) {
    Write-Host "   Copie de .env.example vers .env.local..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
}

Write-Host "   Installation des dépendances npm..." -ForegroundColor Yellow
npm install

Write-Host "   ✅ Frontend installé !" -ForegroundColor Green
Write-Host ""

# Instructions finales
Set-Location ".."
Write-Host "================================" -ForegroundColor Green
Write-Host "  Installation terminée !" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Prochaines étapes:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Configurer la base de données:" -ForegroundColor Yellow
Write-Host "   - Éditer T-Express-backend\.env" -ForegroundColor White
Write-Host "   - Définir DB_DATABASE, DB_USERNAME, DB_PASSWORD" -ForegroundColor White
Write-Host ""
Write-Host "2. Créer la base de données MySQL:" -ForegroundColor Yellow
Write-Host "   mysql -u root -p" -ForegroundColor White
Write-Host "   CREATE DATABASE t_express;" -ForegroundColor White
Write-Host "   exit;" -ForegroundColor White
Write-Host ""
Write-Host "3. Lancer les migrations:" -ForegroundColor Yellow
Write-Host "   cd T-Express-backend" -ForegroundColor White
Write-Host "   php artisan migrate" -ForegroundColor White
Write-Host "   php artisan storage:link" -ForegroundColor White
Write-Host ""
Write-Host "4. Démarrer les serveurs:" -ForegroundColor Yellow
Write-Host "   .\start-project.ps1" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - T-Express-Frontend\QUICKSTART.md" -ForegroundColor White
Write-Host "   - T-Express-Frontend\INTEGRATION.md" -ForegroundColor White
Write-Host "   - T-Express-backend\API_DOCUMENTATION.md" -ForegroundColor White
Write-Host ""
