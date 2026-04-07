package com.pos.controller;

import com.pos.exception.ApiException;
import com.pos.model.Sale;
import com.pos.model.Shift;
import com.pos.model.User;
import com.pos.repository.SaleRepository;
import com.pos.repository.ShiftRepository;
import com.pos.repository.UserRepository;
import com.pos.security.AccessControlService;
import com.pos.security.Permission;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/shifts")
public class ShiftController {

    private final ShiftRepository shiftRepository;
    private final UserRepository userRepository;
    private final SaleRepository saleRepository;
    private final AccessControlService accessControlService;

    public ShiftController(ShiftRepository shiftRepository, UserRepository userRepository,
                           SaleRepository saleRepository, AccessControlService accessControlService) {
        this.shiftRepository = shiftRepository;
        this.userRepository = userRepository;
        this.saleRepository = saleRepository;
        this.accessControlService = accessControlService;
    }

    @GetMapping
    public ResponseEntity<List<Shift>> list(Authentication auth) {
        accessControlService.require(auth, Permission.VIEW_SALES);
        return ResponseEntity.ok(shiftRepository.findAllByOrderByStartTimeDesc());
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActive(Authentication auth) {
        accessControlService.require(auth, Permission.CREATE_SALES);
        Optional<Shift> active = shiftRepository.findTopByCashierUsernameAndStatusOrderByStartTimeDesc(
                auth.getName(), Shift.ShiftStatus.ACTIVE);
        if (active.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(active.get());
    }

    @PostMapping("/start")
    public ResponseEntity<Shift> start(@RequestBody Map<String, Object> body, Authentication auth) {
        accessControlService.require(auth, Permission.CREATE_SALES);

        // Check no active shift for this user
        Optional<Shift> existing = shiftRepository.findTopByCashierUsernameAndStatusOrderByStartTimeDesc(
                auth.getName(), Shift.ShiftStatus.ACTIVE);
        if (existing.isPresent()) {
            throw new ApiException("You already have an active shift. End it first.", HttpStatus.CONFLICT);
        }

        User cashier = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        Shift shift = new Shift();
        shift.setCashier(cashier);
        shift.setOpeningCash(new BigDecimal(body.get("openingCash").toString()));
        shift.setNotes((String) body.getOrDefault("notes", ""));
        shift.setStatus(Shift.ShiftStatus.ACTIVE);

        return ResponseEntity.ok(shiftRepository.save(shift));
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<Shift> end(@PathVariable Long id, @RequestBody Map<String, Object> body, Authentication auth) {
        accessControlService.require(auth, Permission.CREATE_SALES);

        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new ApiException("Shift not found", HttpStatus.NOT_FOUND));

        if (shift.getStatus() == Shift.ShiftStatus.CLOSED) {
            throw new ApiException("Shift is already closed", HttpStatus.BAD_REQUEST);
        }

        BigDecimal closingCash = new BigDecimal(body.get("closingCash").toString());
        shift.setClosingCash(closingCash);
        shift.setEndTime(LocalDateTime.now());
        shift.setStatus(Shift.ShiftStatus.CLOSED);
        if (body.get("notes") != null) shift.setNotes((String) body.get("notes"));

        // Calculate expected cash = opening + cash sales during shift
        BigDecimal expectedCash = shift.getOpeningCash().add(shift.getCashRevenue() != null ? shift.getCashRevenue() : BigDecimal.ZERO);
        shift.setExpectedCash(expectedCash);

        return ResponseEntity.ok(shiftRepository.save(shift));
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> stats(@PathVariable Long id, Authentication auth) {
        accessControlService.require(auth, Permission.VIEW_SALES);

        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new ApiException("Shift not found", HttpStatus.NOT_FOUND));

        // Get sales during this shift period
        LocalDateTime end = shift.getEndTime() != null ? shift.getEndTime() : LocalDateTime.now();
        List<Sale> sales = saleRepository.findByCreatedAtBetween(shift.getStartTime(), end);

        BigDecimal totalRevenue = sales.stream()
                .map(Sale::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal cashRevenue = sales.stream()
                .filter(s -> s.getPaymentMethod() == Sale.PaymentMethod.CASH)
                .map(Sale::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Update shift stats
        shift.setTotalSales(sales.size());
        shift.setTotalRevenue(totalRevenue);
        shift.setCashRevenue(cashRevenue);
        shiftRepository.save(shift);

        Map<String, Object> result = new HashMap<>();
        result.put("totalSales", sales.size());
        result.put("totalRevenue", totalRevenue);
        result.put("cashRevenue", cashRevenue);
        result.put("expectedCash", shift.getOpeningCash().add(cashRevenue));

        return ResponseEntity.ok(result);
    }
}
