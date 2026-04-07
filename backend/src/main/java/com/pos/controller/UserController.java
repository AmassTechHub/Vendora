package com.pos.controller;

import com.pos.dto.CreateUserRequest;
import com.pos.dto.UserResponse;
import com.pos.model.User;
import com.pos.repository.UserRepository;
import com.pos.security.AccessControlService;
import com.pos.security.Permission;
import com.pos.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccessControlService accessControlService;
    private final AuditLogService auditLogService;

    public UserController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AccessControlService accessControlService,
            AuditLogService auditLogService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.accessControlService = accessControlService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<UserResponse> getAll(Authentication auth, HttpServletRequest request) {
        accessControlService.require(auth, Permission.MANAGE_USERS);
        auditLogService.log(auth, request, "LIST_USERS", "USER", null, "Fetched user list", "SUCCESS");
        return userRepository.findAll().stream().map(UserResponse::fromEntity).toList();
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateUserRequest body, Authentication auth, HttpServletRequest request) {
        accessControlService.require(auth, Permission.MANAGE_USERS);
        if (userRepository.existsByUsername(body.username())) {
            auditLogService.log(auth, request, "CREATE_USER", "USER", body.username(), "Username already exists", "FAILED");
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }
        User user = new User();
        user.setUsername(body.username());
        user.setPassword(passwordEncoder.encode(body.password()));
        user.setFullName(body.fullName());
        user.setRole(body.role());
        User saved = userRepository.save(user);
        auditLogService.log(auth, request, "CREATE_USER", "USER", saved.getId().toString(), "Created role " + saved.getRole().name(), "SUCCESS");
        return ResponseEntity.ok(UserResponse.fromEntity(saved));
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggleActive(@PathVariable long id, Authentication auth, HttpServletRequest request) {
        accessControlService.require(auth, Permission.MANAGE_USERS);
        return userRepository.findById(id).map(u -> {
            u.setActive(!u.isActive());
            User saved = userRepository.save(u);
            auditLogService.log(auth, request, "TOGGLE_USER_STATUS", "USER", saved.getId().toString(), "User active=" + saved.isActive(), "SUCCESS");
            return ResponseEntity.ok(UserResponse.fromEntity(saved));
        }).orElse(ResponseEntity.notFound().build());
    }
}
