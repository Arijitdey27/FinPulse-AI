package com.finpulse.telemetry.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "usage_metrics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsageMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "resource_id", nullable = false, length = 36)
    private String resourceId;

    @Column(name = "tenant_id", nullable = false, length = 36)
    private String tenantId;

    @Column(name = "resource_name", nullable = false, length = 100)
    private String resourceName;

    @Column(name = "resource_type", nullable = false, length = 50)
    private String resourceType;

    @Column(name = "instance_type", nullable = false, length = 50)
    private String instanceType;

    @Column(name = "hourly_cost", nullable = false, precision = 10, scale = 4)
    private BigDecimal hourlyCost;

    @Column(name = "resource_status", nullable = false, length = 20)
    private String resourceStatus;

    @Column(name = "cpu_utilization_pct", precision = 5, scale = 2, nullable = false)
    private BigDecimal cpuUtilizationPct;

    @Column(name = "memory_utilization_pct", precision = 5, scale = 2, nullable = false)
    private BigDecimal memoryUtilizationPct;

    @Column(name = "storage_iops", nullable = false)
    private Integer storageIops;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;
}
