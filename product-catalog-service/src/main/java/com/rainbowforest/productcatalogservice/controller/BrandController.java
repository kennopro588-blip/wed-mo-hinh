package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Brand;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.BrandServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import javax.servlet.http.HttpServletRequest;

@RestController
public class BrandController {

    @Autowired
    private BrandServiceImpl brandService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping(value = "/brands")
    public ResponseEntity<List<Brand>> getAllBrands() {
        List<Brand> brands = brandService.getAllBrands();
        if (!brands.isEmpty()) {
            return new ResponseEntity<List<Brand>>(
                    brands,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<List<Brand>>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @PostMapping(value = "/brands")
    public ResponseEntity<Brand> addBrand(@RequestBody Brand brand, HttpServletRequest request) {
        try {
            Brand newBrand = brandService.addBrand(brand);
            return new ResponseEntity<Brand>(
                    newBrand,
                    headerGenerator.getHeadersForSuccessPostMethod(request, newBrand.getId()),
                    HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<Brand>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(value = "/brands/{id}")
    public ResponseEntity<Brand> updateBrand(@PathVariable("id") Long id, @RequestBody Brand brandDetails) {
        Brand existingBrand = brandService.getBrandById(id);
        if (existingBrand == null) {
            return new ResponseEntity<Brand>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.NOT_FOUND);
        }
        existingBrand.setBrandName(brandDetails.getBrandName());
        existingBrand.setLogoUrl(brandDetails.getLogoUrl());
        Brand updatedBrand = brandService.addBrand(existingBrand);
        return new ResponseEntity<Brand>(
                updatedBrand,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    @DeleteMapping(value = "/brands/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable("id") Long id) {
        Brand brand = brandService.getBrandById(id);
        if (brand == null) {
            return new ResponseEntity<Void>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.NOT_FOUND);
        }
        brandService.deleteBrand(id);
        return new ResponseEntity<Void>(
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }
}
