package com.finpulse.telemetry.controller;

import com.finpulse.telemetry.dto.TelemetryCostTrendDto;
import com.finpulse.telemetry.dto.TelemetryUnderutilizedResourceDto;
import com.finpulse.telemetry.service.TelemetryAnalyticsService;
import io.swagger.v3.oas.annotations.Hidden;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Hidden
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/telemetry/internal/analytics/tenants")
public class TelemetryAnalyticsController {

    private final TelemetryAnalyticsService telemetryAnalyticsService;

    @GetMapping("/{tenantId}/underutilized")
    public List<TelemetryUnderutilizedResourceDto> getUnderutilizedResources(
            @PathVariable String tenantId,
            @RequestParam(defaultValue = "30") int lookbackDays) {
        return telemetryAnalyticsService.findUnderutilizedResources(tenantId, lookbackDays);
    }

    @GetMapping("/{tenantId}/cost-trends")
    public List<TelemetryCostTrendDto> getCostTrends(
            @PathVariable String tenantId,
            @RequestParam(defaultValue = "14") int days) {
        return telemetryAnalyticsService.getCostTrends(tenantId, days);
    }
}
