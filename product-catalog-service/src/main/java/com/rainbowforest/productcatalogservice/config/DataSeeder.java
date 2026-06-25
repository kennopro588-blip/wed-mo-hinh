package com.rainbowforest.productcatalogservice.config;

import com.rainbowforest.productcatalogservice.entity.Brand;
import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.repository.BrandRepository;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        if (brandRepository.count() == 0) {
            List<Brand> brands = Arrays.asList(
                new Brand("Bandai", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Bandai_logo.svg/1024px-Bandai_logo.svg.png"),
                new Brand("Hot Toys", "https://th.bing.com/th/id/OIP.X9q6Xm06m1_2Y0_40_40_40_40?rs=1&pid=ImgDetMain"),
                new Brand("LEGO", "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/LEGO_logo.svg/2048px-LEGO_logo.svg.png"),
                new Brand("Kotobukiya", "https://th.bing.com/th/id/OIP.U8nO2Xf0P_S_K0m0m0m0m0?rs=1&pid=ImgDetMain"),
                new Brand("Banpresto", "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Banpresto_logo.svg/1200px-Banpresto_logo.svg.png")
            );
            brandRepository.saveAll(brands);
            System.out.println("Brands seeded successfully!");
        }

        // Assign brands to products that don't have one
        List<Product> products = productRepository.findAll();
        List<Brand> allBrands = brandRepository.findAll();
        
        if (!allBrands.isEmpty()) {
            Random random = new Random();
            boolean updated = false;
            for (Product product : products) {
                if (product.getBrand() == null || product.getBrand().isEmpty()) {
                    String randomBrand = allBrands.get(random.nextInt(allBrands.size())).getBrandName();
                    product.setBrand(randomBrand);
                    updated = true;
                }
            }
            if (updated) {
                productRepository.saveAll(products);
                System.out.println("Product brands updated successfully!");
            }
        }
    }
}
