package com.finpulse.telemetry.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
@Schema(description = "Payload for manually ingesting a single telemetry metric")
public class ManualMetricIngestRequest {

    @NotBlank
    @Schema(description = "Target cloud resource identifier", example = "4aa03bb6-53d0-43aa-98cf-b0fab75b6151")
    private String resourceId;

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("100.00")
    @Schema(description = "CPU utilization percentage", example = "41.23")
    private BigDecimal cpuUtilizationPct;

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("100.00")
    @Schema(description = "Memory utilization percentage", example = "55.80")
    private BigDecimal memoryUtilizationPct;

    @NotNull
    @Min(0)
    @Schema(description = "Storage IOPS value", example = "220")
    private Integer storageIops;

    @Schema(description = "Event timestamp. Defaults to current UTC time when omitted.", example = "2026-08-22T12:45:00")
    private LocalDateTime recordedAt;
}
