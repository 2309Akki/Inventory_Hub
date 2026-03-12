# Backend Logging System Guide - Spring Boot

This guide provides complete implementation for user activity logging and inventory transaction tracking using Spring Boot.

---

## 📊 Logging System Overview

### **🎯 What We'll Track:**

**👤 User Activity Logs:**
- Login attempts (success/failure)
- Logout events
- Registration attempts
- Profile updates
- Password changes

**📦 Inventory Transaction Logs:**
- Product creation
- Product updates
- Product deletions
- Quantity changes
- Price modifications
- Category changes

**🔒 Security Logs:**
- Failed login attempts
- Unauthorized access attempts
- Token validation failures
- IP address tracking
- Browser/device information

---

## 🗄️ Database Schema for Logging

### **1. User Activity Logs Table**

```sql
CREATE TABLE user_activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    username VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'login', 'logout', 'register', 'profile_update'
    status VARCHAR(20) NOT NULL, -- 'success', 'failure', 'warning'
    ip_address VARCHAR(45),
    user_agent TEXT,
    browser VARCHAR(100),
    device_type VARCHAR(50),
    operating_system VARCHAR(100),
    location_country VARCHAR(100),
    location_city VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT, -- JSON as TEXT for PostgreSQL compatibility
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_timestamp ON user_activity_logs(timestamp);
CREATE INDEX idx_user_activity_logs_action ON user_activity_logs(action);
```

### **2. Inventory Transaction Logs Table**

```sql
CREATE TABLE inventory_transaction_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    username VARCHAR(100) NOT NULL,
    product_id BIGINT NOT NULL,
    product_sku VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'quantity_change', 'price_change'
    action VARCHAR(100) NOT NULL, -- 'add_item', 'edit_item', 'delete_item', 'update_quantity', 'update_price'
    
    -- Before/After values for tracking changes
    before_data TEXT, -- JSON as TEXT for PostgreSQL compatibility
    after_data TEXT,  -- JSON as TEXT for PostgreSQL compatibility
    
    -- Specific field changes
    changed_fields TEXT, -- Comma-separated field names
    field_changes TEXT,  -- JSON as TEXT for PostgreSQL compatibility
    
    -- Metadata
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Indexes for performance
CREATE INDEX idx_inventory_logs_user_id ON inventory_transaction_logs(user_id);
CREATE INDEX idx_inventory_logs_product_id ON inventory_transaction_logs(product_id);
CREATE INDEX idx_inventory_logs_timestamp ON inventory_transaction_logs(timestamp);
CREATE INDEX idx_inventory_logs_transaction_type ON inventory_transaction_logs(transaction_type);
```

### **3. System Logs Table**

```sql
CREATE TABLE system_logs (
    id BIGSERIAL PRIMARY KEY,
    log_level VARCHAR(20) NOT NULL, -- 'info', 'warning', 'error', 'critical'
    category VARCHAR(50) NOT NULL,  -- 'auth', 'inventory', 'system', 'security'
    message TEXT NOT NULL,
    details TEXT, -- JSON as TEXT for PostgreSQL compatibility
    ip_address VARCHAR(45),
    user_agent TEXT,
    user_id BIGINT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_system_logs_level ON system_logs(log_level);
CREATE INDEX idx_system_logs_category ON system_logs(category);
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp);
```

---

## 🔧 Logging Implementation (Spring Boot)

### **1. Logging Entities**

#### UserActivityLog.java
```java
package com.inventory.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_activity_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserActivityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String action;
    
    @Column(nullable = false)
    private String status;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "user_agent")
    private String userAgent;
    
    @Column(name = "browser")
    private String browser;
    
    @Column(name = "device_type")
    private String deviceType;
    
    @Column(name = "operating_system")
    private String operatingSystem;
    
    @Column(name = "location_country")
    private String locationCountry;
    
    @Column(name = "location_city")
    private String locationCity;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(columnDefinition = "TEXT")
    private String details;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

#### InventoryTransactionLog.java
```java
package com.inventory.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transaction_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryTransactionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(nullable = false)
    private String username;
    
    @Column(name = "product_id", nullable = false)
    private Long productId;
    
    @Column(name = "product_sku", nullable = false)
    private String productSku;
    
    @Column(name = "product_name", nullable = false)
    private String productName;
    
    @Column(name = "transaction_type", nullable = false)
    private String transactionType;
    
    @Column(nullable = false)
    private String action;
    
    @Column(name = "before_data", columnDefinition = "TEXT")
    private String beforeData;
    
    @Column(name = "after_data", columnDefinition = "TEXT")
    private String afterData;
    
    @Column(name = "changed_fields")
    private String changedFields;
    
    @Column(name = "field_changes", columnDefinition = "TEXT")
    private String fieldChanges;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "user_agent")
    private String userAgent;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(name = "session_id")
    private String sessionId;
    
    @Column(name = "request_id")
    private String requestId;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

