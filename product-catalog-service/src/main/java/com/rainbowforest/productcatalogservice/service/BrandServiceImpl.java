package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.Brand;
import com.rainbowforest.productcatalogservice.repository.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class BrandServiceImpl {

    @Autowired
    private BrandRepository brandRepository;

    public List<Brand> getAllBrands() { return brandRepository.findAll(); }
    public Brand getBrandById(Long id) { return brandRepository.findById(id).orElse(null); }
    public Brand addBrand(Brand brand) { return brandRepository.save(brand); }
    public void deleteBrand(Long id) { brandRepository.deleteById(id); }
}
