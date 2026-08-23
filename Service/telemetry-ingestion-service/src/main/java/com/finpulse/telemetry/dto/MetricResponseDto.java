package com.finpulse.telemetry.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Single telemetry metric record returned by the ingestion engine")
public class MetricResponseDto {

    @Schema(description = "Database identifier for the metric row", example = "101")
    private Long id;

    @Schema(description = "Cloud resource identifier", example = "4aa03bb6-53d0-43aa-98cf-b0fab75b6151")
    private String resourceId;

    @Schema(description = "Resource display name", example = "acme-api-prod-01")
    private String resourceName;

    @Schema(description = "CPU utilization percentage", example = "56.42")
    private BigDecimal cpuUtilizationPct;

    @Schema(description = "Memory utilization percentage", example = "63.18")
    private BigDecimal memoryUtilizationPct;

    @Schema(description = "Observed storage IOPS", example = "120")
    private Integer storageIops;

    @Schema(description = "Metric event timestamp in UTC", example = "2026-08-22T12:45:00")
    private LocalDateTime recordedAt;
}
