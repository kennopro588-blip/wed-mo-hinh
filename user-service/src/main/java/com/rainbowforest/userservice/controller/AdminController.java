package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller; // Dùng Controller để điều hướng trang
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    /**
     * 1. TRANG GIAO DIỆN QUẢN TRỊ
     * URL: http://localhost:8811/admin/users
     */
    @GetMapping("/users")
    public String listUsersPage(Model model) {
        // Lấy dữ liệu từ MySQL (Lưu ý Laragon của bạn phải đang chạy)
        List<User> users = userRepository.findAll(); 
        model.addAttribute("listUsers", users);
        
        // Trả về file: src/main/resources/templates/admin-users.html
        return "admin-users"; 
    }

    /**
     * 2. API TRẢ VỀ DỮ LIỆU JSON (Để bạn test dữ liệu có hay chưa)
     * URL: http://localhost:8811/admin/api/users
     */
    @GetMapping("/api/users")
    @ResponseBody
    public List<User> listUsersJson() {
        return userRepository.findAll();
    }
}