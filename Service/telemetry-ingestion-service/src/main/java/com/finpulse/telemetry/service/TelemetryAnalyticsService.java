package com.finpulse.telemetry.service;

import com.finpulse.telemetry.dto.TelemetryCostTrendDto;
import com.finpulse.telemetry.dto.TelemetryUnderutilizedResourceDto;
import com.finpulse.telemetry.repository.UsageMetricRepository;
import com.finpulse.telemetry.repository.projection.DailyTrendProjection;
import com.finpulse.telemetry.repository.projection.UnderutilizedResourceProjection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TelemetryAnalyticsService {

    private final UsageMetricRepository usageMetricRepository;

    @Transactional(readOnly = true)
    public List<TelemetryUnderutilizedResourceDto> findUnderutilizedResources(String tenantId, int lookbackDays) {
        return usageMetricRepository.findUnderutilizedResources(tenantId, lookbackDays).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TelemetryCostTrendDto> getCostTrends(String tenantId, int days) {
        return usageMetricRepository.findDailyCostTrends(tenantId, Math.max(days, 1)).stream()
                .map(this::toDto)
                .toList();
    }

    private TelemetryUnderutilizedResourceDto toDto(UnderutilizedResourceProjection projection) {
        return new TelemetryUnderutilizedResourceDto(
                projection.getResourceId(),
                projection.getResourceName(),
                projection.getResourceType(),
                projection.getInstanceType(),
                projection.getHourlyCost(),
                projection.getAvgCpuPct(),
                projection.getAvgMemoryPct()
        );
    }

    private TelemetryCostTrendDto toDto(DailyTrendProjection projection) {
        return new TelemetryCostTrendDto(
                projection.getTrendDate(),
                projection.getTotalDailyCost(),
                projection.getAvgCpuPct()
        );
    }
}
