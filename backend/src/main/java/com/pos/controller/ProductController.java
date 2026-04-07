package com.pos.controller;

import com.pos.dto.StockAdjustmentRequest;
import com.pos.model.Product;
import com.pos.security.AccessControlService;
import com.pos.security.Permission;
import com.pos.service.AuditLogService;
import com.pos.service.ProductService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final AccessControlService accessControlService;
    private final AuditLogService auditLogService;

    public ProductController(
            ProductService productService,
            AccessControlService accessControlService,
            AuditLogService auditLogService
    ) {
        this.productService = productService;
        this.accessControlService = accessControlService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<Product> getAll(Authentication auth) {
        accessControlService.require(auth, Permission.VIEW_PRODUCTS);
        return productService.getAll();
    }

    @GetMapping("/search")
    public List<Product> search(@RequestParam String q, Authentication auth) {
        accessControlService.require(auth, Permission.VIEW_PRODUCTS);
        return productService.search(q);
    }

    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<Product> getByBarcode(@PathVariable String barcode, Authentication auth) {
        accessControlService.require(auth, Permission.VIEW_PRODUCTS);
        return ResponseEntity.ok(productService.getByBarcode(barcode));
    }

    @GetMapping("/low-stock")
    public List<Product> getLowStock(Authentication auth) {
        accessControlService.require(auth, Permission.VIEW_PRODUCTS);
        return productService.getLowStock();
    }

    @PostMapping
    public Product create(@RequestBody Product product, Authentication auth, HttpServletRequest request) {
        accessControlService.require(auth, Permission.MANAGE_PRODUCTS);
        Product saved = productService.create(product);
        auditLogService.log(auth, request, "CREATE_PRODUCT", "PRODUCT", saved.getId().toString(), saved.getName(), "SUCCESS");
        return saved;
    }

    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @RequestBody Product product, Authentication auth, HttpServletRequest request) {
        accessControlService.require(auth, Permission.MANAGE_PRODUCTS);
        Product updated = productService.update(id, product);
        auditLogService.log(auth, request, "UPDATE_PRODUCT", "PRODUCT", id.toString(), updated.getName(), "SUCCESS");
        return updated;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth, HttpServletRequest request) {
        accessControlService.require(auth, Permission.MANAGE_PRODUCTS);
        productService.delete(id);
        auditLogService.log(auth, request, "DELETE_PRODUCT", "PRODUCT", id.toString(), "Soft delete product", "SUCCESS");
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/adjust-stock")
    public Product adjustStock(
            @PathVariable Long id,
            @Valid @RequestBody StockAdjustmentRequest body,
            Authentication auth,
            HttpServletRequest request
    ) {
        accessControlService.require(auth, Permission.MANAGE_PRODUCTS);
        Product product = productService.adjustStock(id, body.quantityChange());
        String reason = body.reason() == null || body.reason().isBlank() ? "Manual adjustment" : body.reason().trim();
        auditLogService.log(
                auth,
                request,
                "ADJUST_STOCK",
                "PRODUCT",
                product.getId().toString(),
                "Change " + body.quantityChange() + " (" + reason + ")",
                "SUCCESS"
        );
        return product;
    }
}
