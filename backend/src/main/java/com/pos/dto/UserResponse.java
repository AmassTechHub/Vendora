package com.pos.dto;

import com.pos.model.User;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String username,
        String fullName,
        User.Role role,
        boolean active,
        LocalDateTime createdAt
) {
    public static UserResponse fromEntity(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
