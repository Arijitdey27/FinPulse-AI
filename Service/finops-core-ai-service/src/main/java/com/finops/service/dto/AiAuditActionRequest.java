package com.finops.service.dto;

import jakarta.validation.constraints.NotBlank;

public record AiAuditActionRequest(
        @NotBlank(message = "resourceName is required")
        String resourceName,
        @NotBlank(message = "recommendedAction is required")
        String recommendedAction,
        @NotBlank(message = "recommendedInstanceType is required")
        String recommendedInstanceType
) {
}
