Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  UPI Dispute Resolution Platform - Startup" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

Write-Host "`n[1/4] Starting Docker infrastructure (Postgres, Kafka, Zookeeper, Redis)..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\infra\docker"
docker compose up -d

Write-Host "`nWaiting 15 seconds for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "`n[2/4] Starting Spring Boot backend (port 8080)..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\backend"
$env:MAVEN_OPTS="-Xmx256m -Xms64m -XX:+UseSerialGC"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "mvn spring-boot:run"

Write-Host "`n[3/4] Starting ML classifier service (port 5000)..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\ml-service"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python app.py"

Write-Host "`n[4/4] Starting React dashboard (port 3000)..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\frontend\dispute-dashboard"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"

Write-Host "`n=================================================" -ForegroundColor Green
Write-Host "  All services starting in separate windows!" -ForegroundColor Green
Write-Host "  Dashboard: http://localhost:3000" -ForegroundColor Green
Write-Host "  Backend:   http://localhost:8080" -ForegroundColor Green
Write-Host "  ML API:    http://localhost:5000" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

Set-Location $PSScriptRoot