#### SystemLog.java
```java
package com.inventory.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "log_level", nullable = false)
    private String logLevel;
    
    @Column(nullable = false)
    private String category;
    
    @Column(nullable = false)
    private String message;
    
    @Column(columnDefinition = "TEXT")
    private String details;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "user_agent")
    private String userAgent;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

### **2. Logging Repositories**

#### UserActivityLogRepository.java
```java
package com.inventory.repository;

import com.inventory.entity.UserActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserActivityLogRepository extends JpaRepository<UserActivityLog, Long> {
    
    @Query("SELECT ual FROM UserActivityLog ual WHERE " +
           "(:userId IS NULL OR ual.userId = :userId) AND " +
           "(:action IS NULL OR ual.action = :action) AND " +
           "(:status IS NULL OR ual.status = :status) AND " +
           "(:startDate IS NULL OR ual.timestamp >= :startDate) AND " +
           "(:endDate IS NULL OR ual.timestamp <= :endDate) " +
           "ORDER BY ual.timestamp DESC")
    List<UserActivityLog> findByFilters(@Param("userId") Long userId,
                                       @Param("action") String action,
                                       @Param("status") String status,
                                       @Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate);
}
```

#### InventoryTransactionLogRepository.java
```java
package com.inventory.repository;

import com.inventory.entity.InventoryTransactionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryTransactionLogRepository extends JpaRepository<InventoryTransactionLog, Long> {
    
    @Query("SELECT itl FROM InventoryTransactionLog itl WHERE " +
           "(:userId IS NULL OR itl.userId = :userId) AND " +
           "(:productId IS NULL OR itl.productId = :productId) AND " +
           "(:transactionType IS NULL OR itl.transactionType = :transactionType) AND " +
           "(:startDate IS NULL OR itl.timestamp >= :startDate) AND " +
           "(:endDate IS NULL OR itl.timestamp <= :endDate) " +
           "ORDER BY itl.timestamp DESC")
    List<InventoryTransactionLog> findByFilters(@Param("userId") Long userId,
                                                @Param("productId") Long productId,
                                                @Param("transactionType") String transactionType,
                                                @Param("startDate") LocalDateTime startDate,
                                                @Param("endDate") LocalDateTime endDate);
}
```

#### SystemLogRepository.java
```java
package com.inventory.repository;

import com.inventory.entity.SystemLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {
    
    @Query("SELECT sl FROM SystemLog sl WHERE " +
           "(:level IS NULL OR sl.logLevel = :level) AND " +
           "(:category IS NULL OR sl.category = :category) AND " +
           "(:startDate IS NULL OR sl.timestamp >= :startDate) AND " +
           "(:endDate IS NULL OR sl.timestamp <= :endDate) " +
           "ORDER BY sl.timestamp DESC")
    List<SystemLog> findByFilters(@Param("level") String level,
                                  @Param("category") String category,
                                  @Param("startDate") LocalDateTime startDate,
                                  @Param("endDate") LocalDateTime endDate);
}
```

### **3. Logging Services**

#### LoggingService.java
```java
package com.inventory.service;

