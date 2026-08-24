package com.finops.service.service;

import com.finops.service.dto.CloudResourceDto;
import com.finops.service.dto.CostTrendDto;
import com.finops.service.dto.DashboardSummaryDto;
import com.finops.service.integration.TelemetryAnalyticsClient;
import com.finops.service.entity.CloudResource;
import com.finops.service.repository.CloudResourceRepository;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class CostAnalyticsService {

    private static final BigDecimal HOURS_PER_MONTH = BigDecimal.valueOf(24L * 30L);

    private final CloudResourceRepository cloudResourceRepository;
    private final TelemetryAnalyticsClient telemetryAnalyticsClient;

    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary(String tenantId) {
        BigDecimal activeHourlySpend = cloudResourceRepository.sumActiveHourlyCostByTenantId(tenantId);
        BigDecimal totalMonthlySpend = activeHourlySpend.multiply(HOURS_PER_MONTH).setScale(2, RoundingMode.HALF_UP);

        BigDecimal estimatedWaste = telemetryAnalyticsClient.getEstimatedWaste(tenantId, 30)
                .setScale(2, RoundingMode.HALF_UP);

        return new DashboardSummaryDto(
                totalMonthlySpend,
                cloudResourceRepository.countByTenant_IdAndStatus(tenantId, "ACTIVE"),
                estimatedWaste
        );
    }

    @Transactional(readOnly = true)
    public List<CostTrendDto> getCostTrends(String tenantId, int days) {
        return telemetryAnalyticsClient.getCostTrends(tenantId, Math.max(days, 1)).stream()
                .map(item -> new CostTrendDto(item.date(), item.totalDailyCost(), item.avgCpuPct()))
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<CloudResourceDto> getResources(String tenantId, String type, String search, Pageable pageable) {
        Specification<CloudResource> specification = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.equal(root.get("tenant").get("id"), tenantId));
            predicates.add(criteriaBuilder.equal(root.get("status"), "ACTIVE"));

            if (StringUtils.hasText(type)) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.upper(root.get("resourceType")), type.toUpperCase()));
            }

            if (StringUtils.hasText(search)) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("resourceName")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("id")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("resourceType")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("instanceType")), pattern)
                ));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };

        return cloudResourceRepository.findAll(specification, pageable)
                .map(resource -> new CloudResourceDto(
                        resource.getId(),
                        resource.getResourceName(),
                        resource.getResourceType(),
                        resource.getInstanceType(),
                        resource.getHourlyCost(),
                        resource.getStatus()
                ));
    }
}
