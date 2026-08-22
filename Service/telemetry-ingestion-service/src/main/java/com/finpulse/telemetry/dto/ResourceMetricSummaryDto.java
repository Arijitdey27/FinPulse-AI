package com.finpulse.telemetry.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "High-level telemetry ingestion health summary")
public class ResourceMetricSummaryDto {

    @Schema(description = "Total usage metric rows stored", example = "500")
    private long totalRecords;

    @Schema(description = "Total active resources in the catalog", example = "4")
    private long activeResources;

    @Schema(description = "Most recent telemetry timestamp in UTC", example = "2026-08-22T12:45:00")
    private LocalDateTime lastRecordedTimestamp;
}
