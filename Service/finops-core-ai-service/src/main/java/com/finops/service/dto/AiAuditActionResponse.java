package com.finops.service.dto;

import java.time.LocalDateTime;

public record AiAuditActionResponse(
        Long actionId,
        Long auditId,
        String resourceName,
        String recommendedAction,
        String recommendedInstanceType,
        String status,
        String message,
        LocalDateTime createdAt
) {
}
