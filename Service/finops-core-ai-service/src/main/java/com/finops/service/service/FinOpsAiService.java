package com.finops.service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finops.service.dto.AiAuditReportDto;
import com.finops.service.dto.AiRecommendationItemDto;
import com.finops.service.dto.TelemetryUnderutilizedResourceDto;
import com.finops.service.entity.AiAuditLog;
import com.finops.service.integration.TelemetryAnalyticsClient;
import com.finops.service.repository.AiAuditLogRepository;
import com.finops.service.security.AuthenticatedUser;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class FinOpsAiService {

    private static final BigDecimal HOURS_PER_MONTH = BigDecimal.valueOf(24L * 30L);
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
            {resourcesJson}
            """;

    private final TelemetryAnalyticsClient telemetryAnalyticsClient;
    private final AiAuditLogRepository aiAuditLogRepository;
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
                        List.of(),
                        logEntry.getCreatedAt()
                ))
                .toList();
    }

    private AiModelResponse generateRecommendations(List<TelemetryUnderutilizedResourceDto> resources) {
        try {
            ChatModel chatModel = chatModelProvider.getIfAvailable();
            if (chatModel == null) {
                return buildFallbackResponse(resources);
            }

            PromptTemplate promptTemplate = new PromptTemplate(AUDIT_PROMPT);
            Prompt prompt = promptTemplate.create(java.util.Map.of(
                    "resourcesJson", objectMapper.writeValueAsString(resources.stream()
                            .map(resource -> java.util.Map.of(
                                    "resourceName", resource.resourceName(),
                                    "resourceType", resource.resourceType(),
                                    "instanceType", resource.instanceType(),
                                    "hourlyCost", resource.hourlyCost(),
                                    "currentCostMonthly", resource.hourlyCost().multiply(HOURS_PER_MONTH).setScale(2, RoundingMode.HALF_UP),
                                    "avgCpuPct", resource.avgCpuPct(),
                                    "avgMemoryPct", resource.avgMemoryPct()
                            ))
                            .toList())
            ));

            String content = chatModel.call(prompt).getResult().getOutput().getText();
            String sanitizedContent = stripMarkdownFences(content);
            return objectMapper.readValue(sanitizedContent, AiModelResponse.class);
        } catch (Exception exception) {
            log.warn("Falling back to deterministic AI audit recommendations: {}", exception.getMessage());
            return buildFallbackResponse(resources);
        }
    }

    private AiModelResponse buildFallbackResponse(List<TelemetryUnderutilizedResourceDto> resources) {
        List<AiRecommendationItemDto> recommendations = resources.stream()
                .map(resource -> {
                    BigDecimal currentMonthlyCost = resource.hourlyCost()
                            .multiply(HOURS_PER_MONTH)
                            .setScale(2, RoundingMode.HALF_UP);
                    BigDecimal savingsRatio = resource.avgCpuPct().compareTo(BigDecimal.valueOf(5)) < 0
                            ? BigDecimal.valueOf(0.70)
                            : BigDecimal.valueOf(0.45);
                    BigDecimal savings = currentMonthlyCost.multiply(savingsRatio).setScale(2, RoundingMode.HALF_UP);

                    return new AiRecommendationItemDto(
                            resource.resourceName(),
                            currentMonthlyCost,
                            resource.avgCpuPct().compareTo(BigDecimal.valueOf(3)) < 0 ? "TERMINATE" : "RIGHTSIZE",
                            suggestInstanceType(resource.instanceType()),
                            savings.min(currentMonthlyCost),
                            "Average CPU at " + resource.avgCpuPct() + "% and memory at "
                                    + resource.avgMemoryPct() + "% indicate sustained underutilization."
                    );
                })
                .toList();

        BigDecimal totalSavings = recommendations.stream()
                .map(AiRecommendationItemDto::estimatedMonthlySavings)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        String summary = "Detected " + recommendations.size()
                + " underutilized resources with an estimated monthly savings opportunity of $"
                + totalSavings + ".";

        return new AiModelResponse(summary, recommendations);
    }

    private String suggestInstanceType(String currentInstanceType) {
        if (currentInstanceType == null || currentInstanceType.isBlank()) {
            return "REVIEW_REQUIRED";
        }

        if (currentInstanceType.contains("2xlarge")) {
            return currentInstanceType.replace("2xlarge", "xlarge");
        }
        if (currentInstanceType.contains("xlarge")) {
            return currentInstanceType.replace("xlarge", "large");
        }
        if (currentInstanceType.contains("large")) {
            return currentInstanceType.replace("large", "medium");
        }
        return currentInstanceType;
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

    private record AiModelResponse(String auditSummary, List<AiRecommendationItemDto> recommendations) {
    }
}
