package com.finops.service.dto;

import java.time.Instant;

public record AuthResponse(
        String accessToken,
        Instant expiresAt,
        String tenantId,
        String tenantName,
        String userId,
        String email,
        String role
) {
}
