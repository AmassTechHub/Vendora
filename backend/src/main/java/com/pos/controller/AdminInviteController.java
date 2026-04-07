package com.pos.controller;

import com.pos.dto.CreateInviteRequest;
import com.pos.model.InviteCode;
import com.pos.model.User;
import com.pos.repository.InviteCodeRepository;
import com.pos.repository.UserRepository;
import com.pos.security.AccessControlService;
import com.pos.security.Permission;
import com.pos.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/invites")
public class AdminInviteController {
    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private final SecureRandom secureRandom = new SecureRandom();

    private final InviteCodeRepository inviteCodeRepository;
    private final UserRepository userRepository;
    private final AccessControlService accessControlService;
    private final AuditLogService auditLogService;

    public AdminInviteController(
            InviteCodeRepository inviteCodeRepository,
            UserRepository userRepository,
            AccessControlService accessControlService,
            AuditLogService auditLogService
    ) {
        this.inviteCodeRepository = inviteCodeRepository;
        this.userRepository = userRepository;
        this.accessControlService = accessControlService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<Map<String, Object>> list(Authentication auth) {
        accessControlService.require(auth, Permission.MANAGE_USERS);
        List<Map<String, Object>> payload = new ArrayList<>();
        for (InviteCode invite : inviteCodeRepository.findTop100ByOrderByCreatedAtDesc()) {
            payload.add(Map.of(
                    "id", invite.getId(),
                    "code", invite.getCode(),
                    "role", invite.getRole().name(),
                    "expiresAt", invite.getExpiresAt(),
                    "used", invite.isUsed(),
                    "usedByUsername", invite.getUsedByUsername() == null ? "" : invite.getUsedByUsername(),
                    "usedAt", invite.getUsedAt() == null ? "" : invite.getUsedAt().toString(),
                    "createdAt", invite.getCreatedAt()
            ));
        }
        return payload;
    }

    @PostMapping
    public Map<String, Object> create(@Valid @RequestBody CreateInviteRequest body, Authentication auth, HttpServletRequest request) {
        accessControlService.require(auth, Permission.MANAGE_USERS);
        User admin = userRepository.findByUsername(auth.getName()).orElse(null);
        int hours = body.expiresInHours() == null ? 24 : body.expiresInHours();

        InviteCode inviteCode = new InviteCode();
        inviteCode.setCode(generateUniqueCode());
        inviteCode.setRole(body.role());
        inviteCode.setCreatedBy(admin);
        inviteCode.setExpiresAt(LocalDateTime.now().plusHours(hours));
        inviteCodeRepository.save(inviteCode);

        auditLogService.log(auth, request, "CREATE_INVITE", "INVITE", inviteCode.getCode(), "Role " + body.role().name(), "SUCCESS");
        return Map.of(
                "id", inviteCode.getId(),
                "code", inviteCode.getCode(),
                "role", inviteCode.getRole().name(),
                "expiresAt", inviteCode.getExpiresAt()
        );
    }

    private String generateUniqueCode() {
        String code;
        do {
            code = randomBlock(4) + "-" + randomBlock(4);
        } while (inviteCodeRepository.findByCodeIgnoreCase(code).isPresent());
        return code;
    }

    private String randomBlock(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(ALPHABET.charAt(secureRandom.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
