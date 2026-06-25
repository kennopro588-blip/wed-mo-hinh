package com.rainbowforest.productcatalogservice.util;

import com.rainbowforest.productcatalogservice.entity.Brand;
import com.rainbowforest.productcatalogservice.repository.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class CheckBrands implements CommandLineRunner {
    @Autowired
    private BrandRepository brandRepository;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("CURRENT BRANDS IN DB:");
        brandRepository.findAll().forEach(b -> System.out.println(" - " + b.getBrandName()));
    }
}
