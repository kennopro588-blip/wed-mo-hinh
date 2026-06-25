package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payment")
public class WebhookController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/webhook")
    public ResponseEntity<String> handlePayOSWebhook(@RequestBody Map<String, Object> payload) {
        try {
            System.out.println("Received Webhook from PayOS: " + payload);
            
            // Check if this is a test ping from PayOS
            if (payload.containsKey("data") && payload.get("data") == null) {
                return new ResponseEntity<>("Ping received", HttpStatus.OK);
            }

            Map<String, Object> data = (Map<String, Object>) payload.get("data");
            if (data == null || !data.containsKey("orderCode")) {
                // If it's a verification request without data, just return OK
                return new ResponseEntity<>("Webhook received (verification)", HttpStatus.OK);
            }

            Long orderId = Long.valueOf(data.get("orderCode").toString());
            
            Order order = orderService.getOrderById(orderId);
            if (order != null) {
                // Only update if the status is PAID in the webhook
                String status = data.get("status") != null ? data.get("status").toString() : "";
                if ("PAID".equalsIgnoreCase(status)) {
                    order.setPaymentStatus("PAID");
                    order.setStatus("SHIPPING");
                    orderService.saveOrder(order);
                    System.out.println("Order #" + orderId + " marked as PAID");
                }
                return new ResponseEntity<>("Success", HttpStatus.OK);
            }
            return new ResponseEntity<>("Order not found", HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("Webhook Error: " + e.getMessage());
            // Return 200 OK even on some errors to prevent PayOS from retrying too much, 
            // but for now 200 during verification is key.
            return new ResponseEntity<>("Handled with note: " + e.getMessage(), HttpStatus.OK);
        }
    }
}
