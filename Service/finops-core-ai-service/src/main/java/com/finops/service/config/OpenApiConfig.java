package com.finops.service.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityScheme.In;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "FinPulse Core AI API",
                version = "v1.0",
                description = "Central FinOps intelligence API for authentication, cloud cost analytics, "
                        + "resource inventory, and AI-powered optimization audits.",
                contact = @Contact(name = "FinPulse Platform Engineering", email = "platform@finpulse.ai"),
                license = @License(name = "Proprietary")
        ),
        servers = {
                @Server(url = "http://localhost:8082", description = "Local environment")
        },
        security = @SecurityRequirement(name = "bearerAuth"),
        tags = {
                @Tag(name = "Auth", description = "Authentication and JWT token issuance"),
                @Tag(name = "Cost Analytics", description = "Dashboard KPIs, run-rate trends, and spend analysis"),
                @Tag(name = "AI Auditor", description = "AI-backed cost waste audits and recommendation history"),
                @Tag(name = "Resource Management", description = "Tenant-scoped cloud resource inventory")
        }
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT"
)
public class OpenApiConfig {

    @Bean
    public OpenAPI finopsOpenApi() {
        return new OpenAPI()
                .info(new io.swagger.v3.oas.models.info.Info()
                        .title("FinPulse Core AI API")
                        .version("v1.0")
                        .description("Detailed API contract for the FinPulse AI central intelligence service."))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new io.swagger.v3.oas.models.security.SecurityScheme()
                                        .type(io.swagger.v3.oas.models.security.SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .in(In.HEADER)));
    }
}
