package com.finpulse.telemetry.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
@Schema(description = "Payload for injecting controlled anomalies into the telemetry stream")
public class AnomalyInjectionRequest {

    @NotBlank
    @Schema(description = "Target cloud resource identifier", example = "0a3fe15b-1bcf-43eb-a68b-4fc7f131f347")
    private String resourceId;

    @NotBlank
    @Pattern(regexp = "SPIKE|IDLE_DROP", message = "anomalyType must be SPIKE or IDLE_DROP")
    @Schema(description = "Anomaly flavor. Use SPIKE for sudden overutilization or IDLE_DROP for extreme underutilization.", example = "SPIKE")
    private String anomalyType;
}
