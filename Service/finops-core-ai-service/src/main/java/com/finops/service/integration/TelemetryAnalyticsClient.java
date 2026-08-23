package com.finops.service.integration;

import com.finops.service.dto.TelemetryCostTrendDto;
import com.finops.service.dto.TelemetryUnderutilizedResourceDto;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class TelemetryAnalyticsClient {

    private final RestClient restClient;

    public TelemetryAnalyticsClient(
            RestClient.Builder restClientBuilder,
            @Value("${telemetry.service.base-url:http://localhost:8081}") String telemetryBaseUrl) {
        this.restClient = restClientBuilder
                .baseUrl(telemetryBaseUrl)
                .build();
    }

    public BigDecimal getEstimatedWaste(String tenantId, int lookbackDays) {
        return findUnderutilizedResources(tenantId, lookbackDays).stream()
                .map(resource -> resource.hourlyCost().multiply(BigDecimal.valueOf(24L * 30L)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public List<TelemetryUnderutilizedResourceDto> findUnderutilizedResources(String tenantId, int lookbackDays) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v1/telemetry/internal/analytics/tenants/{tenantId}/underutilized")
                        .queryParam("lookbackDays", lookbackDays)
                        .build(tenantId))
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });
    }

    public List<TelemetryCostTrendDto> getCostTrends(String tenantId, int days) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v1/telemetry/internal/analytics/tenants/{tenantId}/cost-trends")
                        .queryParam("days", days)
                        .build(tenantId))
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });
    }
}
