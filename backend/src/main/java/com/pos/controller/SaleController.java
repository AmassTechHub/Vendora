package com.pos.controller;

import com.pos.model.Sale;
import com.pos.security.AccessControlService;
import com.pos.security.Permission;
import com.pos.service.AuditLogService;
import com.pos.service.SaleService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleService saleService;
    private final AccessControlService accessControlService;
    private final AuditLogService auditLogService;

    public SaleController(
            SaleService saleService,
            AccessControlService accessControlService,
            AuditLogService auditLogService
    ) {
        this.saleService = saleService;
        this.accessControlService = accessControlService;
        this.auditLogService = auditLogService;
    }

    @PostMapping
    public ResponseEntity<Sale> createSale(@RequestBody SaleRequest request, Authentication auth, HttpServletRequest httpRequest) {
        accessControlService.require(auth, Permission.CREATE_SALES);
        Sale sale = saleService.createSale(request, auth.getName());
        auditLogService.log(auth, httpRequest, "CREATE_SALE", "SALE", sale.getId().toString(), "Total " + sale.getTotalAmount(), "SUCCESS");
        return ResponseEntity.ok(sale);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sale> getById(@PathVariable Long id, Authentication auth) {
        accessControlService.require(auth, Permission.VIEW_SALES);
        return ResponseEntity.ok(saleService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<Sale>> listSales(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            Authentication auth
    ) {
        accessControlService.require(auth, Permission.VIEW_SALES);
        if (from != null && to != null) {
            LocalDate fromDate = LocalDate.parse(from);
            LocalDate toDate = LocalDate.parse(to);
            return ResponseEntity.ok(saleService.listByDateRange(fromDate, toDate));
        }
        return ResponseEntity.ok(saleService.listRecent());
    }

    // DTO classes
    public static class SaleRequest {
        private Long customerId;
        private List<ItemRequest> items;
        private BigDecimal discount;
        private Sale.PaymentMethod paymentMethod;
        private BigDecimal amountPaid;

        public Long getCustomerId() { return customerId; }
        public void setCustomerId(Long customerId) { this.customerId = customerId; }
        public List<ItemRequest> getItems() { return items; }
        public void setItems(List<ItemRequest> items) { this.items = items; }
        public BigDecimal getDiscount() { return discount; }
        public void setDiscount(BigDecimal discount) { this.discount = discount; }
        public Sale.PaymentMethod getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(Sale.PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
        public BigDecimal getAmountPaid() { return amountPaid; }
        public void setAmountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; }
    }

    public static class ItemRequest {
        private Long productId;
        private Integer quantity;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}
