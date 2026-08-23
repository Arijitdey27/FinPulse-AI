package com.finops.service.repository;

import com.finops.service.entity.UsageMetric;
import com.finops.service.repository.projection.DailyTrendProjection;
import com.finops.service.repository.projection.UnderutilizedResourceProjection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsageMetricRepository extends JpaRepository<UsageMetric, Long> {

    @Query(value = """
            select
                cr.id as resourceId,
                cr.resource_name as resourceName,
                cr.resource_type as resourceType,
                cr.instance_type as instanceType,
                cr.hourly_cost as hourlyCost,
                round(avg(um.cpu_utilization_pct), 2) as avgCpuPct,
                round(avg(um.memory_utilization_pct), 2) as avgMemoryPct
            from usage_metrics um
            join cloud_resources cr on cr.id = um.resource_id
            where cr.tenant_id = :tenantId
              and cr.status = 'ACTIVE'
              and um.recorded_at >= current_timestamp - (:lookbackDays * interval '1 day')
            group by cr.id, cr.resource_name, cr.resource_type, cr.instance_type, cr.hourly_cost
            having avg(um.cpu_utilization_pct) < 10 or avg(um.memory_utilization_pct) < 15
            order by cr.hourly_cost desc
            """, nativeQuery = true)
    List<UnderutilizedResourceProjection> findUnderutilizedResources(@Param("tenantId") String tenantId,
                                                                     @Param("lookbackDays") int lookbackDays);

    @Query(value = """
            select
                resource_daily.trend_date as trendDate,
                round(sum(resource_daily.hourly_cost) * 24, 2) as totalDailyCost,
                round(avg(resource_daily.avg_cpu_pct), 2) as avgCpuPct
            from (
                select
                    cast(um.recorded_at as date) as trend_date,
                    cr.id as resource_id,
                    max(cr.hourly_cost) as hourly_cost,
                    avg(um.cpu_utilization_pct) as avg_cpu_pct
                from usage_metrics um
                join cloud_resources cr on cr.id = um.resource_id
                where cr.tenant_id = :tenantId
                  and cr.status = 'ACTIVE'
                  and um.recorded_at >= current_timestamp - (:days * interval '1 day')
                group by cast(um.recorded_at as date), cr.id
            ) resource_daily
            group by resource_daily.trend_date
            order by resource_daily.trend_date
            """, nativeQuery = true)
    List<DailyTrendProjection> findDailyCostTrends(@Param("tenantId") String tenantId, @Param("days") int days);
}
