package com.finops.service.dto;

import java.math.BigDecimal;

public record InternalCloudResourceDto(
        String id,
        String tenantId,
        String resourceName,
        String resourceType,
        String instanceType,
        BigDecimal hourlyCost,
        String status
) {
}
