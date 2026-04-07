package com.pos.controller;

import com.pos.model.Supplier;
import com.pos.repository.SupplierRepository;
import com.pos.security.AccessControlService;
import com.pos.security.Permission;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierRepository supplierRepository;
    private final AccessControlService accessControlService;

    public SupplierController(SupplierRepository supplierRepository, AccessControlService accessControlService) {
        this.supplierRepository = supplierRepository;
        this.accessControlService = accessControlService;
    }

    @GetMapping
    public ResponseEntity<List<Supplier>> list(@RequestParam(required = false) String q, Authentication auth) {
        accessControlService.require(auth, Permission.VIEW_PRODUCTS);
        List<Supplier> result = q != null && !q.isBlank()
                ? supplierRepository.findByNameContainingIgnoreCaseAndActiveTrue(q)
                : supplierRepository.findByActiveTrue();
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<Supplier> create(@RequestBody Supplier supplier, Authentication auth) {
        accessControlService.require(auth, Permission.MANAGE_PRODUCTS);
        supplier.setActive(true);
        return ResponseEntity.ok(supplierRepository.save(supplier));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Supplier> update(@PathVariable Long id, @RequestBody Supplier body, Authentication auth) {
        accessControlService.require(auth, Permission.MANAGE_PRODUCTS);
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        supplier.setName(body.getName());
        supplier.setContactPerson(body.getContactPerson());
        supplier.setPhone(body.getPhone());
        supplier.setEmail(body.getEmail());
        supplier.setAddress(body.getAddress());
        supplier.setNotes(body.getNotes());
        return ResponseEntity.ok(supplierRepository.save(supplier));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        accessControlService.require(auth, Permission.MANAGE_PRODUCTS);
        supplierRepository.findById(id).ifPresent(s -> {
            s.setActive(false);
            supplierRepository.save(s);
        });
        return ResponseEntity.noContent().build();
    }
}
