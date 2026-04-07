package com.pos.controller;

import com.pos.model.AuditLog;
import com.pos.security.AccessControlService;
import com.pos.security.Permission;
import com.pos.service.AuditLogService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/audit-logs")
public class AuditLogController {
    private final AuditLogService auditLogService;
    private final AccessControlService accessControlService;

    public AuditLogController(AuditLogService auditLogService, AccessControlService accessControlService) {
        this.auditLogService = auditLogService;
        this.accessControlService = accessControlService;
    }

    @GetMapping
    public List<AuditLog> recent(Authentication auth) {
        accessControlService.require(auth, Permission.VIEW_AUDIT_LOGS);
        return auditLogService.recent();
    }
}
