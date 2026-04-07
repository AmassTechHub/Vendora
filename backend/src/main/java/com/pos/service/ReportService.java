package com.pos.service;

import com.pos.model.Sale;
import com.pos.model.SaleItem;
import com.pos.repository.ProductRepository;
import com.pos.repository.SaleRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;

    public ReportService(SaleRepository saleRepository, ProductRepository productRepository) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
    }

    public Map<String, Object> getDailyReport(String dateStr) {
        LocalDate day = dateStr != null ? LocalDate.parse(dateStr) : LocalDate.now();
        List<Sale> sales = saleRepository.findByCreatedAtBetween(
                day.atStartOfDay(), day.plusDays(1).atStartOfDay());
        return buildSummary(sales);
    }

    public Map<String, Object> getWeeklyReport() {
        LocalDateTime start = LocalDate.now().minusDays(7).atStartOfDay();
        List<Sale> sales = saleRepository.findByCreatedAtBetween(start, LocalDateTime.now());
        return buildSummary(sales);
    }

    public Map<String, Object> getRangeReport(String from, String to) {
        List<Sale> sales = saleRepository.findByCreatedAtBetween(
                LocalDate.parse(from).atStartOfDay(),
                LocalDate.parse(to).plusDays(1).atStartOfDay());
        return buildSummary(sales);
    }

    public Map<String, Object> getInventoryReport() {
        return Map.of(
                "allProducts", productRepository.findByActiveTrue(),
                "lowStock", productRepository.findByQuantityLessThanEqualAndActiveTrue(10)
        );
    }

    public Map<String, Object> getCashierReport(Long userId, String dateStr) {
        LocalDate day = dateStr != null ? LocalDate.parse(dateStr) : LocalDate.now();
        List<Sale> sales = saleRepository.findByCashierAndDateRange(
                userId, day.atStartOfDay(), day.plusDays(1).atStartOfDay());
        return buildSummary(sales);
    }

    public List<Map<String, Object>> getLast7DaysTrend() {
        List<Map<String, Object>> trend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            List<Sale> sales = saleRepository.findByCreatedAtBetween(
                    day.atStartOfDay(), day.plusDays(1).atStartOfDay());
            BigDecimal revenue = sales.stream().map(Sale::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            trend.add(Map.of(
                    "date", day.toString(),
                    "day", day.getDayOfWeek().toString().substring(0, 3),
                    "sales", sales.size(),
                    "revenue", revenue
            ));
        }
        return trend;
    }

    public List<Map<String, Object>> getTopProducts(int limit) {
        LocalDateTime start = LocalDate.now().minusDays(30).atStartOfDay();
        List<Sale> sales = saleRepository.findByCreatedAtBetween(start, LocalDateTime.now());

        Map<String, Long> productSales = new HashMap<>();
        Map<String, BigDecimal> productRevenue = new HashMap<>();

        sales.stream().flatMap(s -> s.getItems().stream()).forEach(item -> {
            String name = item.getProduct().getName();
            productSales.merge(name, (long) item.getQuantity(), Long::sum);
            productRevenue.merge(name, item.getSubtotal(), BigDecimal::add);
        });

        return productSales.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(limit)
                .map(e -> Map.<String, Object>of(
                        "name", e.getKey(),
                        "quantity", e.getValue(),
                        "revenue", productRevenue.getOrDefault(e.getKey(), BigDecimal.ZERO)
                ))
                .collect(Collectors.toList());
    }

    public Map<String, Object> getPaymentMethodBreakdown() {
        LocalDateTime start = LocalDate.now().minusDays(30).atStartOfDay();
        List<Sale> sales = saleRepository.findByCreatedAtBetween(start, LocalDateTime.now());

        Map<String, Long> breakdown = sales.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getPaymentMethod() != null ? s.getPaymentMethod().name() : "UNKNOWN",
                        Collectors.counting()
                ));
        return new HashMap<>(breakdown);
    }

    private Map<String, Object> buildSummary(List<Sale> sales) {
        BigDecimal total = sales.stream().map(Sale::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        int itemsSold = sales.stream().flatMap(s -> s.getItems().stream())
                .mapToInt(SaleItem::getQuantity).sum();
        BigDecimal avgSale = sales.isEmpty() ? BigDecimal.ZERO :
                total.divide(BigDecimal.valueOf(sales.size()), 2, java.math.RoundingMode.HALF_UP);

        return Map.of(
                "totalSales", sales.size(),
                "totalRevenue", total,
                "totalItemsSold", itemsSold,
                "averageSaleValue", avgSale,
                "sales", sales
        );
    }
}
