# Script to add 30 diverse products to the e-commerce database via API Gateway

$apiGatewayUrl = "http://localhost:8900/api/catalog/admin/products"

$products = @(
    # --- ANIME ---
    @{
        productName = "Monkey D. Luffy Gear 5 Statue (1/6 Scale)"
        price = 250.00
        discription = "Luffy in his divine Gear 5 form with incredible cloud effects."
        category = "Anime"
        availability = 10
        imageUrl = "https://images.collection-shop.com/luffy-gear-5.jpg"
    },
    @{
        productName = "Naruto Uzumaki Kurama Link Mode"
        price = 180.00
        discription = "NARUTO Kizuna Relation FiguartsZero with vibrant energy effects."
        category = "Anime"
        availability = 20
        imageUrl = "https://images.collection-shop.com/naruto-kurama.jpg"
    },
    @{
        productName = "Zoro Roronoa Three-Sword Style (Wano Arc)"
        price = 220.00
        discription = "Zoro wielding Enma in a dynamic combat pose."
        category = "Anime"
        availability = 15
        imageUrl = "https://images.collection-shop.com/zoro-wano.jpg"
    },
    @{
        productName = "Nezuko Kamado Blood Demon Art"
        price = 160.00
        discription = "Beautifully crafted Nezuko with pink flame effects."
        category = "Anime"
        availability = 30
        imageUrl = "https://images.collection-shop.com/nezuko.jpg"
    },
    @{
        productName = "Son Goku Ultra Instinct (Mastered)"
        price = 190.00
        discription = "Goku with silver hair and aura effects from Dragon Ball Super."
        category = "Anime"
        availability = 25
        imageUrl = "https://images.collection-shop.com/goku-ui.jpg"
    },
    
    # --- MARVEL ---
    @{
        productName = "Iron Man Mark LXXXV Avengers: Endgame"
        price = 450.00
        discription = "Hot Toys 1/6 scale figure with nano-gauntlet and light-up features."
        category = "Marvel"
        availability = 8
        imageUrl = "https://images.collection-shop.com/ironman-mk85.jpg"
    },
    @{
        productName = "Spider-Man (Integrated Suit)"
        price = 280.00
        discription = "From No Way Home, featuring the golden spider emblem."
        category = "Marvel"
        availability = 12
        imageUrl = "https://images.collection-shop.com/spiderman-iwh.jpg"
    },
    @{
        productName = "Thanos Infinity Gauntlet Statue"
        price = 850.00
        discription = "Sideshow Premium Format Figure with LED Infinity Stones."
        category = "Marvel"
        availability = 5
        imageUrl = "https://images.collection-shop.com/thanos-statue.jpg"
    },
    @{
        productName = "Captain America (Mjolnir Edition)"
        price = 320.00
        discription = "Steve Rogers holding both the shield and Thor's hammer."
        category = "Marvel"
        availability = 15
        imageUrl = "https://images.collection-shop.com/cap-mjolnir.jpg"
    },
    @{
        productName = "Black Widow (Snow Suit)"
        price = 240.00
        discription = "Highly detailed figure from her solo movie adventure."
        category = "Marvel"
        availability = 18
        imageUrl = "https://images.collection-shop.com/black-widow.jpg"
    },

    # --- DC ---
    @{
        productName = "Batman (The Dark Knight) 1/4 Scale"
        price = 600.00
        discription = "Prime 1 Studio masterpiece of the Christian Bale Batman."
        category = "DC"
        availability = 4
        imageUrl = "https://images.collection-shop.com/batman-tdk.jpg"
    },
    @{
        productName = "The Joker (Heath Ledger Edition)"
        price = 550.00
        discription = "Museum quality head sculpt with tailored fabric clothing."
        category = "DC"
        availability = 6
        imageUrl = "https://images.collection-shop.com/joker-ledger.jpg"
    },
    @{
        productName = "Wonder Woman (Golden Armor)"
        price = 380.00
        discription = "WW84 edition with massive metallic wings."
        category = "DC"
        availability = 10
        imageUrl = "https://images.collection-shop.com/ww-gold.jpg"
    },
    @{
        productName = "Superman (Man of Steel)"
        price = 290.00
        discription = "Henry Cavill likeness with detailed texture suit."
        category = "DC"
        availability = 14
        imageUrl = "https://images.collection-shop.com/superman-mos.jpg"
    },
    @{
        productName = "Aquaman (Justice League)"
        price = 310.00
        discription = "Featuring the Five-Pronged Trident and scaled armor."
        category = "DC"
        availability = 11
        imageUrl = "https://images.collection-shop.com/aquaman.jpg"
    },

    # --- GUNDAM / MECHA ---
    @{
        productName = "PG Unleashed RX-78-2 Gundam"
        price = 350.00
        discription = "The highest level of Gunpla engineering in 1/60 scale."
        category = "Gundam"
        availability = 20
        imageUrl = "https://images.collection-shop.com/pgu-rx78.jpg"
    },
    @{
        productName = "MG Wing Gundam Zero EW Ver.Ka"
        price = 85.00
        discription = "Iconic angelic wings with neo-bird mode transformation."
        category = "Gundam"
        availability = 25
        imageUrl = "https://images.collection-shop.com/mg-wing-zero.jpg"
    },
    @{
        productName = "Metal Build Gundam Exia"
        price = 280.00
        discription = "Die-cast metal parts for ultimate weight and stability."
        category = "Gundam"
        availability = 15
        imageUrl = "https://images.collection-shop.com/mb-exia.jpg"
    },
    @{
        productName = "RG Hi-Nu Gundam"
        price = 65.00
        discription = "Real Grade detail in a compact 1/144 scale masterpiece."
        category = "Gundam"
        availability = 40
        imageUrl = "https://images.collection-shop.com/rg-hinu.jpg"
    },
    @{
        productName = "PG Gundam Astray Red Frame"
        price = 300.00
        discription = "Features the 'Gerbera Straight' katana and LED head eyes."
        category = "Gundam"
        availability = 12
        imageUrl = "https://images.collection-shop.com/pg-astray.jpg"
    },

    # --- MORE ANIME ---
    @{
        productName = "Saitama (One Punch Man) 1/4 Scale"
        price = 420.00
        discription = "Serious Punch pose with crumbling terrain base."
        category = "Anime"
        availability = 7
        imageUrl = "https://images.collection-shop.com/saitama.jpg"
    },
    @{
        productName = "Rem & Ram Twins Set"
        price = 340.00
        discription = "Matching maid outfit statues from Re:Zero."
        category = "Anime"
        availability = 10
        imageUrl = "https://images.collection-shop.com/rem-ram.jpg"
    },
    @{
        productName = "Eren Yeager Titan Form Statue"
        price = 500.00
        discription = "Attack on Titan final season edition statue."
        category = "Anime"
        availability = 5
        imageUrl = "https://images.collection-shop.com/eren-titan.jpg"
    },
    @{
        productName = "Kakashi Hatake (Lightning Blade)"
        price = 210.00
        discription = "Chidori effect with interchangeable Mangekyou Sharingan head."
        category = "Anime"
        availability = 15
        imageUrl = "https://images.collection-shop.com/kakashi.jpg"
    },
    @{
        productName = "Edward Elric (Alchemy Unleashed)"
        price = 195.00
        discription = "Fullmetal Alchemist brotherhood premium statue."
        category = "Anime"
        availability = 22
        imageUrl = "https://images.collection-shop.com/edward.jpg"
    },

    # --- MORE MIXED ---
    @{
        productName = "Predator (Jungle Hunter)"
        price = 480.00
        discription = "Hot Toys 1/6 scale with light-up shoulder cannon."
        category = "Movie"
        availability = 6
        imageUrl = "https://images.collection-shop.com/predator.jpg"
    },
    @{
        productName = "Terminator T-800 Endoskeleton"
        price = 520.00
        discription = "Chrome plated metal parts with glowing red eyes."
        category = "Movie"
        availability = 9
        imageUrl = "https://images.collection-shop.com/t800.jpg"
    },
    @{
        productName = "Optimus Prime (Bumblebee Movie)"
        price = 450.00
        discription = "ThreeZero premium scale highly articulated mecha."
        category = "Mecha"
        availability = 8
        imageUrl = "https://images.collection-shop.com/optimus.jpg"
    },
    @{
        productName = "Darth Vader (Empire Strikes Back)"
        price = 330.00
        discription = "Electronic breathing sound effects and light-up belt."
        category = "Sci-Fi"
        availability = 20
        imageUrl = "https://images.collection-shop.com/vader.jpg"
    },
    @{
        productName = "Geralt of Rivia (The Witcher 3)"
        price = 400.00
        discription = "Grandmaster Feline armor with silver and steel swords."
        category = "Gaming"
        availability = 11
        imageUrl = "https://images.collection-shop.com/geralt.jpg"
    }
)

Write-Host "Starting to add 30 products to the database..." -ForegroundColor Cyan

foreach ($product in $products) {
    $json = $product | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri $apiGatewayUrl -Method Post -Body $json -ContentType "application/json"
        Write-Host "Successfully added: $($product.productName)" -ForegroundColor Green
    } catch {
        Write-Host "Failed to add: $($product.productName). Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Finished adding products." -ForegroundColor Cyan
