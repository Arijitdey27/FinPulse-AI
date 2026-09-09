package com.finops.service.dto;

import java.time.LocalDateTime;

public record UserSummaryDto(
        String id,
        String name,
        String email,
        String role,
        String description,
        LocalDateTime createdAt
) {
}
