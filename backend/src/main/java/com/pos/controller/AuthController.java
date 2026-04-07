package com.pos.controller;

import com.pos.dto.LoginRequest;
import com.pos.dto.ChangePasswordRequest;
import com.pos.dto.RefreshTokenRequest;
import com.pos.dto.RegisterRequest;
import com.pos.dto.SetupAdminRequest;
import com.pos.dto.UpdateProfileRequest;
import com.pos.exception.ApiException;
import com.pos.model.InviteCode;
import com.pos.model.User;
import com.pos.repository.InviteCodeRepository;
import com.pos.repository.UserRepository;
import com.pos.security.JwtUtil;
import com.pos.service.AuditLogService;
import com.pos.service.RefreshTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final InviteCodeRepository inviteCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final AuditLogService auditLogService;
    private final boolean setupEnabled;
    private final boolean publicSignupEnabled;
    private final int maxLoginAttempts;
    private final int lockMinutes;

    public AuthController(
            UserRepository userRepository,
            InviteCodeRepository inviteCodeRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            RefreshTokenService refreshTokenService,
            AuditLogService auditLogService,
            @Value("${auth.setup.enabled:true}") boolean setupEnabled,
            @Value("${auth.public-signup-enabled:true}") boolean publicSignupEnabled,
            @Value("${auth.max-login-attempts:5}") int maxLoginAttempts,
            @Value("${auth.lock-minutes:15}") int lockMinutes
    ) {
        this.userRepository = userRepository;
        this.inviteCodeRepository = inviteCodeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
        this.auditLogService = auditLogService;
        this.setupEnabled = setupEnabled;
        this.publicSignupEnabled = publicSignupEnabled;
        this.maxLoginAttempts = maxLoginAttempts;
        this.lockMinutes = lockMinutes;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest body, HttpServletRequest request) {
        String username = body.username();
        String password = body.password();

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            auditLogService.log(null, request, "LOGIN", "AUTH", username, "Invalid credentials", "FAILED");
            throw new ApiException("Invalid credentials", HttpStatus.UNAUTHORIZED);
        }

        if (!user.isActive()) {
            auditLogService.log(null, request, "LOGIN", "AUTH", username, "Inactive account", "FAILED");
            throw new ApiException("Your account is inactive", HttpStatus.UNAUTHORIZED);
        }
        if (user.getLockoutUntil() != null && user.getLockoutUntil().isAfter(LocalDateTime.now())) {
            auditLogService.log(null, request, "LOGIN", "AUTH", username, "Account locked", "FAILED");
            throw new ApiException("Account temporarily locked. Try again later.", HttpStatus.TOO_MANY_REQUESTS);
        }
        if (!passwordEncoder.matches(password, user.getPassword())) {
            registerFailedLogin(user);
            auditLogService.log(null, request, "LOGIN", "AUTH", username, "Invalid credentials", "FAILED");
            throw new ApiException("Invalid credentials", HttpStatus.UNAUTHORIZED);
        }

        user.setFailedLoginAttempts(0);
        user.setLockoutUntil(null);
        userRepository.save(user);

        refreshTokenService.cleanExpired();
        String accessToken = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        String refreshToken = refreshTokenService.issue(user);
        auditLogService.log(null, request, "LOGIN", "AUTH", username, "Login success", "SUCCESS");

        return ResponseEntity.ok(Map.of(
                "token", accessToken,
                "refreshToken", refreshToken,
                "role", user.getRole().name(),
                "fullName", user.getFullName(),
                "id", user.getId()
        ));
    }

    @PostMapping("/setup")
    public ResponseEntity<?> setup(@Valid @RequestBody SetupAdminRequest body, HttpServletRequest request) {
        if (!setupEnabled) {
            return ResponseEntity.status(403).body(Map.of(
                    "error", "Initial setup endpoint is disabled"
            ));
        }

        if (userRepository.count() > 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "System already initialized"));
        }
        if (userRepository.existsByUsername(body.username())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }

        User admin = new User();
        admin.setUsername(body.username());
        admin.setPassword(passwordEncoder.encode(body.password()));
        admin.setFullName(body.fullName());
        admin.setRole(User.Role.ADMIN);
        userRepository.save(admin);
        auditLogService.log(null, request, "INITIAL_SETUP", "USER", admin.getUsername(), "Created first admin account", "SUCCESS");
        return ResponseEntity.ok(Map.of("message", "Admin account created successfully"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest body, HttpServletRequest request) {
        if (!publicSignupEnabled) {
            throw new ApiException("Public account creation is disabled", HttpStatus.FORBIDDEN);
        }
        if (userRepository.existsByUsername(body.username())) {
            throw new ApiException("Username already exists", HttpStatus.BAD_REQUEST);
        }
        long existingUsers = userRepository.count();

        InviteCode invite = null;
        if (existingUsers > 0) {
            if (body.inviteCode() == null || body.inviteCode().isBlank()) {
                throw new ApiException("Invite code is required", HttpStatus.BAD_REQUEST);
            }
            invite = inviteCodeRepository.findByCodeIgnoreCase(body.inviteCode().trim())
                    .orElseThrow(() -> new ApiException("Invalid invite code", HttpStatus.BAD_REQUEST));

            if (invite.isUsed()) {
                throw new ApiException("Invite code has already been used", HttpStatus.BAD_REQUEST);
            }
            if (invite.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new ApiException("Invite code has expired", HttpStatus.BAD_REQUEST);
            }
        }

        User.Role assignedRole = existingUsers == 0
                ? User.Role.ADMIN
                : (invite != null ? invite.getRole() : User.Role.CASHIER);

        User user = new User();
        user.setUsername(body.username().trim());
        user.setFullName(body.fullName().trim());
        user.setPassword(passwordEncoder.encode(body.password()));
        user.setRole(assignedRole);
        userRepository.save(user);

        if (invite != null) {
            invite.setUsed(true);
            invite.setUsedByUsername(user.getUsername());
            invite.setUsedAt(LocalDateTime.now());
            inviteCodeRepository.save(invite);
        }

        auditLogService.log(null, request, "REGISTER_ACCOUNT", "USER", user.getUsername(), "Public signup", "SUCCESS");
        return ResponseEntity.ok(Map.of(
                "message", "Account created successfully. Please sign in.",
                "role", user.getRole().name()
        ));
    }

    @GetMapping("/status")
    public ResponseEntity<?> status() {
        long userCount = userRepository.count();
        boolean canSetup = setupEnabled && userCount == 0;
        return ResponseEntity.ok(Map.of(
                "setupEnabled", setupEnabled,
                "publicSignupEnabled", publicSignupEnabled,
                "hasUsers", userCount > 0,
                "userCount", userCount,
                "canSetup", canSetup
        ));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest body, Authentication auth, HttpServletRequest request) {
        if (auth == null || auth.getName() == null) {
            throw new ApiException("Unauthorized", HttpStatus.UNAUTHORIZED);
        }

        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        if (!passwordEncoder.matches(body.currentPassword(), user.getPassword())) {
            throw new ApiException("Current password is incorrect", HttpStatus.BAD_REQUEST);
        }
        if (body.currentPassword().equals(body.newPassword())) {
            throw new ApiException("New password must be different", HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(body.newPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        userRepository.save(user);
        refreshTokenService.revokeAllForUser(user);
        auditLogService.log(auth, request, "CHANGE_PASSWORD", "USER", user.getId().toString(), "Password changed", "SUCCESS");
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshTokenRequest body) {
        User user = refreshTokenService.rotate(body.refreshToken());
        if (!user.isActive()) {
            throw new ApiException("Your account is inactive", HttpStatus.UNAUTHORIZED);
        }

        String accessToken = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        String refreshToken = refreshTokenService.issue(user);
        return ResponseEntity.ok(Map.of(
                "token", accessToken,
                "refreshToken", refreshToken,
                "role", user.getRole().name(),
                "fullName", user.getFullName(),
                "id", user.getId()
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@Valid @RequestBody RefreshTokenRequest body, Authentication auth, HttpServletRequest request) {
        refreshTokenService.revoke(body.refreshToken());
        auditLogService.log(auth, request, "LOGOUT", "AUTH", auth != null ? auth.getName() : null, "Logout success", "SUCCESS");
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ApiException("Unauthorized", HttpStatus.UNAUTHORIZED);
        }
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "fullName", user.getFullName(),
                "role", user.getRole().name(),
                "active", user.isActive()
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @Valid @RequestBody UpdateProfileRequest body,
            Authentication auth,
            HttpServletRequest request
    ) {
        if (auth == null || auth.getName() == null) {
            throw new ApiException("Unauthorized", HttpStatus.UNAUTHORIZED);
        }

        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        user.setFullName(body.fullName().trim());
        userRepository.save(user);
        auditLogService.log(auth, request, "UPDATE_PROFILE", "USER", user.getId().toString(), "Updated full name", "SUCCESS");

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "fullName", user.getFullName(),
                "role", user.getRole().name(),
                "active", user.isActive()
        ));
    }

    private void registerFailedLogin(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        if (attempts >= maxLoginAttempts) {
            user.setLockoutUntil(LocalDateTime.now().plusMinutes(lockMinutes));
            user.setFailedLoginAttempts(0);
        }
        userRepository.save(user);
    }
}
