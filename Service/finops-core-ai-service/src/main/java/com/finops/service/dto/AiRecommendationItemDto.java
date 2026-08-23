package com.finops.service.dto;

import java.math.BigDecimal;

public record AiRecommendationItemDto(
        String resourceName,
        BigDecimal currentCostMonthly,
        String recommendedAction,
        String recommendedInstanceType,
        BigDecimal estimatedMonthlySavings,
        String reasoning
) {
}