import com.inventory.entity.*;
import com.inventory.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoggingService {

    private final UserActivityLogRepository userActivityLogRepository;
    private final InventoryTransactionLogRepository inventoryTransactionLogRepository;
    private final SystemLogRepository systemLogRepository;
    private final ObjectMapper objectMapper;

    // User Activity Logging
    public void logUserActivity(Long userId, String username, String action, String status, 
                               HttpServletRequest request, Map<String, Object> additionalDetails) {
        try {
            UserActivityLog activityLog = new UserActivityLog();
            activityLog.setUserId(userId);
            activityLog.setUsername(username);
            activityLog.setAction(action);
            activityLog.setStatus(status);
            activityLog.setIpAddress(getClientIpAddress(request));
            activityLog.setUserAgent(request.getHeader("User-Agent"));
            activityLog.setBrowser(extractBrowser(request));
            activityLog.setDeviceType(extractDeviceType(request));
            activityLog.setOperatingSystem(extractOS(request));
            activityLog.setLocation(extractLocation(getClientIpAddress(request)));
            activityLog.setTimestamp(LocalDateTime.now());
            
            if (additionalDetails != null) {
                activityLog.setDetails(objectMapper.writeValueAsString(additionalDetails));
            }

            userActivityLogRepository.save(activityLog);
            
            // Also log to system logs for critical events
            if ("failure".equals(status) || "register".equals(action)) {
                logSystemEvent("info", "auth", 
                    String.format("User %s: %s", action, username), 
                    Map.of("logId", activityLog.getId(), "userId", userId, "status", status));
            }
            
        } catch (Exception e) {
            log.error("Failed to log user activity", e);
            logSystemEvent("error", "system", "Failed to log user activity", 
                Map.of("error", e.getMessage(), "userId", userId, "username", username, "action", action));
        }
    }

    // Inventory Transaction Logging
    public void logInventoryTransaction(Long userId, String username, Long productId, 
                                       String transactionType, String action, 
                                       Object beforeData, Object afterData, 
                                       HttpServletRequest request) {
        try {
            InventoryTransactionLog transactionLog = new InventoryTransactionLog();
            transactionLog.setUserId(userId);
            transactionLog.setUsername(username);
            transactionLog.setProductId(productId);
            
            // Extract product info from before/after data
            Map<String, Object> productInfo = extractProductInfo(beforeData, afterData);
            transactionLog.setProductSku((String) productInfo.get("sku"));
            transactionLog.setProductName((String) productInfo.get("name"));
            
            transactionLog.setTransactionType(transactionType);
            transactionLog.setAction(action);
            transactionLog.setBeforeData(objectMapper.writeValueAsString(beforeData));
            transactionLog.setAfterData(objectMapper.writeValueAsString(afterData));
            transactionLog.setChangedFields(calculateChangedFields(beforeData, afterData));
            transactionLog.setFieldChanges(calculateFieldChanges(beforeData, afterData));
            transactionLog.setIpAddress(getClientIpAddress(request));
            transactionLog.setUserAgent(request.getHeader("User-Agent"));
            transactionLog.setTimestamp(LocalDateTime.now());
            transactionLog.setSessionId(request.getSession().getId());
            transactionLog.setRequestId(generateRequestId());

            inventoryTransactionLogRepository.save(transactionLog);
            
            // Log critical events to system logs
            if ("delete".equals(transactionType)) {
                logSystemEvent("warning", "inventory", 
                    String.format("Product deleted: %s", transactionLog.getProductName()), 
                    Map.of("logId", transactionLog.getId(), "userId", userId, "productId", productId));
            }
            
        } catch (Exception e) {
            log.error("Failed to log inventory transaction", e);
            logSystemEvent("error", "system", "Failed to log inventory transaction", 
                Map.of("error", e.getMessage(), "userId", userId, "productId", productId, "transactionType", transactionType));
        }
    }

    // System Event Logging
    public void logSystemEvent(String level, String category, String message, Map<String, Object> details) {
        try {
            SystemLog systemLog = new SystemLog();
            systemLog.setLogLevel(level);
            systemLog.setCategory(category);
            systemLog.setMessage(message);
            
            if (details != null) {
                systemLog.setDetails(objectMapper.writeValueAsString(details));
            }
            
            systemLog.setTimestamp(LocalDateTime.now());
            
            systemLogRepository.save(systemLog);
            
            // Also log to console for development
            log.info("[{}] {}: {}", level.toUpperCase(), category, message);
            
        } catch (Exception e) {
            log.error("Failed to log system event", e);
        }
    }

    // Helper methods
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    private String extractBrowser(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null) return "Unknown";
        
        if (userAgent.contains("Chrome")) return "Chrome";
        if (userAgent.contains("Firefox")) return "Firefox";
        if (userAgent.contains("Safari")) return "Safari";
        if (userAgent.contains("Edge")) return "Edge";
        if (userAgent.contains("Opera")) return "Opera";
        
        return "Other";
    }

    private String extractDeviceType(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null) return "Unknown";
        
        if (userAgent.contains("Mobile") || userAgent.contains("Android") || userAgent.contains("iPhone")) {
            return "Mobile";
        }
        if (userAgent.contains("Tablet") || userAgent.contains("iPad")) {
            return "Tablet";
        }
        
        return "Desktop";
    }

    private String extractOS(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null) return "Unknown";
        
        if (userAgent.contains("Windows")) return "Windows";
        if (userAgent.contains("Mac")) return "macOS";
        if (userAgent.contains("Linux")) return "Linux";
        if (userAgent.contains("Android")) return "Android";
        if (userAgent.contains("iOS")) return "iOS";
        
        return "Other";
    }

    private Map<String, String> extractLocation(String ipAddress) {
        Map<String, String> location = new HashMap<>();
        // You can integrate with a GeoIP service here
        // For now, returning placeholder values
        location.put("country", "Unknown");
        location.put("city", "Unknown");
        return location;
    }

    private Map<String, Object> extractProductInfo(Object beforeData, Object afterData) {
        Map<String, Object> info = new HashMap<>();
        
        if (afterData != null) {
            // Extract from afterData if available
            if (afterData instanceof Map) {
                Map<?, ?> dataMap = (Map<?, ?>) afterData;
                info.put("sku", (String) dataMap.get("sku"));
                info.put("name", (String) dataMap.get("name"));
            }
        } else if (beforeData != null) {
            // Extract from beforeData if afterData is null
            if (beforeData instanceof Map) {
                Map<?, ?> dataMap = (Map<?, ?>) beforeData;
                info.put("sku", (String) dataMap.get("sku"));
                info.put("name", (String) dataMap.get("name"));
            }
        }
        
        return info;
    }

    private String calculateChangedFields(Object beforeData, Object afterData) {
        if (beforeData == null || afterData == null) return "";
        
        StringBuilder changedFields = new StringBuilder();
        
        if (beforeData instanceof Map && afterData instanceof Map) {
            Map<?, ?> beforeMap = (Map<?, ?>) beforeData;
            Map<?, ?> afterMap = (Map<?, ?>) afterData;
            
            for (Map.Entry<?, ?> entry : afterMap.entrySet()) {
                String key = (String) entry.getKey();
                Object beforeValue = beforeMap.get(key);
                Object afterValue = entry.getValue();
                
                if (!java.util.Objects.equals(beforeValue, afterValue)) {
                    if (changedFields.length() > 0) {
                        changedFields.append(",");
                    }
                    changedFields.append(key);
                }
            }
        }
        
        return changedFields.toString();
    }

    private String calculateFieldChanges(Object beforeData, Object afterData) {
        try {
            Map<String, Map<String, Object>> fieldChanges = new HashMap<>();
            
            if (beforeData instanceof Map && afterData instanceof Map) {
                Map<?, ?> beforeMap = (Map<?, ?>) beforeData;
                Map<?, ?> afterMap = (Map<?, ?>) afterData;
                
                for (Map.Entry<?, ?> entry : afterMap.entrySet()) {
                    String key = (String) entry.getKey();
                    Object beforeValue = beforeMap.get(key);
                    Object afterValue = entry.getValue();
                    
                    if (!java.util.Objects.equals(beforeValue, afterValue)) {
                        Map<String, Object> change = new HashMap<>();
                        change.put("before", beforeValue);
                        change.put("after", afterValue);
                        fieldChanges.put(key, change);
                    }
                }
            }
            
            return objectMapper.writeValueAsString(fieldChanges);
        } catch (Exception e) {
            log.error("Failed to calculate field changes", e);
            return "{}";
        }
    }

    private String generateRequestId() {
        return java.util.UUID.randomUUID().toString();
    }

    // Convenience methods
    public void logLogin(Long userId, String username, boolean success, HttpServletRequest request) {
        logUserActivity(userId, username, "login", success ? "success" : "failure", request, null);
    }

    public void logLogout(Long userId, String username, HttpServletRequest request) {
        logUserActivity(userId, username, "logout", "success", request, null);
    }

    public void logRegistration(Long userId, String username, boolean success, HttpServletRequest request) {
        logUserActivity(userId, username, "register", success ? "success" : "failure", request, null);
    }

    public void logProductCreation(Long userId, String username, Long productId, Object productData, HttpServletRequest request) {
        logInventoryTransaction(userId, username, productId, "create", "add_item", null, productData, request);
    }

    public void logProductUpdate(Long userId, String username, Long productId, Object beforeData, Object afterData, HttpServletRequest request) {
        logInventoryTransaction(userId, username, productId, "update", "edit_item", beforeData, afterData, request);
    }

    public void logProductDeletion(Long userId, String username, Long productId, Object productData, HttpServletRequest request) {
        logInventoryTransaction(userId, username, productId, "delete", "delete_item", productData, null, request);
    }
}
```

### **4. Logging Interceptor**

#### LoggingInterceptor.java
```java
package com.inventory.interceptor;

