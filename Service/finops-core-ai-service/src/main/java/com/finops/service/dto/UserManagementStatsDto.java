package com.finops.service.dto;

public record UserManagementStatsDto(
        long totalUsers,
        long adminUsers,
        long standardUsers
) {
}
