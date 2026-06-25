# Script to seed categories with images

$apiGatewayUrl = "http://localhost:8900/api/catalog/categories"

$categories = @(
    @{
        categoryName = "Anime"
        imageUrl = "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=1000&auto=format&fit=crop"
    },
    @{
        categoryName = "Marvel"
        imageUrl = "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=1000&auto=format&fit=crop"
    },
    @{
        categoryName = "DC Multiverse"
        imageUrl = "https://images.unsplash.com/photo-1559535332-db9971090158?q=80&w=1000&auto=format&fit=crop"
    },
    @{
        categoryName = "Gundam"
        imageUrl = "https://images.unsplash.com/photo-1531693251400-38df35776dc7?q=80&w=1000&auto=format&fit=crop"
    }
)

Write-Host "Waiting for service to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

foreach ($cat in $categories) {
    $json = $cat | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri $apiGatewayUrl -Method Post -Body $json -ContentType "application/json"
        Write-Host "Added category: $($cat.categoryName)" -ForegroundColor Green
    } catch {
        Write-Host "Failed to add category: $($cat.categoryName). Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
