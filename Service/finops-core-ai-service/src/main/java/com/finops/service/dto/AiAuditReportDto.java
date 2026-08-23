package com.finops.service.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AiAuditReportDto(
        Long auditId,
        String tenantId,
        BigDecimal totalPotentialSavings,
        String auditSummary,
        List<AiRecommendationItemDto> recommendations,
        LocalDateTime createdAt
) {
}
