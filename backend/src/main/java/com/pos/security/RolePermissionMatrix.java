package com.pos.security;

import com.pos.model.User;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

@Component
public class RolePermissionMatrix {
    private final Map<User.Role, Set<Permission>> matrix = new EnumMap<>(User.Role.class);

    public RolePermissionMatrix() {
        matrix.put(User.Role.ADMIN, EnumSet.allOf(Permission.class));
        matrix.put(User.Role.MANAGER, EnumSet.of(
                Permission.VIEW_DASHBOARD,
                Permission.VIEW_REPORTS,
                Permission.VIEW_PRODUCTS,
                Permission.MANAGE_PRODUCTS,
                Permission.VIEW_CUSTOMERS,
                Permission.MANAGE_CUSTOMERS,
                Permission.VIEW_SALES,
                Permission.CREATE_SALES,
                Permission.PROCESS_PAYMENTS,
                Permission.MANAGE_EXPENSES,
                Permission.MANAGE_REFUNDS,
                Permission.MANAGE_SUPPLIERS,
                Permission.MANAGE_SHIFTS
        ));
        matrix.put(User.Role.CASHIER, EnumSet.of(
                Permission.VIEW_PRODUCTS,
                Permission.VIEW_CUSTOMERS,
                Permission.VIEW_SALES,
                Permission.CREATE_SALES,
                Permission.PROCESS_PAYMENTS,
                Permission.MANAGE_SHIFTS
        ));
    }

    public boolean hasPermission(User.Role role, Permission permission) {
        return matrix.getOrDefault(role, Set.of()).contains(permission);
    }
}
