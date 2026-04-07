package com.pos.controller;

import com.pos.exception.ApiException;
import com.pos.model.*;
import com.pos.repository.*;
import com.pos.security.AccessControlService;
import com.pos.security.Permission;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/refunds")
public class RefundController {

    private final RefundRepository refundRepository;
    private final SaleRepository saleRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final AccessControlService accessControlService;

    public RefundController(RefundRepository refundRepository, SaleRepository saleRepository,
                            UserRepository userRepository, ProductRepository productRepository,
                            AccessControlService accessControlService) {
        this.refundRepository = refundRepository;
        this.saleRepository = saleRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.accessControlService = accessControlService;
    }

    @GetMapping
    public ResponseEntity<List<Refund>> list(Authentication auth) {
        accessControlService.require(auth, Permission.VIEW_SALES);
        return ResponseEntity.ok(refundRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping
    public ResponseEntity<Refund> processRefund(@RequestBody Map<String, Object> body, Authentication auth) {
        accessControlService.require(auth, Permission.CREATE_SALES);

        Long saleId = Long.valueOf(body.get("saleId").toString());
        String reason = (String) body.get("reason");
        String notes = (String) body.getOrDefault("notes", "");

        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new ApiException("Sale not found", HttpStatus.NOT_FOUND));

        User processor = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> itemsData = (List<Map<String, Object>>) body.get("items");

        Refund refund = new Refund();
        refund.setSale(sale);
        refund.setProcessedBy(processor);
        refund.setReason(reason);
        refund.setNotes(notes);

        List<RefundItem> refundItems = new ArrayList<>();
        BigDecimal totalRefund = BigDecimal.ZERO;

        for (Map<String, Object> itemData : itemsData) {
            Long saleItemId = Long.valueOf(itemData.get("saleItemId").toString());
            int qty = Integer.parseInt(itemData.get("quantity").toString());

            SaleItem saleItem = sale.getItems().stream()
                    .filter(si -> si.getId().equals(saleItemId))
                    .findFirst()
                    .orElseThrow(() -> new ApiException("Sale item not found", HttpStatus.NOT_FOUND));

            if (qty > saleItem.getQuantity()) {
                throw new ApiException("Refund quantity exceeds sold quantity", HttpStatus.BAD_REQUEST);
            }

            BigDecimal itemRefund = saleItem.getUnitPrice().multiply(BigDecimal.valueOf(qty));
            totalRefund = totalRefund.add(itemRefund);

            RefundItem ri = new RefundItem();
            ri.setRefund(refund);
            ri.setSaleItem(saleItem);
            ri.setQuantity(qty);
            ri.setRefundAmount(itemRefund);
            refundItems.add(ri);

            // Restore stock
            Product product = saleItem.getProduct();
            if (product != null) {
                product.setQuantity(product.getQuantity() + qty);
                productRepository.save(product);
            }
        }

        refund.setRefundAmount(totalRefund);
        refund.setItems(refundItems);

        return ResponseEntity.ok(refundRepository.save(refund));
    }
}
