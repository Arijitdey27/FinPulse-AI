package com.finops.service.dto;

import java.math.BigDecimal;

public record CloudResourceDto(
        String id,
        String resourceName,
        String resourceType,
        String instanceType,
        BigDecimal hourlyCost,
        String status
) {
}
