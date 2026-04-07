package com.pos.dto;

import jakarta.validation.constraints.NotNull;

public record StockAdjustmentRequest(
        @NotNull(message = "Quantity change is required")
        Integer quantityChange,
        String reason
) {
}
