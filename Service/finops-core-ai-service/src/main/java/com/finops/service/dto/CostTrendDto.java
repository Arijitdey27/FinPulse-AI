package com.finops.service.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CostTrendDto(
        LocalDate date,
        BigDecimal totalDailyCost,
        BigDecimal avgCpuPct
) {
}
