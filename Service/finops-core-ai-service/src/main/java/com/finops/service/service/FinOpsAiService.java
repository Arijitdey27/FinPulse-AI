package com.finops.service.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finops.service.dto.AiAuditActionRequest;
import com.finops.service.dto.AiAuditActionResponse;
import com.finops.service.dto.AiAuditReportDto;
import com.finops.service.dto.AiRecommendationItemDto;
import com.finops.service.dto.TelemetryUnderutilizedResourceDto;
import com.finops.service.entity.AiAuditAction;
import com.finops.service.entity.AiAuditLog;
import com.finops.service.integration.TelemetryAnalyticsClient;
import com.finops.service.repository.AiAuditActionRepository;
import com.finops.service.repository.AiAuditLogRepository;
import com.finops.service.security.AuthenticatedUser;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@RequiredArgsConstructor
public class FinOpsAiService {

    private static final BigDecimal HOURS_PER_MONTH = BigDecimal.valueOf(24L * 30L);
    private static final BigDecimal RIGHTSIZED_SAVINGS_FACTOR = BigDecimal.valueOf(0.35);
    private static final BigDecimal SCHEDULE_STOP_SAVINGS_FACTOR = BigDecimal.valueOf(0.65);
    private static final BigDecimal TERMINATE_SAVINGS_FACTOR = BigDecimal.ONE;
    private static final BigDecimal INVESTIGATE_SAVINGS_FACTOR = BigDecimal.valueOf(0.15);
    private static final String AUDIT_PROMPT = """
            You are a senior FinOps optimization assistant.
            Analyze the underutilized cloud resources below and produce strict JSON only.

            Return an object with this exact shape:
            {
              "auditSummary": "string",
              "recommendations": [
                {
                  "resourceName": "string",
                  "currentCostMonthly": 0,
                  "recommendedAction": "RIGHTSIZE|SCHEDULE_STOP|TERMINATE|INVESTIGATE",
                  "recommendedInstanceType": "string",
                  "estimatedMonthlySavings": 0,
                  "reasoning": "string"
                }
              ]
            }

            Rules:
            - No markdown fences.
            - No explanatory text outside JSON.
            - Keep savings realistic and not above the current monthly cost.
            - Use the resourceName values exactly as provided.

            Tenant resource observations:
            """;

    private final TelemetryAnalyticsClient telemetryAnalyticsClient;
    private final AiAuditLogRepository aiAuditLogRepository;
    private final AiAuditActionRepository aiAuditActionRepository;
    private final ObjectProvider<ChatModel> chatModelProvider;
    private final ObjectMapper objectMapper;

