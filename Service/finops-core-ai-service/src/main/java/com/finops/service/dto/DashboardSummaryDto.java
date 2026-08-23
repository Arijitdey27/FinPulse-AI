package com.finops.service.dto;

import java.math.BigDecimal;

public record DashboardSummaryDto(
        BigDecimal totalMonthlySpend,
        long totalActiveResources,
        BigDecimal estimatedWaste
) {
}
