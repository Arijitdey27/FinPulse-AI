package com.finpulse.telemetry.repository;

import com.finpulse.telemetry.entity.UsageMetric;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsageMetricRepository extends JpaRepository<UsageMetric, Long> {

    @Query("""
            select um
            from UsageMetric um
            where um.resource.id = :resourceId
              and um.recordedAt between :start and :end
            order by um.recordedAt desc
            """)
    List<UsageMetric> findByResourceIdAndRecordedAtBetween(
            @Param("resourceId") String resourceId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("""
            select um
            from UsageMetric um
            where um.resource.tenant.id = :tenantId
              and um.recordedAt between :start and :end
            order by um.recordedAt desc
            """)
    List<UsageMetric> findByTenantIdAndRecordedAtBetween(
            @Param("tenantId") String tenantId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    List<UsageMetric> findByResource_IdOrderByRecordedAtDesc(String resourceId, Pageable pageable);

    Optional<UsageMetric> findTopByOrderByRecordedAtDesc();
}
