package com.pos.controller;

import com.pos.service.ReportService;
import com.pos.security.AccessControlService;
import com.pos.security.Permission;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final AccessControlService accessControlService;

    public ReportController(ReportService reportService, AccessControlService accessControlService) {
        this.reportService = reportService;
        this.accessControlService = accessControlService;
    }

    @GetMapping("/daily")
    public Map<String, Object> daily(@RequestParam(required = false) String date, Authentication auth) {
        accessControlService.require(auth, Permission.VIEW_REPORTS);
        return reportService.getDailyReport(date);
    }

    @GetMapping("/weekly")
    public Map<String, Object> weekly(Authentication auth) {
        accessControlService.require(auth, Permission.VIEW_REPORTS);
        return reportService.getWeeklyReport();
    }

    @GetMapping("/range")
    public Map<String, Object> range(@RequestParam String from, @RequestParam String to, Authentication auth) {
        accessControlService.require(auth, Permission.VIEW_REPORTS);
        return reportService.getRangeReport(from, to);
    }

    @GetMapping("/inventory")
    public Map<String, Object> inventory(Authentication auth) {
        accessControlService.require(auth, Permission.VIEW_REPORTS);
        return reportService.getInventoryReport();
    }

    @GetMapping("/cashier/{userId}")
    public Map<String, Object> cashier(@PathVariable Long userId,
                                        Authentication auth,
                                        @RequestParam(required = false) String date) {
        accessControlService.require(auth, Permission.VIEW_REPORTS);
        return reportService.getCashierReport(userId, date);
    }

    @GetMapping("/trend")
    public List<Map<String, Object>> trend(Authentication auth) {
        accessControlService.require(auth, Permission.VIEW_REPORTS);
        return reportService.getLast7DaysTrend();
    }

    @GetMapping("/top-products")
    public List<Map<String, Object>> topProducts(@RequestParam(defaultValue = "5") int limit, Authentication auth) {
        accessControlService.require(auth, Permission.VIEW_REPORTS);
        return reportService.getTopProducts(limit);
    }

    @GetMapping("/payment-breakdown")
    public Map<String, Object> paymentBreakdown(Authentication auth) {
        accessControlService.require(auth, Permission.VIEW_REPORTS);
        return reportService.getPaymentMethodBreakdown();
    }
}
