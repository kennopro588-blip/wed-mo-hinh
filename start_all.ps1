# Start all microservices and frontend for E-commerce project

Write-Host "Starting Eureka Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:JAVA_HOME='C:\Program Files\Java\jdk-11'; cd eureka-server; .\mvnw spring-boot:run"
Start-Sleep -Seconds 15

Write-Host "Starting Microservices..." -ForegroundColor Cyan
$services = @("user-service", "order-service", "product-catalog-service", "product-recommendation-service", "api-gateway")

foreach ($service in $services) {
    Write-Host "Launching $service..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:JAVA_HOME='C:\Program Files\Java\jdk-11'; cd $service; .\mvnw spring-boot:run"
}

Write-Host "Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm.cmd start"

Write-Host "All services have been launched in separate windows." -ForegroundColor Green
Write-Host "Eureka Dashboard: http://localhost:8761"
Write-Host "Frontend: http://localhost:3000"
