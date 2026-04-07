package com.pos.controller;

import com.pos.model.Customer;
import com.pos.model.Sale;
import com.pos.security.AccessControlService;
import com.pos.security.Permission;
import com.pos.service.AuditLogService;
import com.pos.service.CustomerService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;
    private final AccessControlService accessControlService;
    private final AuditLogService auditLogService;

    public CustomerController(
            CustomerService customerService,
            AccessControlService accessControlService,
            AuditLogService auditLogService
    ) {
        this.customerService = customerService;
        this.accessControlService = accessControlService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<Customer> getAll(Authentication auth) {
        accessControlService.require(auth, Permission.VIEW_CUSTOMERS);
        return customerService.getAll();
    }

    @GetMapping("/search")
    public List<Customer> search(@RequestParam String q, Authentication auth) {
        accessControlService.require(auth, Permission.VIEW_CUSTOMERS);
        return customerService.search(q);
    }

    @GetMapping("/{id}/purchases")
    public List<Sale> getPurchaseHistory(@PathVariable Long id, Authentication auth) {
        accessControlService.require(auth, Permission.VIEW_CUSTOMERS);
        return customerService.getPurchaseHistory(id);
    }

    @PostMapping
    public Customer create(@RequestBody Customer customer, Authentication auth, HttpServletRequest request) {
        accessControlService.require(auth, Permission.MANAGE_CUSTOMERS);
        Customer saved = customerService.create(customer);
        auditLogService.log(auth, request, "CREATE_CUSTOMER", "CUSTOMER", saved.getId().toString(), saved.getName(), "SUCCESS");
        return saved;
    }

    @PutMapping("/{id}")
    public Customer update(@PathVariable Long id, @RequestBody Customer customer, Authentication auth, HttpServletRequest request) {
        accessControlService.require(auth, Permission.MANAGE_CUSTOMERS);
        Customer updated = customerService.update(id, customer);
        auditLogService.log(auth, request, "UPDATE_CUSTOMER", "CUSTOMER", id.toString(), updated.getName(), "SUCCESS");
        return updated;
    }
}
