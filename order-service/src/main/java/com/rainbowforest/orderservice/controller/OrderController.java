package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.domain.User;
import com.rainbowforest.orderservice.feignclient.UserClient;
import com.rainbowforest.orderservice.http.header.HeaderGenerator;
import com.rainbowforest.orderservice.service.CartService;
import com.rainbowforest.orderservice.service.OrderService;
import com.rainbowforest.orderservice.service.VNPayService;
import com.rainbowforest.orderservice.utilities.OrderUtilities;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

@RestController
public class OrderController {

    @Autowired
    private UserClient userClient;

    @Autowired
    private OrderService orderService;

    @Autowired
    private CartService cartService;

    @Autowired
    private VNPayService vnPayService;


    @Autowired
    private HeaderGenerator headerGenerator;
    
    @PostMapping(value = "/order/{userId}")
    public ResponseEntity<Order> saveOrder(
    		@PathVariable("userId") Long userId,
    		@RequestHeader(value = "Cookie") String cartId,
            @RequestParam("paymentMethod") String paymentMethod,
    		HttpServletRequest request){
    	
        List<Item> cart = cartService.getAllItemsFromCart(cartId);
        User user = userClient.getUserById(userId);   
        if(cart != null && user != null) {
        	Order order = this.createOrder(cart, user, paymentMethod);
        	try{
                orderService.saveOrder(order);
                cartService.deleteCart(cartId);
                return new ResponseEntity<Order>(
                		order, 
                		headerGenerator.getHeadersForSuccessPostMethod(request, order.getId()),
                		HttpStatus.CREATED);
            }catch (Exception ex){
                ex.printStackTrace();
                return new ResponseEntity<Order>(
                		headerGenerator.getHeadersForError(),
                		HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
  
        return new ResponseEntity<Order>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }

    @PostMapping(value = "/order/vnpay/create-url")
    public ResponseEntity<String> createVNPayUrl(
            @RequestParam("amount") int amount,
            @RequestParam("orderInfo") String orderInfo) {
        String paymentUrl = vnPayService.createOrder(amount, orderInfo, "");
        return new ResponseEntity<>(paymentUrl, HttpStatus.OK);
    }


    @GetMapping(value = "/order/{orderId}/status")
    public ResponseEntity<String> getOrderStatus(@PathVariable("orderId") Long orderId) {
        Order order = orderService.getOrderById(orderId);
        if (order != null) {
            return new ResponseEntity<>(order.getPaymentStatus(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    
    private Order createOrder(List<Item> cart, User user, String paymentMethod) {
        Order order = new Order();
        order.setItems(cart);
        order.setUser(user);
        order.setTotal(OrderUtilities.countTotalPrice(cart));
        order.setOrderedDate(LocalDate.now());
        order.setStatus("PROCESSING");
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus("PENDING");
        return order;
    }
}
