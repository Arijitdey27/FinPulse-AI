package com.finpulse.telemetry.service;

import com.finpulse.telemetry.dto.MetricResponseDto;
import com.finpulse.telemetry.dto.CoreCloudResourceDto;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TelemetryGeneratorService {

    private final TelemetryIngestionService telemetryIngestionService;

    @Value("${telemetry.generation.enabled:true}")
    private boolean generationEnabled;

    @Scheduled(fixedRate = 10000)
    public void scheduledGenerateTelemetry() {
        if (!generationEnabled) {
            return;
        }
        generateTelemetryCycle();
    }

    public List<MetricResponseDto> generateTelemetryCycle() {
        List<MetricResponseDto> generatedMetrics = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (CoreCloudResourceDto resource : telemetryIngestionService.getActiveResources()) {
            boolean underUtilized = isUnderUtilizedResource(resource.resourceName());
            BigDecimal cpu = underUtilized ? randomDecimal(1.0, 4.5) : randomDecimal(35.0, 75.0);
            BigDecimal memory = underUtilized ? randomDecimal(5.0, 18.0) : randomDecimal(40.0, 82.0);
            int iops = underUtilized
                    ? ThreadLocalRandom.current().nextInt(0, 81)
                    : ThreadLocalRandom.current().nextInt(120, 1201);

            generatedMetrics.add(telemetryIngestionService.saveGeneratedMetric(resource, cpu, memory, iops, now));
        }

        return generatedMetrics;
    }

    private boolean isUnderUtilizedResource(String resourceName) {
        String normalized = resourceName.toLowerCase(Locale.ROOT);
        return normalized.contains("idle") || normalized.contains("waste");
    }

    private BigDecimal randomDecimal(double min, double max) {
        return BigDecimal.valueOf(ThreadLocalRandom.current().nextDouble(min, max))
                .setScale(2, RoundingMode.HALF_UP);
    }
}