import com.inventory.service.LoggingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class LoggingInterceptor implements HandlerInterceptor {

    private final LoggingService loggingService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Generate unique request ID
        String requestId = UUID.randomUUID().toString();
        request.setAttribute("requestId", requestId);
        
        // Log request start
        String clientIp = getClientIpAddress(request);
        log.info("[{}] {} {} - {}", requestId, request.getMethod(), request.getRequestURI(), clientIp);
        
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        String requestId = (String) request.getAttribute("requestId");
        
        if (ex != null) {
            loggingService.logSystemEvent("error", "system", 
                "Request completed with error", 
                Map.of("requestId", requestId, "error", ex.getMessage()));
        }
        
        log.info("[{}] {} {} - Status: {}", requestId, request.getMethod(), request.getRequestURI(), response.getStatus());
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}
```

---

## 🔌 API Integration with Logging

### **1. Enhanced Authentication Controller**

#### AuthController.java (with logging)
```java
package com.inventory.controller;

import com.inventory.service.AuthService;
import com.inventory.service.LoggingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;
    private final LoggingService loggingService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            String name = request.get("name");
            String role = request.get("role");

            Map<String, Object> result = authService.register(username, password, name, role);
            
            // Log registration attempt
            loggingService.logRegistration(
                result.get("success") != null ? ((Map<String, Object>) result.get("user")).get("id") instanceof Long ? 
                    (Long) ((Map<String, Object>) result.get("user")).get("id") : null,
                username,
                (Boolean) result.get("success"),
                httpRequest
            );
            
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, Object> error = Map.of(
                "success", false,
                "error", e.getMessage()
            );
            
            // Log failed registration
            loggingService.logRegistration(null, request.get("username"), false, httpRequest);
            
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        try {
            String username = request.get("username");
            String password = request.get("password");

            Map<String, Object> result = authService.login(username, password);
            
            // Log successful login
            if (result.get("success") != null && (Boolean) result.get("success")) {
                Map<String, Object> user = (Map<String, Object>) result.get("user");
                loggingService.logLogin((Long) user.get("id"), username, true, httpRequest);
            } else {
                // Log failed login
                loggingService.logLogin(null, username, false, httpRequest);
            }
            
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, Object> error = Map.of(
                "success", false,
                "error", "Invalid credentials"
            );
            
            // Log failed login
            loggingService.logLogin(null, request.get("username"), false, httpRequest);
            
            return ResponseEntity.status(401).body(error);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
        try {
            // Extract user info from JWT token (you'll need to implement this)
            String username = extractUsernameFromToken(request);
            Long userId = extractUserIdFromToken(request);
            
            // Log logout
            if (userId != null && username != null) {
                loggingService.logLogout(userId, username, request);
            }
            
            Map<String, Object> result = Map.of(
                "success", true,
                "message", "Logged out successfully"
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = Map.of(
                "success", false,
                "error", "Logout failed"
            );
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(HttpServletRequest request) {
        // This would typically extract user from JWT token
        // For simplicity, returning a basic response
        Map<String, Object> result = Map.of(
            "success", true,
            "user", Map.of(
                "username", "testuser",
                "role", "USER"
            )
        );
        return ResponseEntity.ok(result);
    }

    // Helper methods (you'll need to implement JWT token extraction)
    private String extractUsernameFromToken(HttpServletRequest request) {
        // Implement JWT token extraction logic
        return "testuser"; // placeholder
    }

    private Long extractUserIdFromToken(HttpServletRequest request) {
        // Implement JWT token extraction logic
        return 1L; // placeholder
    }
}
```

### **2. Enhanced Inventory Controller**

#### InventoryController.java (with logging)
```java
package com.inventory.controller;

import com.inventory.entity.Product;
import com.inventory.service.InventoryService;
import com.inventory.service.LoggingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class InventoryController {

    private final InventoryService inventoryService;
    private final LoggingService loggingService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Map<String, Object>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            HttpServletRequest request) {
        
        try {
            List<Product> items = inventoryService.getAllProducts(search, category);
            Map<String, Object> response = Map.of(
                "success", true,
                "items", items
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            loggingService.logSystemEvent("error", "inventory", "Failed to fetch products", 
                Map.of("error", e.getMessage(), "search", search, "category", category));
            
            Map<String, Object> error = Map.of(
                "success", false,
                "error", e.getMessage()
            );
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Map<String, Object>> getProductById(@PathVariable Long id, HttpServletRequest request) {
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
            loggingService.logSystemEvent("error", "inventory", "Failed to fetch product", 
                Map.of("error", e.getMessage(), "productId", id));
            
            Map<String, Object> error = Map.of(
                "success", false,
                "error", e.getMessage()
            );
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createProduct(@RequestBody Product product, HttpServletRequest request) {
        try {
            Product createdProduct = inventoryService.createProduct(product);
            
            // Log product creation
            Long userId = extractUserIdFromToken(request);
            String username = extractUsernameFromToken(request);
            loggingService.logProductCreation(userId, username, createdProduct.getId(), createdProduct, request);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "item", createdProduct
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            loggingService.logSystemEvent("error", "inventory", "Product creation failed", 
                Map.of("error", e.getMessage(), "productData", product));
            
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
            @RequestBody Product product,
            HttpServletRequest request) {
        try {
            // Get current product data before update
            Optional<Product> beforeProductOpt = inventoryService.getProductById(id);
            if (!beforeProductOpt.isPresent()) {
                Map<String, Object> error = Map.of(
                    "success", false,
                    "error", "Product not found"
                );
                return ResponseEntity.notFound().build();
            }
            
            Product beforeProduct = beforeProductOpt.get();
            Product updatedProduct = inventoryService.updateProduct(id, product);
            
            // Log product update
            Long userId = extractUserIdFromToken(request);
            String username = extractUsernameFromToken(request);
            loggingService.logProductUpdate(userId, username, id, beforeProduct, updatedProduct, request);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "item", updatedProduct
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            loggingService.logSystemEvent("error", "inventory", "Product update failed", 
                Map.of("error", e.getMessage(), "productId", id, "updateData", product));
            
            Map<String, Object> error = Map.of(
                "success", false,
                "error", e.getMessage()
            );
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteProduct(@PathVariable Long id, HttpServletRequest request) {
        try {
            // Get product data before deletion
            Optional<Product> productOpt = inventoryService.getProductById(id);
            if (!productOpt.isPresent()) {
                Map<String, Object> error = Map.of(
                    "success", false,
                    "error", "Product not found"
                );
                return ResponseEntity.notFound().build();
            }
            
            Product product = productOpt.get();
            inventoryService.deleteProduct(id);
            
            // Log product deletion
            Long userId = extractUserIdFromToken(request);
            String username = extractUsernameFromToken(request);
            loggingService.logProductDeletion(userId, username, id, product, request);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Product deleted successfully"
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            loggingService.logSystemEvent("error", "inventory", "Product deletion failed", 
                Map.of("error", e.getMessage(), "productId", id));
            
            Map<String, Object> error = Map.of(
                "success", false,
                "error", e.getMessage()
            );
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Helper methods (you'll need to implement JWT token extraction)
    private String extractUsernameFromToken(HttpServletRequest request) {
        // Implement JWT token extraction logic
        return "admin"; // placeholder
    }

    private Long extractUserIdFromToken(HttpServletRequest request) {
        // Implement JWT token extraction logic
        return 1L; // placeholder
    }
}
```

---

## 📊 Logging API Endpoints

### **1. Logs Controller**

#### LogsController.java
```java
package com.inventory.controller;

import com.inventory.entity.*;
import com.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class LogsController {

    private final UserActivityLogRepository userActivityLogRepository;
    private final InventoryTransactionLogRepository inventoryTransactionLogRepository;
    private final SystemLogRepository systemLogRepository;
    private final LoggingService loggingService;

    @GetMapping("/user-activity")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserActivityLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            HttpServletRequest request) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<UserActivityLog> logsPage = userActivityLogRepository.findByFilters(
                userId, action, status, startDate, endDate, pageable
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("logs", logsPage.getContent());
            response.put("pagination", Map.of(
                "page", logsPage.getNumber(),
                "size", logsPage.getSize(),
                "totalElements", logsPage.getTotalElements(),
                "totalPages", logsPage.getTotalPages(),
                "first", logsPage.isFirst(),
                "last", logsPage.isLast()
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            loggingService.logSystemEvent("error", "logs", "Failed to fetch user activity logs", 
                Map.of("error", e.getMessage()));
            
            Map<String, Object> error = Map.of(
                "success", false,
                "error", "Failed to fetch logs"
            );
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/inventory-transactions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getInventoryTransactionLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) String transactionType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            HttpServletRequest request) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<InventoryTransactionLog> logsPage = inventoryTransactionLogRepository.findByFilters(
                userId, productId, transactionType, startDate, endDate, pageable
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("logs", logsPage.getContent());
            response.put("pagination", Map.of(
                "page", logsPage.getNumber(),
                "size", logsPage.getSize(),
                "totalElements", logsPage.getTotalElements(),
                "totalPages", logsPage.getTotalPages(),
                "first", logsPage.isFirst(),
                "last", logsPage.isLast()
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            loggingService.logSystemEvent("error", "logs", "Failed to fetch inventory transaction logs", 
                Map.of("error", e.getMessage()));
            
            Map<String, Object> error = Map.of(
                "success", false,
                "error", "Failed to fetch logs"
            );
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/system")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSystemLogs(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            HttpServletRequest request) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<SystemLog> logsPage = systemLogRepository.findByFilters(
                level, category, startDate, endDate, pageable
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("logs", logsPage.getContent());
            response.put("pagination", Map.of(
                "page", logsPage.getNumber(),
                "size", logsPage.getSize(),
                "totalElements", logsPage.getTotalElements(),
                "totalPages", logsPage.getTotalPages(),
                "first", logsPage.isFirst(),
                "last", logsPage.isLast()
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            loggingService.logSystemEvent("error", "logs", "Failed to fetch system logs", 
                Map.of("error", e.getMessage()));
            
            Map<String, Object> error = Map.of(
                "success", false,
                "error", "Failed to fetch logs"
            );
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
```

---

## 📈 Analytics and Reporting

### **1. Analytics Service**

#### AnalyticsService.java
```java
package com.inventory.service;

import com.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final UserActivityLogRepository userActivityLogRepository;
    private final InventoryTransactionLogRepository inventoryTransactionLogRepository;
    private final SystemLogRepository systemLogRepository;

    public Map<String, Object> getUserActivityStats(LocalDateTime startDate, LocalDateTime endDate) {
        try {
            // Get user activity by action and status
            List<Object[]> results = userActivityLogRepository.getUserActivityStats(startDate, endDate);
            
            Map<String, Object> stats = new HashMap<>();
            Map<String, Long> actionCounts = new HashMap<>();
            Map<String, Long> statusCounts = new HashMap<>();
            
            for (Object[] row : results) {
                String action = (String) row[0];
                String status = (String) row[1];
                Long count = (Long) row[2];
                
                actionCounts.merge(action + "_" + status, count, Long::sum);
                statusCounts.merge(status, count, Long::sum);
            }
            
            stats.put("actionCounts", actionCounts);
            stats.put("statusCounts", statusCounts);
            stats.put("period", Map.of("startDate", startDate, "endDate", endDate));
            
            return stats;
        } catch (Exception e) {
            log.error("Failed to get user activity stats", e);
            return Map.of("error", "Failed to get stats");
        }
    }

    public Map<String, Object> getInventoryTransactionStats(LocalDateTime startDate, LocalDateTime endDate) {
        try {
            List<Object[]> results = inventoryTransactionLogRepository.getInventoryTransactionStats(startDate, endDate);
            
            Map<String, Object> stats = new HashMap<>();
            Map<String, Long> transactionCounts = new HashMap<>();
            Map<String, Long> actionCounts = new HashMap<>();
            
            for (Object[] row : results) {
                String transactionType = (String) row[0];
                String action = (String) row[1];
                Long count = (Long) row[2];
                
                transactionCounts.merge(transactionType, count, Long::sum);
                actionCounts.merge(action, count, Long::sum);
            }
            
            stats.put("transactionCounts", transactionCounts);
            stats.put("actionCounts", actionCounts);
            stats.put("period", Map.of("startDate", startDate, "endDate", endDate));
            
            return stats;
        } catch (Exception e) {
            log.error("Failed to get inventory transaction stats", e);
            return Map.of("error", "Failed to get stats");
        }
    }

    public List<Map<String, Object>> getTopActiveUsers(int limit, LocalDateTime startDate, LocalDateTime endDate) {
        try {
            List<Object[]> results = userActivityLogRepository.getTopActiveUsers(limit, startDate, endDate);
            
            List<Map<String, Object>> topUsers = new ArrayList<>();
            
            for (Object[] row : results) {
                Map<String, Object> user = new HashMap<>();
                user.put("userId", row[0]);
                user.put("username", row[1]);
                user.put("activityCount", row[2]);
                user.put("activeDays", row[3]);
                topUsers.add(user);
            }
            
            return topUsers;
        } catch (Exception e) {
            log.error("Failed to get top active users", e);
            return Collections.emptyList();
        }
    }

    public List<Map<String, Object>> getMostModifiedProducts(int limit, LocalDateTime startDate, LocalDateTime endDate) {
        try {
            List<Object[]> results = inventoryTransactionLogRepository.getMostModifiedProducts(limit, startDate, endDate);
            
            List<Map<String, Object>> products = new ArrayList<>();
            
            for (Object[] row : results) {
                Map<String, Object> product = new HashMap<>();
                product.put("productId", row[0]);
                product.put("productName", row[1]);
                product.put("productSku", row[2]);
                product.put("modificationCount", row[3]);
                product.put("uniqueUsers", row[4]);
                products.add(product);
            }
            
            return products;
        } catch (Exception e) {
            log.error("Failed to get most modified products", e);
            return Collections.emptyList();
        }
    }
}
```

### **2. Analytics Controller**

#### AnalyticsController.java
```java
package com.inventory.controller;

import com.inventory.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/user-activity")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserActivityStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        // Default to last 30 days if no dates provided
        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
        
        Map<String, Object> stats = analyticsService.getUserActivityStats(startDate, endDate);
        return ResponseEntity.ok(Map.of("success", true, "data", stats));
    }

    @GetMapping("/inventory-transactions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getInventoryTransactionStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        // Default to last 30 days if no dates provided
        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
        
        Map<String, Object> stats = analyticsService.getInventoryTransactionStats(startDate, endDate);
        return ResponseEntity.ok(Map.of("success", true, "data", stats));
    }

    @GetMapping("/top-users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getTopActiveUsers(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        // Default to last 30 days if no dates provided
        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
        
        var topUsers = analyticsService.getTopActiveUsers(limit, startDate, endDate);
        return ResponseEntity.ok(Map.of("success", true, "data", topUsers));
    }

    @GetMapping("/most-modified-products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getMostModifiedProducts(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        // Default to last 30 days if no dates provided
        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
        
        var products = analyticsService.getMostModifiedProducts(limit, startDate, endDate);
        return ResponseEntity.ok(Map.of("success", true, "data", products));
    }
}
```

---

## 🚀 Installation and Setup

### **1. Maven Dependencies**

```xml
<!-- Add to your existing pom.xml -->
<dependencies>
    <!-- Jackson for JSON processing -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>
    
    <!-- Lombok for reducing boilerplate -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    
    <!-- Spring Boot Starter Web (if not already included) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Boot Starter Data JPA (if not already included) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- PostgreSQL Driver (if not already included) -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>
</dependencies>
```

### **2. Configuration Updates**

#### application.properties
```properties
# Add logging configuration
logging.level.com.inventory=INFO
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n

# File logging (optional)
logging.file.name=logs/inventory-app.log
logging.logback.rollingpolicy.max-file-size=10MB
logging.logback.rollingpolicy.max-history=30
```

### **3. Web Configuration**

#### WebConfig.java
```java
package com.inventory.config;

import com.inventory.interceptor.LoggingInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final LoggingInterceptor loggingInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loggingInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/login", "/api/auth/register"); // Exclude sensitive endpoints from detailed logging
    }
}
```

---

## 🔄 Migration Steps

1. **Create logging tables** in your PostgreSQL database
2. **Add logging entities** to your Spring Boot project
3. **Implement repositories** for logging entities
4. **Create LoggingService** with all logging methods
5. **Add LoggingInterceptor** for request tracking
6. **Update existing controllers** to include logging calls
7. **Create analytics endpoints** for reporting
8. **Test all logging functionality**
9. **Update frontend** to consume analytics endpoints (optional)

---

## 🚀 Quick Start Checklist

- [ ] Create database tables for logging
- [ ] Add logging entities (UserActivityLog, InventoryTransactionLog, SystemLog)
- [ ] Implement logging repositories
- [ ] Create LoggingService with all methods
- [ ] Add LoggingInterceptor for request tracking
- [ ] Update AuthController with logging
- [ ] Update InventoryController with logging
- [ ] Create LogsController for log retrieval
- [ ] Create AnalyticsService for reporting
- [ ] Create AnalyticsController for analytics endpoints
- [ ] Test all logging functionality
- [ ] Verify log data is being captured correctly

---

## 📞 Support

For any issues during implementation:
1. Check Spring Boot application logs
2. Verify database table creation
3. Check JSON serialization/deserialization
4. Validate JWT token extraction methods
5. Review PostgreSQL JSON handling

This Spring Boot logging guide provides everything needed to implement comprehensive activity tracking for your Inventory Management System! 🚀
