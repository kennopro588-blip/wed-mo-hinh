package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Review;
import com.rainbowforest.productcatalogservice.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@RestController
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @GetMapping("/reviews/{productId}")
    public ResponseEntity<List<Review>> getReviewsByProduct(@PathVariable Long productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);
        return new ResponseEntity<List<Review>>(reviews, HttpStatus.OK);
    }

    @PostMapping("/reviews")
    public ResponseEntity<Review> addReview(@RequestBody Review review) {
        if (review.getDate() == null || review.getDate().isEmpty()) {
            SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");
            review.setDate(formatter.format(new Date()));
        }
        if (review.getIsBought() == null) {
            review.setIsBought(true); // default to true for testing
        }
        
        Review savedReview = reviewRepository.save(review);
        return new ResponseEntity<Review>(savedReview, HttpStatus.CREATED);
    }
}
