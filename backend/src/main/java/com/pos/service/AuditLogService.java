package com.pos.service;

import com.pos.model.AuditLog;
import com.pos.model.User;
import com.pos.repository.AuditLogRepository;
import com.pos.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLogService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    public void log(Authentication auth, HttpServletRequest request, String action, String resourceType, String resourceId, String details, String status) {
        AuditLog auditLog = new AuditLog();
        if (auth != null && auth.getName() != null) {
            auditLog.setUsername(auth.getName());
            userRepository.findByUsername(auth.getName()).map(User::getId).ifPresent(auditLog::setUserId);
        } else {
            auditLog.setUsername("anonymous");
        }
        auditLog.setAction(action);
        auditLog.setResourceType(resourceType);
        auditLog.setResourceId(resourceId);
        auditLog.setDetails(details);
        auditLog.setStatus(status);
        if (request != null) {
            auditLog.setIpAddress(resolveClientIp(request));
        }
        auditLogRepository.save(auditLog);
    }

    public List<AuditLog> recent() {
        return auditLogRepository.findTop200ByOrderByCreatedAtDesc();
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
