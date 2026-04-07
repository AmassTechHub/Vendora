package com.pos.controller;

import com.pos.exception.ApiException;
import com.pos.model.Sale;
import com.pos.security.AccessControlService;
import com.pos.security.Permission;
import com.pos.service.AuditLogService;
import com.pos.service.PaystackService;
import com.pos.service.SaleService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaystackService paystackService;
    private final SaleService saleService;
    private final AccessControlService accessControlService;
    private final AuditLogService auditLogService;

    public PaymentController(
            PaystackService paystackService,
            SaleService saleService,
            AccessControlService accessControlService,
            AuditLogService auditLogService
    ) {
        this.paystackService = paystackService;
        this.saleService = saleService;
        this.accessControlService = accessControlService;
        this.auditLogService = auditLogService;
    }

    @PostMapping("/paystack/verify-and-create")
    public ResponseEntity<?> verifyAndCreateSale(@RequestBody VerifyAndCreateRequest request, Authentication auth, HttpServletRequest httpRequest) {
        accessControlService.require(auth, Permission.PROCESS_PAYMENTS);
        if (request == null || request.getReference() == null || request.getReference().isBlank()) {
            throw new ApiException("Payment reference is required", HttpStatus.BAD_REQUEST);
        }
        if (request.getSale() == null) {
            throw new ApiException("Sale payload is required", HttpStatus.BAD_REQUEST);
        }

        PaystackService.VerifiedPayment verified = paystackService.verifyTransaction(request.getReference());
        if (!verified.success()) {
            throw new ApiException("Payment is not successful", HttpStatus.BAD_REQUEST);
        }

        BigDecimal expectedTotal = saleService.calculateExpectedTotal(request.getSale());
        if (verified.amount().compareTo(expectedTotal) < 0) {
            throw new ApiException("Verified amount is lower than sale total", HttpStatus.BAD_REQUEST);
        }

        if (request.getSale().getPaymentMethod() == null || request.getSale().getPaymentMethod() == Sale.PaymentMethod.CASH) {
            request.getSale().setPaymentMethod(resolvePaymentMethod(verified.channel()));
        }
        request.getSale().setAmountPaid(verified.amount());

        Sale createdSale = saleService.createSale(request.getSale(), auth.getName());
        Sale finalizedSale = saleService.markPaystackSuccess(createdSale.getId(), verified.reference(), verified.amount());
        auditLogService.log(
                auth,
                httpRequest,
                "VERIFY_PAYSTACK_PAYMENT",
                "SALE",
                finalizedSale.getId().toString(),
                "Reference " + verified.reference(),
                "SUCCESS"
        );

        return ResponseEntity.ok(Map.of(
                "sale", finalizedSale,
                "payment", Map.of(
                        "provider", "PAYSTACK",
                        "reference", verified.reference(),
                        "status", "SUCCESS",
                        "amount", verified.amount()
                )
        ));
    }

    private Sale.PaymentMethod resolvePaymentMethod(String channel) {
        if (channel == null) {
            return Sale.PaymentMethod.CARD;
        }
        String normalized = channel.toLowerCase();
        if (normalized.contains("mobile")) {
            return Sale.PaymentMethod.MOBILE_MONEY;
        }
        return Sale.PaymentMethod.CARD;
    }

    public static class VerifyAndCreateRequest {
        private String reference;
        private SaleController.SaleRequest sale;

        public String getReference() { return reference; }
        public void setReference(String reference) { this.reference = reference; }
        public SaleController.SaleRequest getSale() { return sale; }
        public void setSale(SaleController.SaleRequest sale) { this.sale = sale; }
    }
}
