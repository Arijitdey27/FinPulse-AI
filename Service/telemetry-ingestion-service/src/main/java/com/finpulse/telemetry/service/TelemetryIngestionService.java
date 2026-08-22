package com.finpulse.telemetry.service;

import com.finpulse.telemetry.dto.AnomalyInjectionRequest;
import com.finpulse.telemetry.dto.ManualMetricIngestRequest;
import com.finpulse.telemetry.dto.MetricResponseDto;
import com.finpulse.telemetry.dto.ResourceMetricSummaryDto;
import com.finpulse.telemetry.entity.CloudResource;
import com.finpulse.telemetry.entity.UsageMetric;
import com.finpulse.telemetry.repository.CloudResourceRepository;
import com.finpulse.telemetry.repository.UsageMetricRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TelemetryIngestionService {

    private static final BigDecimal HUNDRED = new BigDecimal("100.00");

    private final CloudResourceRepository cloudResourceRepository;
    private final UsageMetricRepository usageMetricRepository;

    @Transactional
    public MetricResponseDto ingestManualMetric(ManualMetricIngestRequest request) {
        CloudResource resource = getResourceOrThrow(request.getResourceId());
        UsageMetric metric = usageMetricRepository.save(UsageMetric.builder()
                .resource(resource)
                .cpuUtilizationPct(scaleMetric(request.getCpuUtilizationPct()))
                .memoryUtilizationPct(scaleMetric(request.getMemoryUtilizationPct()))
                .storageIops(request.getStorageIops())
                .recordedAt(request.getRecordedAt() != null ? request.getRecordedAt() : LocalDateTime.now())
                .build());
        return toDto(metric);
    }

    @Transactional
    public List<MetricResponseDto> ingestBatch(List<ManualMetricIngestRequest> requests) {
        return requests.stream()
                .map(this::ingestManualMetric)
                .toList();
    }

    @Transactional
    public MetricResponseDto injectAnomaly(AnomalyInjectionRequest request) {
        CloudResource resource = getResourceOrThrow(request.getResourceId());
        String anomalyType = request.getAnomalyType().toUpperCase(Locale.ROOT);

        BigDecimal cpu;
        BigDecimal memory;
        int iops;

        if ("SPIKE".equals(anomalyType)) {
            cpu = randomDecimal(92.00, 99.90);
            memory = randomDecimal(88.00, 99.50);
            iops = ThreadLocalRandom.current().nextInt(1500, 4501);
        } else {
            cpu = randomDecimal(0.50, 2.00);
            memory = randomDecimal(1.00, 6.00);
            iops = ThreadLocalRandom.current().nextInt(0, 31);
        }

        UsageMetric metric = usageMetricRepository.save(UsageMetric.builder()
                .resource(resource)
                .cpuUtilizationPct(cpu)
                .memoryUtilizationPct(memory)
                .storageIops(iops)
                .recordedAt(LocalDateTime.now())
                .build());

        return toDto(metric);
    }

    @Transactional(readOnly = true)
    public ResourceMetricSummaryDto getHealthMetrics() {
        return ResourceMetricSummaryDto.builder()
                .totalRecords(usageMetricRepository.count())
                .activeResources(cloudResourceRepository.countByStatusIgnoreCase("ACTIVE"))
                .lastRecordedTimestamp(usageMetricRepository.findTopByOrderByRecordedAtDesc()
                        .map(UsageMetric::getRecordedAt)
                        .orElse(null))
                .build();
    }

    @Transactional(readOnly = true)
    public List<MetricResponseDto> getRecentMetrics(String resourceId) {
        getResourceOrThrow(resourceId);
        return usageMetricRepository.findByResource_IdOrderByRecordedAtDesc(resourceId, PageRequest.of(0, 50)).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CloudResource> getActiveResources() {
        return cloudResourceRepository.findByStatusIgnoreCase("ACTIVE");
    }

    @Transactional
    public MetricResponseDto saveGeneratedMetric(
            CloudResource resource,
            BigDecimal cpuUtilizationPct,
            BigDecimal memoryUtilizationPct,
            Integer storageIops,
            LocalDateTime recordedAt) {
        UsageMetric metric = usageMetricRepository.save(UsageMetric.builder()
                .resource(resource)
                .cpuUtilizationPct(scaleMetric(cpuUtilizationPct))
                .memoryUtilizationPct(scaleMetric(memoryUtilizationPct))
                .storageIops(storageIops)
                .recordedAt(recordedAt)
                .build());
        return toDto(metric);
    }

    private CloudResource getResourceOrThrow(String resourceId) {
        return cloudResourceRepository.findById(resourceId)
                .orElseThrow(() -> new EntityNotFoundException("Resource not found: " + resourceId));
    }

    private MetricResponseDto toDto(UsageMetric metric) {
        return MetricResponseDto.builder()
                .id(metric.getId())
                .resourceId(metric.getResource().getId())
                .resourceName(metric.getResource().getResourceName())
                .cpuUtilizationPct(metric.getCpuUtilizationPct())
                .memoryUtilizationPct(metric.getMemoryUtilizationPct())
                .storageIops(metric.getStorageIops())
                .recordedAt(metric.getRecordedAt())
                .build();
    }

    private BigDecimal randomDecimal(double min, double max) {
        double value = ThreadLocalRandom.current().nextDouble(min, max);
        return scaleMetric(BigDecimal.valueOf(value));
    }

    private BigDecimal scaleMetric(BigDecimal value) {
        if (value.compareTo(BigDecimal.ZERO) < 0 || value.compareTo(HUNDRED) > 0) {
            throw new IllegalArgumentException("Utilization values must be between 0 and 100");
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}
