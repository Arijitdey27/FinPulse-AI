package com.finpulse.telemetry.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.models.OpenAPI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "FinPulse Telemetry Ingestion API",
                version = "v1.0",
                description = "Standalone data collection engine for FinPulse AI. "
                        + "This service ingests manual telemetry, simulates live cloud usage streams, "
                        + "and exposes resource health snapshots for platform dashboards and AI analysis.",
                contact = @Contact(name = "FinPulse Platform Engineering", email = "platform@finpulse.ai"),
                license = @License(name = "Proprietary")
        ),
        servers = {
                @Server(url = "http://localhost:8081", description = "Local environment")
        },
        tags = {
                @Tag(name = "Telemetry Ingestion Engine", description = "Metric generation, ingestion, anomaly injection, and health insights")
        }
)
public class OpenApiConfig {

    @Bean
    public OpenAPI telemetryOpenApi() {
        return new OpenAPI()
                .info(new io.swagger.v3.oas.models.info.Info()
                        .title("FinPulse Telemetry Ingestion API")
                        .version("v1.0")
                        .description("Detailed API contract for the FinPulse AI telemetry ingestion engine."));
    }
}
