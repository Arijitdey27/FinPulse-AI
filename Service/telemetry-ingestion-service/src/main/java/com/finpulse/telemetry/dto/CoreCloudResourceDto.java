package com.finpulse.telemetry.dto;

import java.math.BigDecimal;

public record CoreCloudResourceDto(
        String id,
        String tenantId,
        String resourceName,
        String resourceType,
        String instanceType,
        BigDecimal hourlyCost,
        String status
) {
}
