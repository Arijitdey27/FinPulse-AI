package com.finpulse.telemetry.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
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
@Schema(description = "Paged telemetry metric response")
public class MetricPageResponseDto {

    @Schema(description = "Requested page index", example = "0")
    private int page;

    @Schema(description = "Requested page size", example = "10")
    private int size;

    @Schema(description = "Total number of pages", example = "5")
    private int totalPages;

    @Schema(description = "Total number of records", example = "47")
    private long totalElements;

    @Schema(description = "Whether a next page exists", example = "true")
    private boolean hasNext;

    @Schema(description = "Whether a previous page exists", example = "false")
    private boolean hasPrevious;

    @Schema(description = "Page content")
    private List<MetricResponseDto> content;
}
