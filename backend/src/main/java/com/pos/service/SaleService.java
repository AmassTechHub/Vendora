package com.pos.service;

import com.pos.controller.SaleController.SaleRequest;
import com.pos.exception.ApiException;
import com.pos.model.*;
import com.pos.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public SaleService(SaleRepository saleRepository, ProductRepository productRepository,
                       CustomerRepository customerRepository, UserRepository userRepository) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Sale createSale(SaleRequest request, String username) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ApiException("Sale must have at least one item", HttpStatus.BAD_REQUEST);
        }

        User cashier = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        Sale sale = new Sale();
        sale.setCashier(cashier);

        if (request.getCustomerId() != null) {
            long customerId = request.getCustomerId();
            customerRepository.findById(customerId).ifPresent(sale::setCustomer);
        }

        List<SaleItem> items = request.getItems().stream().map(itemReq -> {
            long productId = requireProductId(itemReq.getProductId());
            Integer quantity = requireQuantity(itemReq.getQuantity());
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ApiException("Product not found: " + productId, HttpStatus.NOT_FOUND));

            if (product.getQuantity() < quantity) {
                throw new ApiException("Insufficient stock for: " + product.getName(), HttpStatus.BAD_REQUEST);
            }

            product.setQuantity(product.getQuantity() - quantity);
            productRepository.save(product);

            SaleItem item = new SaleItem();
            item.setSale(sale);
            item.setProduct(product);
            item.setQuantity(quantity);
            item.setUnitPrice(product.getPrice());
            item.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(quantity)));
            return item;
        }).toList();

        BigDecimal subtotal = items.stream().map(SaleItem::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        BigDecimal tax = BigDecimal.ZERO;
        BigDecimal total = subtotal.subtract(discount).add(tax);
        if (total.compareTo(BigDecimal.ZERO) < 0) {
            throw new ApiException("Discount cannot exceed subtotal", HttpStatus.BAD_REQUEST);
        }

        sale.setItems(items);
        sale.setSubtotal(subtotal);
        sale.setDiscount(discount);
        sale.setTax(tax);
        sale.setTotalAmount(total);
        Sale.PaymentMethod method = request.getPaymentMethod() != null
                ? request.getPaymentMethod()
                : Sale.PaymentMethod.CASH;
        sale.setPaymentMethod(method);
        sale.setAmountPaid(request.getAmountPaid() != null ? request.getAmountPaid() : total);
        sale.setChange(request.getAmountPaid() != null ? request.getAmountPaid().subtract(total) : BigDecimal.ZERO);
        sale.setPaymentStatus(method == Sale.PaymentMethod.CASH ? Sale.PaymentStatus.NOT_REQUIRED : Sale.PaymentStatus.PENDING);

        // Award loyalty points (1 point per 10 currency units spent)
        if (sale.getCustomer() != null) {
            Customer customer = sale.getCustomer();
            customer.setLoyaltyPoints(customer.getLoyaltyPoints() + total.intValue() / 10);
            customerRepository.save(customer);
        }

        return saleRepository.save(sale);
    }

    public BigDecimal calculateExpectedTotal(SaleRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ApiException("Sale must have at least one item", HttpStatus.BAD_REQUEST);
        }

        BigDecimal subtotal = request.getItems().stream().map(itemReq -> {
            long productId = requireProductId(itemReq.getProductId());
            Integer quantity = requireQuantity(itemReq.getQuantity());
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ApiException("Product not found: " + productId, HttpStatus.NOT_FOUND));

            if (product.getQuantity() < quantity) {
                throw new ApiException("Insufficient stock for: " + product.getName(), HttpStatus.BAD_REQUEST);
            }
            return product.getPrice().multiply(BigDecimal.valueOf(quantity));
        }).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        BigDecimal total = subtotal.subtract(discount);
        if (total.compareTo(BigDecimal.ZERO) < 0) {
            throw new ApiException("Discount cannot exceed subtotal", HttpStatus.BAD_REQUEST);
        }
        return total;
    }

    @Transactional
    public Sale markPaystackSuccess(long saleId, String reference, BigDecimal paidAmount) {
        Sale sale = getById(saleId);
        sale.setPaymentProvider("PAYSTACK");
        sale.setPaymentReference(reference);
        sale.setPaymentStatus(Sale.PaymentStatus.SUCCESS);
        sale.setAmountPaid(paidAmount);
        sale.setChange(BigDecimal.ZERO);
        return saleRepository.save(sale);
    }

    public Sale getById(long id) {
        return saleRepository.findById(id)
                .orElseThrow(() -> new ApiException("Sale not found", HttpStatus.NOT_FOUND));
    }

    public List<Sale> listRecent() {
        return saleRepository.findTop200ByOrderByCreatedAtDesc();
    }

    public List<Sale> listByDateRange(LocalDate from, LocalDate to) {
        if (from == null || to == null) {
            throw new ApiException("Both from and to dates are required", HttpStatus.BAD_REQUEST);
        }
        if (from.isAfter(to)) {
            throw new ApiException("From date cannot be after to date", HttpStatus.BAD_REQUEST);
        }
        return saleRepository.findByCreatedAtBetween(from.atStartOfDay(), to.plusDays(1).atStartOfDay());
    }

    private long requireProductId(Long productId) {
        if (productId == null) {
            throw new ApiException("Product ID is required", HttpStatus.BAD_REQUEST);
        }
        return productId;
    }

    private Integer requireQuantity(Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new ApiException("Quantity must be at least 1", HttpStatus.BAD_REQUEST);
        }
        return quantity;
    }
}
