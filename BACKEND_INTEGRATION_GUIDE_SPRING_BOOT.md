# Backend Integration Guide - Spring Boot

This guide provides complete instructions for implementing a Spring Boot backend for the Inventory Management System.

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Data Models](#data-models)
3. [API Endpoints](#api-endpoints)
4. [Authentication](#authentication)
5. [Step-by-Step Implementation](#step-by-step-implementation)
6. [File Modifications](#file-modifications)
7. [Database Schema](#database-schema)
8. [Testing](#testing)

---

## 🎯 System Overview

The Inventory Management System consists of:
- **Authentication System** - User login/logout/registration
- **Inventory Management** - CRUD operations for products
- **Role-based Access** - Admin vs User permissions
- **Data Analytics** - Stats and reporting

---

## 📊 Data Models

### User Entity
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.USER;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Getters and Setters
}

public enum UserRole {
    ADMIN, USER
}
```

### Product Entity
```java
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(unique = true, nullable = false)
    private String sku;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(nullable = false)
    private BigDecimal price;
    
    @Column(nullable = false)
    private String category;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String image;
    
    @Column(nullable = false)
    private Boolean availability = true;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Getters and Setters
}
```

---

## 🔌 API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
```java
// Request Body
{
  "username": "string",
  "password": "string",
  "name": "string",
  "role": "string" // optional, defaults to "USER"
}

// Response
{
  "success": true,
  "user": UserObject,
  "error": "string" // optional
}
```

#### POST /api/auth/login
```java
// Request Body
{
  "username": "string",
  "password": "string"
}

// Response
{
  "success": true,
  "user": UserObject,
  "token": "string",
  "error": "string" // optional
}
```

#### POST /api/auth/logout
```java
// Headers
Authorization: Bearer <token>

// Response
{
  "success": true,
  "message": "string"
}
```

#### GET /api/auth/me
```java
// Headers
Authorization: Bearer <token>

// Response
{
  "success": true,
  "user": UserObject,
  "error": "string" // optional
}
```

### Inventory Endpoints

#### GET /api/inventory
```java
// Headers
Authorization: Bearer <token>

// Query Parameters (optional)
?search=string&category=string

// Response
{
  "success": true,
  "items": ProductArray,
  "error": "string" // optional
}
```

#### POST /api/inventory
```java
// Headers
Authorization: Bearer <token>
Content-Type: application/json

// Request Body
{
  "name": "string",
  "sku": "string",
  "quantity": 10,
  "price": 99.99,
  "category": "string",
  "description": "string",
  "image": "string" // optional
}

// Response
{
  "success": true,
  "item": ProductObject,
  "error": "string" // optional
}
```

#### GET /api/inventory/{id}
```java
// Headers
Authorization: Bearer <token>

// Response
{
  "success": true,
  "item": ProductObject,
  "error": "string" // optional
}
```

#### PUT /api/inventory/{id}
```java
// Headers
Authorization: Bearer <token>
Content-Type: application/json

// Request Body
{
  "name": "string", // optional
  "sku": "string", // optional
  "quantity": 10, // optional
  "price": 99.99, // optional
  "category": "string", // optional
  "description": "string", // optional
  "image": "string" // optional
}

// Response
{
  "success": true,
  "item": ProductObject,
  "error": "string" // optional
}
```

#### DELETE /api/inventory/{id}
```java
// Headers
Authorization: Bearer <token>

// Response
{
  "success": true,
  "message": "string",
  "error": "string" // optional
}
```

---

## 🔐 Authentication

### JWT Token Structure
```java
{
  "userId": "number",
  "username": "string",
  "role": "string",
  "iat": "number",
  "exp": "number"
}
```

### Authorization Headers
```
Authorization: Bearer <jwt_token>
```

### Role-based Access
- **Admin**: Full access to all endpoints
- **User**: Read-only access to inventory, no CRUD operations

---

## 🚀 Step-by-Step Implementation

### Step 1: Create Spring Boot Project

#### Using Spring Initializr
```bash
# Create project with dependencies:
- Spring Web
- Spring Data JPA
- Spring Security
- JWT (io.jsonwebtoken:jjwt-api)
- PostgreSQL Driver (or H2 for development)
- Validation
- Lombok
```

#### Maven Dependencies
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

### Step 2: Application Properties

#### application.properties
```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/inventory_management
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT Configuration
jwt.secret=mySuperSecretKey123456789012345678901234567890
jwt.expiration=86400000 # 24 hours in milliseconds

# CORS Configuration
cors.allowed-origins=http://localhost:3000
```

### Step 3: Create Entities

#### User.java
```java
package com.inventory.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.USER;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

enum UserRole {
    ADMIN, USER
}
```

#### Product.java
```java
package com.inventory.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(unique = true, nullable = false)
    private String sku;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(nullable = false)
    private BigDecimal price;
    
    @Column(nullable = false)
    private String category;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String image;
    
    @Column(nullable = false)
    private Boolean availability = true;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
```

### Step 4: Create Repositories

#### UserRepository.java
```java
package com.inventory.repository;

import com.inventory.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
}
```

#### ProductRepository.java
```java
package com.inventory.repository;

import com.inventory.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    @Query("SELECT p FROM Product p WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:category IS NULL OR :category = '' OR p.category = :category)")
    List<Product> findBySearchAndCategory(@Param("search") String search, 
                                         @Param("category") String category);
}
```

### Step 5: JWT Configuration

#### JwtService.java
```java
package com.inventory.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(getSigningKey())
                .parseClaimsJws(token)
                .getBody();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
}
```

### Step 6: Security Configuration

#### JwtAuthenticationFilter.java
```java
package com.inventory.security;

import com.inventory.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        username = jwtService.extractUsername(jwt);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            
            if (jwtService.validateToken(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
```

#### SecurityConfig.java
```java
package com.inventory.config;

import com.inventory.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors().configurationSource(corsConfigurationSource())
            .and()
            .csrf().disable()
            .authorizeHttpRequests()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/inventory/**").hasAnyRole("ADMIN", "USER")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            .and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

### Step 7: Service Classes

#### AuthService.java
```java
package com.inventory.service;

import com.inventory.entity.User;
import com.inventory.repository.UserRepository;
import com.inventory.security.JwtUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public Map<String, Object> register(String username, String password, String name, String role) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setName(name);
        user.setRole(role != null ? User.Role.valueOf(role.toUpperCase()) : User.Role.USER);

        userRepository.save(user);

        String token = jwtService.generateToken(new JwtUserDetails(user));
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", createUserResponse(user));
        response.put("token", token);
        
        return response;
    }

    public Map<String, Object> login(String username, String password) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(username, password)
        );

        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(new JwtUserDetails(user));
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", createUserResponse(user));
        response.put("token", token);
        
        return response;
    }

    private Map<String, Object> createUserResponse(User user) {
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("id", user.getId());
        userResponse.put("username", user.getUsername());
        userResponse.put("name", user.getName());
        userResponse.put("role", user.getRole().toString());
        return userResponse;
    }
}
```

#### InventoryService.java
```java
package com.inventory.service;

import com.inventory.entity.Product;
import com.inventory.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository productRepository;

    public List<Product> getAllProducts(String search, String category) {
        return productRepository.findBySearchAndCategory(search, category);
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product createProduct(Product product) {
        // Check if SKU already exists
        if (productRepository.existsBySku(product.getSku())) {
            throw new RuntimeException("SKU already exists");
        }
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product productDetails) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if SKU already exists for another product
        if (!product.getSku().equals(productDetails.getSku()) && 
            productRepository.existsBySku(productDetails.getSku())) {
            throw new RuntimeException("SKU already exists");
        }

        // Update fields
        if (productDetails.getName() != null) product.setName(productDetails.getName());
        if (productDetails.getSku() != null) product.setSku(productDetails.getSku());
        if (productDetails.getQuantity() != null) product.setQuantity(productDetails.getQuantity());
        if (productDetails.getPrice() != null) product.setPrice(productDetails.getPrice());
        if (productDetails.getCategory() != null) product.setCategory(productDetails.getCategory());
        if (productDetails.getDescription() != null) product.setDescription(productDetails.getDescription());
        if (productDetails.getImage() != null) product.setImage(productDetails.getImage());
        if (productDetails.getAvailability() != null) product.setAvailability(productDetails.getAvailability());

        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        productRepository.delete(product);
    }
}
```

### Step 8: Controllers

#### AuthController.java
```java
package com.inventory.controller;

import com.inventory.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            String name = request.get("name");
            String role = request.get("role");

            Map<String, Object> result = authService.register(username, password, name, role);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, Object> error = Map.of(
                "success", false,
                "error", e.getMessage()
            );
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");

            Map<String, Object> result = authService.login(username, password);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, Object> error = Map.of(
                "success", false,
                "error", "Invalid credentials"
            );
            return ResponseEntity.status(401).body(error);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        Map<String, Object> result = Map.of(
            "success", true,
            "message", "Logged out successfully"
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@RequestParam String username) {
        // This would typically extract user from JWT token
        // For simplicity, returning a basic response
        Map<String, Object> result = Map.of(
            "success", true,
            "user", Map.of(
                "username", username,
                "role", "USER"
            )
        );
        return ResponseEntity.ok(result);
    }
}
```

#### InventoryController.java
```java
package com.inventory.controller;

import com.inventory.entity.Product;
import com.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Map<String, Object>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {
        
        try {
            List<Product> items = inventoryService.getAllProducts(search, category);
            Map<String, Object> response = Map.of(
                "success", true,
                "items", items
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = Map.of(
                "success", false,
                "error", e.getMessage()
            );
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Map<String, Object>> getProductById(@PathVariable Long id) {
        try {
            Optional<Product> product = inventoryService.getProductById(id);
            if (product.isPresent()) {
                Map<String, Object> response = Map.of(
                    "success", true,
                    "item", product.get()
                );
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> error = Map.of(
                    "success", false,
                    "error", "Product not found"
                );
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, Object> error = Map.of(
                "success", false,
                "error", e.getMessage()
            );
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createProduct(@RequestBody Product product) {
        try {
            Product createdProduct = inventoryService.createProduct(product);
            Map<String, Object> response = Map.of(
                "success", true,
                "item", createdProduct
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = Map.of(
                "success", false,
                "error", e.getMessage()
            );
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateProduct(
            @PathVariable Long id, 
            @RequestBody Product product) {
        try {
            Product updatedProduct = inventoryService.updateProduct(id, product);
            Map<String, Object> response = Map.of(
                "success", true,
                "item", updatedProduct
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = Map.of(
                "success", false,
                "error", e.getMessage()
            );
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteProduct(@PathVariable Long id) {
        try {
            inventoryService.deleteProduct(id);
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Product deleted successfully"
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = Map.of(
                "success", false,
                "error", e.getMessage()
            );
            return ResponseEntity.badRequest().body(error);
        }
    }
}
```

---

## 📝 File Modifications

### 1. Update AuthContext.js

**File:** `src/contexts/AuthContext.js`

**Replace the existing functions with:**

```javascript
// Login function
const login = async (username, password) => {
  setLoading(true);
  try {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      setCurrentUser(data.user);
      return { success: true };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Login failed:', error);
    return { success: false, error: error.message };
  } finally {
    setLoading(false);
  }
};

// Logout function
const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

// Register function
const register = async (userData) => {
  setLoading(true);
  try {
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error: error.message };
  } finally {
    setLoading(false);
  }
};
```

### 2. Update InventoryContext.js

**File:** `src/contexts/InventoryContext.js`

**Replace the existing functions with:**

```javascript
// Fetch items
const fetchItems = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8080/api/inventory', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (data.success) {
      setItems(data.items);
    } else {
      console.error('Failed to fetch items:', data.error);
    }
  } catch (error) {
    console.error('Failed to fetch items:', error);
  } finally {
    setLoading(false);
  }
};

// Add item
const addItem = async (itemData) => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8080/api/inventory', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(itemData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      setItems(prev => [...prev, data.item]);
      return { success: true, item: data.item };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Failed to add item:', error);
    return { success: false, error: error.message };
  } finally {
    setLoading(false);
  }
};

// Update item
const updateItem = async (id, itemData) => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:8080/api/inventory/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(itemData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      setItems(prev => prev.map(item => 
        item.id === id ? data.item : item
      ));
      return { success: true, item: data.item };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Failed to update item:', error);
    return { success: false, error: error.message };
  } finally {
    setLoading(false);
  }
};

// Delete item
const deleteItem = async (id) => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:8080/api/inventory/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (data.success) {
      setItems(prev => prev.filter(item => item.id !== id));
      return { success: true };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Failed to delete item:', error);
    return { success: false, error: error.message };
  } finally {
    setLoading(false);
  }
};
```

---

## 🗄️ Database Schema

### PostgreSQL Tables

#### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(10) DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Products Table
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(500),
  availability BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧪 Testing

### 1. Test Authentication

```bash
# Register admin user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","name":"Admin User","role":"ADMIN"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 2. Test Inventory API

```bash
# Get all products (requires token)
curl -X GET http://localhost:8080/api/inventory \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Add product (admin only)
curl -X POST http://localhost:8080/api/inventory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"Test Product","sku":"TEST-001","quantity":10,"price":99.99,"category":"Test","description":"Test product"}'
```

---

## 🔄 Migration Steps

1. **Backup existing data** from localStorage
2. **Set up PostgreSQL database**
3. **Create Spring Boot project** with required dependencies
4. **Implement entities** and repositories
5. **Configure Spring Security** with JWT
6. **Implement controllers** and services
7. **Update frontend** API calls
8. **Test all functionality**
9. **Migrate existing data** to PostgreSQL
10. **Deploy to production**

---

## 🚀 Quick Start Checklist

- [ ] Create Spring Boot project with required dependencies
- [ ] Set up PostgreSQL database
- [ ] Create User and Product entities
- [ ] Implement repositories and services
- [ ] Configure Spring Security with JWT
- [ ] Create authentication and inventory controllers
- [ ] Update frontend API calls to use Spring Boot endpoints
- [ ] Test all API endpoints
- [ ] Deploy and test

---

## 📞 Support

For any issues during implementation:
1. Check Spring Boot application logs
2. Verify database connections
3. Check CORS configuration
4. Validate JWT tokens
5. Review error responses in browser dev tools

This guide provides everything needed to successfully implement a Spring Boot backend for your Inventory Management System! 🚀
