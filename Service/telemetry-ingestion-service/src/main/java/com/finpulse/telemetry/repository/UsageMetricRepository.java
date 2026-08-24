package com.finpulse.telemetry.repository;

import com.finpulse.telemetry.entity.UsageMetric;
import com.finpulse.telemetry.repository.projection.DailyTrendProjection;
import com.finpulse.telemetry.repository.projection.UnderutilizedResourceProjection;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsageMetricRepository extends JpaRepository<UsageMetric, Long> {

    @Query("""
            select um
            from UsageMetric um
            where um.resourceId = :resourceId
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
            where um.tenantId = :tenantId
              and um.recordedAt between :start and :end
            order by um.recordedAt desc
            """)
    List<UsageMetric> findByTenantIdAndRecordedAtBetween(
            @Param("tenantId") String tenantId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    Page<UsageMetric> findByResourceIdOrderByRecordedAtDesc(String resourceId, Pageable pageable);

    @Query(value = """
            select
                um.resource_id as resourceId,
                max(um.resource_name) as resourceName,
                max(um.resource_type) as resourceType,
                max(um.instance_type) as instanceType,
                max(um.hourly_cost) as hourlyCost,
                round(avg(um.cpu_utilization_pct), 2) as avgCpuPct,
                round(avg(um.memory_utilization_pct), 2) as avgMemoryPct
            from usage_metrics um
            where um.tenant_id = :tenantId
              and um.resource_status = 'ACTIVE'
              and um.recorded_at >= current_timestamp - (:lookbackDays * interval '1 day')
            group by um.resource_id
            having avg(um.cpu_utilization_pct) < 10 or avg(um.memory_utilization_pct) < 15
            order by max(um.hourly_cost) desc
            """, nativeQuery = true)
    List<UnderutilizedResourceProjection> findUnderutilizedResources(
            @Param("tenantId") String tenantId,
            @Param("lookbackDays") int lookbackDays);

    @Query(value = """
            select
                resource_daily.trend_date as trendDate,
                round(sum(resource_daily.hourly_cost) * 24, 2) as totalDailyCost,
                round(avg(resource_daily.avg_cpu_pct), 2) as avgCpuPct
            from (
                select
                    cast(um.recorded_at as date) as trend_date,
                    um.resource_id as resource_id,
                    max(um.hourly_cost) as hourly_cost,
                    avg(um.cpu_utilization_pct) as avg_cpu_pct
                from usage_metrics um
                where um.tenant_id = :tenantId
                  and um.resource_status = 'ACTIVE'
                  and um.recorded_at >= current_timestamp - (:days * interval '1 day')
                group by cast(um.recorded_at as date), um.resource_id
            ) resource_daily
            group by resource_daily.trend_date
            order by resource_daily.trend_date
            """, nativeQuery = true)
    List<DailyTrendProjection> findDailyCostTrends(@Param("tenantId") String tenantId, @Param("days") int days);

    Optional<UsageMetric> findTopByOrderByRecordedAtDesc();
}
