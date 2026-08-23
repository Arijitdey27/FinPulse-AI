package com.finpulse.telemetry.integration;

import com.finpulse.telemetry.dto.CoreCloudResourceDto;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class CoreResourceClient {

    private final RestClient restClient;

    public CoreResourceClient(
            RestClient.Builder restClientBuilder,
            @Value("${core.service.base-url:http://localhost:8082}") String coreServiceBaseUrl) {
        this.restClient = restClientBuilder
                .baseUrl(coreServiceBaseUrl)
                .build();
    }

    public CoreCloudResourceDto getResource(String resourceId) {
        return restClient.get()
                .uri("/api/internal/resources/{resourceId}", resourceId)
                .retrieve()
                .body(CoreCloudResourceDto.class);
    }

    public CoreCloudResourceDto getActiveResource(String resourceId) {
        return restClient.get()
                .uri("/api/internal/resources/{resourceId}/active", resourceId)
                .retrieve()
                .body(CoreCloudResourceDto.class);
    }

    public List<CoreCloudResourceDto> getActiveResources() {
        return restClient.get()
                .uri("/api/internal/resources/active")
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });
    }
}
