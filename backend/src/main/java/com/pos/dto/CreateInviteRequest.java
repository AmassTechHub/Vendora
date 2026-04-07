package com.pos.dto;

import com.pos.model.User;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateInviteRequest(
        @NotNull(message = "Role is required")
        User.Role role,
        @Min(value = 1, message = "Expiry hours must be at least 1")
        @Max(value = 168, message = "Expiry hours cannot exceed 168")
        Integer expiresInHours
) {
}
