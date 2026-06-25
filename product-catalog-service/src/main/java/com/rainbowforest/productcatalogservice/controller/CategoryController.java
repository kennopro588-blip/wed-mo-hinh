package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Category;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import javax.servlet.http.HttpServletRequest;

@RestController
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping(value = "/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        if (!categories.isEmpty()) {
            return new ResponseEntity<List<Category>>(
                    categories,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<List<Category>>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @PostMapping(value = "/categories")
    public ResponseEntity<Category> addCategory(@RequestBody Category category, HttpServletRequest request) {
        try {
            Category newCategory = categoryService.addCategory(category);
            return new ResponseEntity<Category>(
                    newCategory,
                    headerGenerator.getHeadersForSuccessPostMethod(request, newCategory.getId()),
                    HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<Category>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(value = "/categories/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable("id") Long id, @RequestBody Category categoryDetails) {
        Category existingCategory = categoryService.getCategoryById(id);
        if (existingCategory == null) {
            return new ResponseEntity<Category>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.NOT_FOUND);
        }
        existingCategory.setCategoryName(categoryDetails.getCategoryName());
        existingCategory.setImageUrl(categoryDetails.getImageUrl());
        Category updatedCategory = categoryService.addCategory(existingCategory);
        return new ResponseEntity<Category>(
                updatedCategory,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    @DeleteMapping(value = "/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable("id") Long id) {
        Category category = categoryService.getCategoryById(id);
        if (category == null) {
            return new ResponseEntity<Void>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.NOT_FOUND);
        }
        categoryService.deleteCategory(id);
        return new ResponseEntity<Void>(
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }
}
