package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.dto.ChatRequest;
import com.rainbowforest.productcatalogservice.dto.ChatResponse;
import com.rainbowforest.productcatalogservice.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*") // Allows the React frontend to call this API
public class ChatbotController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        String aiResponse = geminiService.chatWithBot(request.getMessage());
        return ResponseEntity.ok(new ChatResponse(aiResponse));
    }
}
