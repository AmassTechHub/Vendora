package com.pos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SetupAdminRequest(
        @NotBlank(message = "Username is required")
        String username,
        @NotBlank(message = "Full name is required")
        String fullName,
        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        String password
) {
}
