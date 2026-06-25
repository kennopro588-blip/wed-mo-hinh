# Delete old products (Assuming IDs 1, 2, 3 from previous seed)
$idsToDelete = @(1, 2, 3, 4, 5, 6, 7)
foreach ($id in $idsToDelete) {
    try {
        Invoke-RestMethod -Uri "http://localhost:8900/api/catalog/admin/products/$id" -Method Delete
    } catch {
        # Ignore if not found
    }
}

$products = @(
    @{
        productName = "Hot Toys Iron Man Mark LXXXV (1/6 Scale)"
        price = 450.00
        discription = "Authentic and detailed likeness of Iron Man in Avengers: Endgame."
        category = "Action Figures"
        availability = 15
    },
    @{
        productName = "PG Unleashed RX-78-2 Gundam (1/60 Scale)"
        price = 350.00
        discription = "The ultimate Gunpla building experience with advanced inner frame."
        category = "Model Kits"
        availability = 25
    },
    @{
        productName = "Prime 1 Studio Batman (1/3 Scale Resin)"
        price = 1200.00
        discription = "Museum masterline premium resin statue of the Dark Knight."
        category = "Statues"
        availability = 5
    },
    @{
        productName = "Bandai Metal Build Evangelion Unit-01"
        price = 280.00
        discription = "Die-cast metal frame with incredible articulation and detail."
        category = "Action Figures"
        availability = 40
    }
)

foreach ($product in $products) {
    $json = $product | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:8900/api/catalog/admin/products" -Method Post -Body $json -ContentType "application/json"
    Write-Host "Added: $($product.productName)" -ForegroundColor Green
}
