package com.finops.service.controller;

import com.finops.service.dto.CloudResourceDto;
import com.finops.service.dto.CostTrendDto;
import com.finops.service.dto.DashboardSummaryDto;
import com.finops.service.security.AuthenticatedUser;
import com.finops.service.service.CostAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final CostAnalyticsService costAnalyticsService;

    @GetMapping("/dashboard/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Tag(name = "Cost Analytics")
    @Operation(summary = "Return dashboard KPI cards for the authenticated tenant")
    public DashboardSummaryDto getSummary(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return costAnalyticsService.getDashboardSummary(currentUser.tenantId());
    }

    @GetMapping("/dashboard/trends")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Tag(name = "Cost Analytics")
    @Operation(summary = "Return tenant spend and CPU utilization trends for charting")
    public java.util.List<CostTrendDto> getTrends(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @Parameter(description = "Number of trailing days to include")
            @RequestParam(defaultValue = "14") int days) {
        return costAnalyticsService.getCostTrends(currentUser.tenantId(), days);
    }

    @GetMapping("/resources")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Tag(name = "Resource Management")
    @Operation(summary = "Return a paginated list of active tenant cloud resources")
    public Page<CloudResourceDto> getResources(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10) Pageable pageable) {
        return costAnalyticsService.getResources(currentUser.tenantId(), type, search, pageable);
    }
}