    @Transactional
    public AiAuditReportDto runAudit(AuthenticatedUser currentUser) {
        List<TelemetryUnderutilizedResourceDto> resources = telemetryAnalyticsClient
                .findUnderutilizedResources(currentUser.tenantId(), 30);

        if (resources.isEmpty()) {
            String summary = "No underutilized resources were detected for this tenant in the last 30 days.";
            AiAuditLog auditLog = aiAuditLogRepository.save(AiAuditLog.builder()
                    .tenantId(currentUser.tenantId())
                    .totalPotentialSavings(BigDecimal.ZERO)
                    .auditSummary(summary)
                    .recommendationsJson(writeRecommendations(List.of()))
                    .build());

            return new AiAuditReportDto(
                    auditLog.getId(),
                    currentUser.tenantId(),
                    BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                    summary,
                    List.of(),
                    auditLog.getCreatedAt()
            );
        }

        AiModelResponse modelResponse = generateRecommendations(resources);
        BigDecimal totalPotentialSavings = modelResponse.recommendations().stream()
                .map(AiRecommendationItemDto::estimatedMonthlySavings)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        AiAuditLog auditLog = aiAuditLogRepository.save(AiAuditLog.builder()
                .tenantId(currentUser.tenantId())
                .totalPotentialSavings(totalPotentialSavings)
                .auditSummary(modelResponse.auditSummary())
                .recommendationsJson(writeRecommendations(modelResponse.recommendations()))
                .build());

        return new AiAuditReportDto(
                auditLog.getId(),
                currentUser.tenantId(),
                totalPotentialSavings,
                modelResponse.auditSummary(),
                modelResponse.recommendations(),
                auditLog.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<AiAuditReportDto> getAuditHistory(String tenantId) {
        return aiAuditLogRepository.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .map(logEntry -> new AiAuditReportDto(
                        logEntry.getId(),
                        logEntry.getTenantId(),
                        safeMoney(logEntry.getTotalPotentialSavings()),
                        logEntry.getAuditSummary(),
                        readRecommendations(logEntry.getRecommendationsJson()),
                        logEntry.getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    public AiAuditActionResponse queueOptimizationAction(
            Long auditId,
            AiAuditActionRequest request,
            AuthenticatedUser currentUser) {
        AiAuditLog auditLog = aiAuditLogRepository.findByIdAndTenantId(auditId, currentUser.tenantId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Audit not found: " + auditId));

        List<AiRecommendationItemDto> recommendations = readRecommendations(auditLog.getRecommendationsJson());
        AiRecommendationItemDto recommendation = recommendations.stream()
                .filter(item -> item.resourceName().equals(request.resourceName()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Recommendation not found in audit for resource: " + request.resourceName()));

        if (!recommendation.recommendedAction().equals(request.recommendedAction())
                || !recommendation.recommendedInstanceType().equals(request.recommendedInstanceType())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Optimization request does not match the saved audit recommendation.");
        }

        AiAuditAction action = aiAuditActionRepository.save(AiAuditAction.builder()
                .auditId(auditId)
                .tenantId(currentUser.tenantId())
                .resourceName(recommendation.resourceName())
                .recommendedAction(recommendation.recommendedAction())
                .recommendedInstanceType(recommendation.recommendedInstanceType())
                .status("QUEUED")
                .build());

        return new AiAuditActionResponse(
                action.getId(),
                action.getAuditId(),
                action.getResourceName(),
                action.getRecommendedAction(),
                action.getRecommendedInstanceType(),
                action.getStatus(),
                "Optimization request queued successfully.",
                action.getCreatedAt()
        );
    }

    private AiModelResponse generateRecommendations(List<TelemetryUnderutilizedResourceDto> resources) {
        try {
            ChatModel chatModel = chatModelProvider.getIfAvailable();
            if (chatModel == null) {
                log.warn("Spring AI chat model is not available. Falling back to telemetry-based audit recommendations.");
                return generateFallbackRecommendations(resources, "Live AI model unavailable");
            }

            String resourcesJson = objectMapper.writeValueAsString(resources.stream()
                    .map(resource -> java.util.Map.of(
                            "resourceName", resource.resourceName(),
                            "resourceType", resource.resourceType(),
                            "instanceType", resource.instanceType(),
                            "hourlyCost", resource.hourlyCost(),
                            "currentCostMonthly", resource.hourlyCost().multiply(HOURS_PER_MONTH).setScale(2, RoundingMode.HALF_UP),
                            "avgCpuPct", resource.avgCpuPct(),
                            "avgMemoryPct", resource.avgMemoryPct()
                    ))
                    .toList());
            Prompt prompt = new Prompt(AUDIT_PROMPT + System.lineSeparator() + resourcesJson);

            String content = chatModel.call(prompt).getResult().getOutput().getText();
            String sanitizedContent = stripMarkdownFences(content);
            return objectMapper.readValue(sanitizedContent, AiModelResponse.class);
        } catch (Exception exception) {
            log.warn("Unable to generate live Spring AI audit recommendations: {}. Falling back to telemetry-based audit recommendations.",
                    exception.getMessage());
            return generateFallbackRecommendations(resources, exception.getClass().getSimpleName());
        }
    }

    private AiModelResponse generateFallbackRecommendations(
            List<TelemetryUnderutilizedResourceDto> resources,
            String fallbackReason) {
        List<AiRecommendationItemDto> recommendations = resources.stream()
                .map(this::buildFallbackRecommendation)
                .toList();

        BigDecimal totalPotentialSavings = recommendations.stream()
                .map(AiRecommendationItemDto::estimatedMonthlySavings)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        String summary = "Telemetry-based audit completed with "
                + recommendations.size()
                + " recommendation(s) and estimated monthly savings of $"
                + totalPotentialSavings.toPlainString()
                + ". Fallback reason: "
                + fallbackReason
                + ".";

        return new AiModelResponse(summary, recommendations);
    }

    private AiRecommendationItemDto buildFallbackRecommendation(TelemetryUnderutilizedResourceDto resource) {
        BigDecimal currentCostMonthly = resource.hourlyCost()
                .multiply(HOURS_PER_MONTH)
                .setScale(2, RoundingMode.HALF_UP);

        String recommendedAction = determineAction(resource);
        String recommendedInstanceType = determineInstanceType(resource, recommendedAction);
        BigDecimal estimatedMonthlySavings = estimateSavings(currentCostMonthly, recommendedAction);

        return new AiRecommendationItemDto(
                resource.resourceName(),
                currentCostMonthly,
                recommendedAction,
                recommendedInstanceType,
                estimatedMonthlySavings,
                buildReasoning(resource, recommendedAction, estimatedMonthlySavings)
        );
    }

    private String determineAction(TelemetryUnderutilizedResourceDto resource) {
        BigDecimal avgCpu = zeroIfNull(resource.avgCpuPct());
        BigDecimal avgMemory = zeroIfNull(resource.avgMemoryPct());

        if (avgCpu.compareTo(BigDecimal.valueOf(5)) <= 0 && avgMemory.compareTo(BigDecimal.valueOf(10)) <= 0) {
            return "TERMINATE";
        }

        if (avgCpu.compareTo(BigDecimal.valueOf(15)) <= 0 && avgMemory.compareTo(BigDecimal.valueOf(25)) <= 0) {
            return "SCHEDULE_STOP";
        }

        if (avgCpu.compareTo(BigDecimal.valueOf(35)) <= 0 || avgMemory.compareTo(BigDecimal.valueOf(40)) <= 0) {
            return "RIGHTSIZE";
        }

        return "INVESTIGATE";
    }

    private String determineInstanceType(TelemetryUnderutilizedResourceDto resource, String recommendedAction) {
        if (!"RIGHTSIZE".equals(recommendedAction)) {
            return resource.instanceType();
        }

        String instanceType = resource.instanceType();
        if (instanceType == null || instanceType.isBlank()) {
            return "smaller-footprint";
        }

        String normalized = instanceType.trim();
        if (normalized.toLowerCase(Locale.ROOT).endsWith(".large")) {
            return normalized.substring(0, normalized.length() - ".large".length()) + ".medium";
        }
        if (normalized.toLowerCase(Locale.ROOT).endsWith(".xlarge")) {
            return normalized.substring(0, normalized.length() - ".xlarge".length()) + ".large";
        }
        if (normalized.toLowerCase(Locale.ROOT).endsWith(".2xlarge")) {
            return normalized.substring(0, normalized.length() - ".2xlarge".length()) + ".xlarge";
        }

        return normalized;
    }

    private BigDecimal estimateSavings(BigDecimal currentCostMonthly, String recommendedAction) {
        BigDecimal factor = switch (recommendedAction) {
            case "TERMINATE" -> TERMINATE_SAVINGS_FACTOR;
            case "SCHEDULE_STOP" -> SCHEDULE_STOP_SAVINGS_FACTOR;
            case "RIGHTSIZE" -> RIGHTSIZED_SAVINGS_FACTOR;
            default -> INVESTIGATE_SAVINGS_FACTOR;
        };

        return currentCostMonthly.multiply(factor).setScale(2, RoundingMode.HALF_UP);
    }

    private String buildReasoning(
            TelemetryUnderutilizedResourceDto resource,
            String recommendedAction,
            BigDecimal estimatedMonthlySavings) {
        BigDecimal avgCpu = zeroIfNull(resource.avgCpuPct());
        BigDecimal avgMemory = zeroIfNull(resource.avgMemoryPct());

        return switch (recommendedAction) {
            case "TERMINATE" -> "CPU usage around " + avgCpu.toPlainString()
                    + "% and memory usage around " + avgMemory.toPlainString()
                    + "% indicate the resource appears idle. Terminating it could recover about $"
                    + estimatedMonthlySavings.toPlainString() + " per month.";
            case "SCHEDULE_STOP" -> "CPU usage around " + avgCpu.toPlainString()
                    + "% and memory usage around " + avgMemory.toPlainString()
                    + "% suggest this resource does not need continuous runtime. Scheduling off-hours stops could save about $"
                    + estimatedMonthlySavings.toPlainString() + " per month.";
            case "RIGHTSIZE" -> "CPU usage around " + avgCpu.toPlainString()
                    + "% and memory usage around " + avgMemory.toPlainString()
                    + "% suggest the current instance is oversized. Rightsizing should save about $"
                    + estimatedMonthlySavings.toPlainString() + " per month.";
            default -> "Telemetry shows partial underutilization with CPU around " + avgCpu.toPlainString()
                    + "% and memory around " + avgMemory.toPlainString()
                    + "%. Review workload patterns before taking action; estimated savings are about $"
                    + estimatedMonthlySavings.toPlainString() + " per month.";
        };
    }

    private BigDecimal zeroIfNull(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String stripMarkdownFences(String content) {
        if (content == null) {
            throw new IllegalArgumentException("AI response was empty");
        }

        String trimmed = content.trim();
        if (trimmed.startsWith("```")) {
            int firstNewLine = trimmed.indexOf('\n');
            int lastFence = trimmed.lastIndexOf("```");
            if (firstNewLine > 0 && lastFence > firstNewLine) {
                return trimmed.substring(firstNewLine + 1, lastFence).trim();
            }
        }
        return trimmed;
    }

    private BigDecimal safeMoney(BigDecimal value) {
        return value == null ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP) : value.setScale(2, RoundingMode.HALF_UP);
    }

    private String writeRecommendations(List<AiRecommendationItemDto> recommendations) {
        try {
            return objectMapper.writeValueAsString(recommendations);
        } catch (Exception exception) {
            log.warn("Unable to serialize AI audit recommendations for persistence: {}", exception.getMessage());
            return "[]";
        }
    }

    private List<AiRecommendationItemDto> readRecommendations(String recommendationsJson) {
        if (recommendationsJson == null || recommendationsJson.isBlank()) {
            return List.of();
        }

        try {
            return objectMapper.readValue(recommendationsJson, new TypeReference<>() {
            });
        } catch (Exception exception) {
            log.warn("Unable to deserialize stored AI audit recommendations: {}", exception.getMessage());
            return List.of();
        }
    }

    private record AiModelResponse(String auditSummary, List<AiRecommendationItemDto> recommendations) {
    }
}
