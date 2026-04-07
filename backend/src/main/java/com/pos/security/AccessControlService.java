package com.pos.security;

import com.pos.exception.ApiException;
import com.pos.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AccessControlService {
    private final RolePermissionMatrix rolePermissionMatrix;

    public AccessControlService(RolePermissionMatrix rolePermissionMatrix) {
        this.rolePermissionMatrix = rolePermissionMatrix;
    }

    public void require(Authentication auth, Permission permission) {
        if (auth == null || auth.getAuthorities() == null) {
            throw new ApiException("Unauthorized", HttpStatus.UNAUTHORIZED);
        }

        String authority = auth.getAuthorities().stream()
                .map(granted -> granted.getAuthority())
                .filter(value -> value != null && value.startsWith("ROLE_"))
                .findFirst()
                .orElseThrow(() -> new ApiException("Unauthorized", HttpStatus.UNAUTHORIZED));

        User.Role role;
        try {
            role = User.Role.valueOf(authority.substring("ROLE_".length()));
        } catch (IllegalArgumentException ex) {
            throw new ApiException("Invalid role", HttpStatus.FORBIDDEN);
        }

        if (!rolePermissionMatrix.hasPermission(role, permission)) {
            throw new ApiException("You do not have permission to perform this action", HttpStatus.FORBIDDEN);
        }
    }
}
