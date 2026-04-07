package com.pos.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pos.model.*;
import com.pos.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class BackupService {

    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final InviteCodeRepository inviteCodeRepository;
    private final SaleRepository saleRepository;
    private final AuditLogRepository auditLogRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public BackupService(
            ObjectMapper objectMapper,
            UserRepository userRepository,
            ProductRepository productRepository,
            CustomerRepository customerRepository,
            InviteCodeRepository inviteCodeRepository,
            SaleRepository saleRepository,
            AuditLogRepository auditLogRepository,
            RefreshTokenRepository refreshTokenRepository
    ) {
        this.objectMapper = objectMapper;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.inviteCodeRepository = inviteCodeRepository;
        this.saleRepository = saleRepository;
        this.auditLogRepository = auditLogRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Transactional(readOnly = true)
    public byte[] exportJsonPretty() throws com.fasterxml.jackson.core.JsonProcessingException {
        Map<String, Object> doc = buildDocument();
        return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(doc);
    }

    private Map<String, Object> buildDocument() {
        Map<String, Object> root = new LinkedHashMap<>();
        root.put("schemaVersion", 1);
        root.put("exportedAt", Instant.now().toString());
        root.put("application", "vendora-backend");

        root.put("users", userRepository.findAll().stream().map(this::userRow).toList());
        root.put("products", productRepository.findAll().stream().map(this::productRow).toList());
        root.put("customers", customerRepository.findAll().stream().map(this::customerRow).toList());
        root.put("inviteCodes", inviteCodeRepository.findAll().stream().map(this::inviteRow).toList());
        root.put("sales", saleRepository.findAll().stream().map(this::saleRow).toList());
        root.put("auditLogs", auditLogRepository.findAll().stream().map(this::auditRow).toList());
        root.put("refreshTokens", refreshTokenRepository.findAll().stream().map(this::refreshTokenRow).toList());

        return root;
    }

    private Map<String, Object> userRow(User u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", u.getId());
        m.put("username", u.getUsername());
        m.put("passwordHash", u.getPassword());
        m.put("fullName", u.getFullName());
        m.put("role", u.getRole() != null ? u.getRole().name() : null);
        m.put("active", u.isActive());
        m.put("failedLoginAttempts", u.getFailedLoginAttempts());
        m.put("lockoutUntil", u.getLockoutUntil() != null ? u.getLockoutUntil().toString() : null);
        m.put("passwordChangedAt", u.getPasswordChangedAt() != null ? u.getPasswordChangedAt().toString() : null);
        m.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : null);
        return m;
    }

    private Map<String, Object> productRow(Product p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("name", p.getName());
        m.put("category", p.getCategory());
        m.put("price", p.getPrice());
        m.put("quantity", p.getQuantity());
        m.put("barcode", p.getBarcode());
        m.put("supplier", p.getSupplier());
        m.put("lowStockThreshold", p.getLowStockThreshold());
        m.put("active", p.isActive());
        return m;
    }

    private Map<String, Object> customerRow(Customer c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("name", c.getName());
        m.put("phone", c.getPhone());
        m.put("email", c.getEmail());
        m.put("address", c.getAddress());
        m.put("loyaltyPoints", c.getLoyaltyPoints());
        m.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
        return m;
    }

    private Map<String, Object> inviteRow(InviteCode i) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", i.getId());
        m.put("code", i.getCode());
        m.put("role", i.getRole() != null ? i.getRole().name() : null);
        m.put("expiresAt", i.getExpiresAt() != null ? i.getExpiresAt().toString() : null);
        m.put("used", i.isUsed());
        m.put("usedByUsername", i.getUsedByUsername());
        m.put("usedAt", i.getUsedAt() != null ? i.getUsedAt().toString() : null);
        m.put("createdByUserId", i.getCreatedBy() != null ? i.getCreatedBy().getId() : null);
        m.put("createdAt", i.getCreatedAt() != null ? i.getCreatedAt().toString() : null);
        return m;
    }

    private Map<String, Object> saleRow(Sale s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", s.getId());
        m.put("cashierUserId", s.getCashier() != null ? s.getCashier().getId() : null);
        m.put("customerId", s.getCustomer() != null ? s.getCustomer().getId() : null);
        m.put("subtotal", s.getSubtotal());
        m.put("discount", s.getDiscount());
        m.put("tax", s.getTax());
        m.put("totalAmount", s.getTotalAmount());
        m.put("paymentMethod", s.getPaymentMethod() != null ? s.getPaymentMethod().name() : null);
        m.put("amountPaid", s.getAmountPaid());
        m.put("change", s.getChange());
        m.put("paymentProvider", s.getPaymentProvider());
        m.put("paymentReference", s.getPaymentReference());
        m.put("paymentStatus", s.getPaymentStatus() != null ? s.getPaymentStatus().name() : null);
        m.put("createdAt", s.getCreatedAt() != null ? s.getCreatedAt().toString() : null);
        List<Map<String, Object>> items = new ArrayList<>();
        if (s.getItems() != null) {
            for (SaleItem it : s.getItems()) {
                items.add(saleItemRow(s.getId(), it));
            }
        }
        m.put("items", items);
        return m;
    }

    private Map<String, Object> saleItemRow(Long saleId, SaleItem it) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", it.getId());
        m.put("saleId", saleId);
        m.put("productId", it.getProduct() != null ? it.getProduct().getId() : null);
        m.put("quantity", it.getQuantity());
        m.put("unitPrice", it.getUnitPrice());
        m.put("subtotal", it.getSubtotal());
        return m;
    }

    private Map<String, Object> auditRow(AuditLog a) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", a.getId());
        m.put("userId", a.getUserId());
        m.put("username", a.getUsername());
        m.put("action", a.getAction());
        m.put("resourceType", a.getResourceType());
        m.put("resourceId", a.getResourceId());
        m.put("details", a.getDetails());
        m.put("status", a.getStatus());
        m.put("ipAddress", a.getIpAddress());
        m.put("createdAt", a.getCreatedAt() != null ? a.getCreatedAt().toString() : null);
        return m;
    }

    private Map<String, Object> refreshTokenRow(RefreshToken t) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", t.getId());
        m.put("userId", t.getUser() != null ? t.getUser().getId() : null);
        m.put("tokenHash", t.getTokenHash());
        m.put("expiresAt", t.getExpiresAt() != null ? t.getExpiresAt().toString() : null);
        m.put("revoked", t.isRevoked());
        m.put("revokedAt", t.getRevokedAt() != null ? t.getRevokedAt().toString() : null);
        m.put("createdAt", t.getCreatedAt() != null ? t.getCreatedAt().toString() : null);
        return m;
    }
}
