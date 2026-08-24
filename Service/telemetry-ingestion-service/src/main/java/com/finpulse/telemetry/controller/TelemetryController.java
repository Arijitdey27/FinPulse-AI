package com.finpulse.telemetry.controller;

import com.finpulse.telemetry.dto.AnomalyInjectionRequest;
import com.finpulse.telemetry.dto.ManualMetricIngestRequest;
import com.finpulse.telemetry.dto.MetricPageResponseDto;
import com.finpulse.telemetry.dto.MetricResponseDto;
import com.finpulse.telemetry.dto.ResourceMetricSummaryDto;
import com.finpulse.telemetry.service.TelemetryGeneratorService;
import com.finpulse.telemetry.service.TelemetryIngestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/telemetry")
@RequiredArgsConstructor
@Tag(name = "Telemetry Ingestion Engine")
public class TelemetryController {

    private final TelemetryGeneratorService telemetryGeneratorService;
    private final TelemetryIngestionService telemetryIngestionService;

    @PostMapping("/generate")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Trigger a telemetry generation cycle", description = "Runs one immediate telemetry simulation pass for every active cloud resource.")
    @ApiResponse(
            responseCode = "200",
            description = "Telemetry generation completed",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = MetricResponseDto.class))))
    public List<MetricResponseDto> generateTelemetry() {
        return telemetryGeneratorService.generateTelemetryCycle();
    }

    @PostMapping("/ingest")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Ingest a single telemetry metric", description = "Persists a custom metric payload for a specific cloud resource.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Metric ingested successfully",
                    content = @Content(schema = @Schema(implementation = MetricResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid payload supplied"),
            @ApiResponse(responseCode = "404", description = "Target resource not found")
    })
    public MetricResponseDto ingestMetric(@Valid @RequestBody ManualMetricIngestRequest request) {
        return telemetryIngestionService.ingestManualMetric(request);
    }

    @PostMapping("/inject-anomaly")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Inject a telemetry anomaly", description = "Creates either a utilization spike or an extreme idle drop for live demos and downstream detection testing.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Anomaly injected successfully",
                    content = @Content(schema = @Schema(implementation = MetricResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid anomaly request"),
            @ApiResponse(responseCode = "404", description = "Target resource not found")
    })
    public MetricResponseDto injectAnomaly(@Valid @RequestBody AnomalyInjectionRequest request) {
        return telemetryIngestionService.injectAnomaly(request);
    }

    @GetMapping("/health-metrics")
    @Operation(summary = "Read service telemetry health metrics", description = "Returns a lightweight operational summary including total ingested rows, active resources, and the latest telemetry timestamp.")
    @ApiResponse(
            responseCode = "200",
            description = "Health metrics returned successfully",
            content = @Content(schema = @Schema(implementation = ResourceMetricSummaryDto.class)))
    public ResourceMetricSummaryDto getHealthMetrics() {
        return telemetryIngestionService.getHealthMetrics();
    }

    @GetMapping("/resource/{resourceId}/recent")
    @Operation(summary = "Fetch recent telemetry for a resource", description = "Returns a paged slice of recent telemetry records for chart rendering and debugging.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Recent metrics returned successfully",
                    content = @Content(schema = @Schema(implementation = MetricPageResponseDto.class))),
            @ApiResponse(responseCode = "404", description = "Target resource not found")
    })
    public MetricPageResponseDto getRecentMetrics(
            @Parameter(description = "Cloud resource identifier", example = "4aa03bb6-53d0-43aa-98cf-b0fab75b6151")
            @PathVariable String resourceId,
            @Parameter(description = "Zero-based page index", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10")
            @RequestParam(defaultValue = "10") int size) {
        return telemetryIngestionService.getRecentMetrics(resourceId, page, size);
    }
}
