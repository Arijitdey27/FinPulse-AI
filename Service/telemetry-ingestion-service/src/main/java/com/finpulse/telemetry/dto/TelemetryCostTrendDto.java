package com.finpulse.telemetry.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TelemetryCostTrendDto(
        LocalDate date,
        BigDecimal totalDailyCost,
        BigDecimal avgCpuPct
) {
}
