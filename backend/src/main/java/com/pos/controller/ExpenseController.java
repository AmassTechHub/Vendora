package com.pos.controller;

import com.pos.exception.ApiException;
import com.pos.model.Expense;
import com.pos.model.User;
import com.pos.repository.ExpenseRepository;
import com.pos.repository.UserRepository;
import com.pos.security.AccessControlService;
import com.pos.security.Permission;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final AccessControlService accessControlService;

    public ExpenseController(ExpenseRepository expenseRepository, UserRepository userRepository,
                             AccessControlService accessControlService) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.accessControlService = accessControlService;
    }

    @GetMapping
    public ResponseEntity<List<Expense>> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            Authentication auth) {
        accessControlService.require(auth, Permission.VIEW_REPORTS);
        List<Expense> result;
        if (category != null && from != null && to != null) {
            result = expenseRepository.findByCategoryAndDateBetweenOrderByDateDesc(
                    category, LocalDate.parse(from), LocalDate.parse(to));
        } else if (category != null) {
            result = expenseRepository.findByCategoryOrderByDateDesc(category);
        } else if (from != null && to != null) {
            result = expenseRepository.findByDateBetweenOrderByDateDesc(LocalDate.parse(from), LocalDate.parse(to));
        } else {
            result = expenseRepository.findAllByOrderByDateDescCreatedAtDesc();
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<Expense> create(@RequestBody Map<String, Object> body, Authentication auth) {
        accessControlService.require(auth, Permission.MANAGE_EXPENSES);
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        Expense expense = new Expense();
        expense.setDescription((String) body.get("description"));
        expense.setAmount(new BigDecimal(body.get("amount").toString()));
        expense.setCategory((String) body.getOrDefault("category", "Other"));
        expense.setDate(LocalDate.parse((String) body.get("date")));
        expense.setNotes((String) body.get("notes"));
        expense.setRecordedBy(user);

        return ResponseEntity.ok(expenseRepository.save(expense));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        accessControlService.require(auth, Permission.MANAGE_EXPENSES);
        expenseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
