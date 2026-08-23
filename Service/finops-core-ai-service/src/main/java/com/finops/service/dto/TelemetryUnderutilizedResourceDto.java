package com.finops.service.dto;

import java.math.BigDecimal;

public record TelemetryUnderutilizedResourceDto(
        String resourceId,
        String resourceName,
        String resourceType,
        String instanceType,
        BigDecimal hourlyCost,
        BigDecimal avgCpuPct,
        BigDecimal avgMemoryPct
) {
}
