package com.rainbowforest.userservice.config;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserRole;
import com.rainbowforest.userservice.repository.UserRepository;
import com.rainbowforest.userservice.repository.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Override
    public void run(String... args) throws Exception {
        // Create ADMIN role if it doesn't exist
        UserRole adminRole = null;
        for (UserRole role : userRoleRepository.findAll()) {
            if ("ADMIN".equals(role.getRoleName())) {
                adminRole = role;
                break;
            }
        }

        if (adminRole == null) {
            adminRole = new UserRole();
            adminRole.setRoleName("ADMIN");
            adminRole = userRoleRepository.save(adminRole);
            System.out.println("Created ADMIN role.");
        }

        // Create admin user if it doesn't exist
        User existingAdmin = userRepository.findByUserName("admin");
        if (existingAdmin == null) {
            User adminUser = new User();
            adminUser.setUserName("admin");
            adminUser.setUserPassword("123");
            adminUser.setActive(1);
            adminUser.setRole(adminRole);
            userRepository.save(adminUser);
            System.out.println("Created admin account (admin / 123) with ADMIN role.");
        }
    }
}
