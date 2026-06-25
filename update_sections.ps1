# Script to update product sections for testing the new layout

$apiGatewayUrl = "http://localhost:8900/api/catalog/products"

# Fetch all products to get their IDs
try {
    $allProducts = Invoke-RestMethod -Uri "http://localhost:8900/api/catalog/products" -Method Get
    Write-Host "Found $($allProducts.length) products." -ForegroundColor Cyan

    # Assign sections to products
    # 1-10: Exclusive
    # 11-15: Best Selling
    # 16-20: New Arrivals
    # Rest: Normal

    for ($i = 0; $i -lt $allProducts.length; $i++) {
        $product = $allProducts[$i]
        $section = "Normal"
        
        if ($i -lt 10) { $section = "Exclusive" }
        elseif ($i -lt 15) { $section = "Best Selling" }
        elseif ($i -lt 20) { $section = "New Arrivals" }
        
        $payload = @{
            id = $product.id
            productName = $product.productName
            price = $product.price
            discription = $product.discription
            category = $product.category
            availability = $product.availability
            imageUrl = $product.imageUrl
            imageUrl2 = $product.imageUrl2
            discountPercent = $product.discountPercent
            section = $section
        }

        $json = $payload | ConvertTo-Json
        Invoke-RestMethod -Uri "$apiGatewayUrl/$($product.id)" -Method Put -Body $json -ContentType "application/json"
        Write-Host "Updated Product $($product.id) to section: $section" -ForegroundColor Green
    }

} catch {
    Write-Host "Error updating products: $($_.Exception.Message)" -ForegroundColor Red
}
