package com.finpulse.telemetry.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resource_id", nullable = false)
    private CloudResource resource;

    @Column(name = "cpu_utilization_pct", precision = 5, scale = 2, nullable = false)
    private BigDecimal cpuUtilizationPct;

    @Column(name = "memory_utilization_pct", precision = 5, scale = 2, nullable = false)
    private BigDecimal memoryUtilizationPct;

    @Column(name = "storage_iops", nullable = false)
    private Integer storageIops;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;
}
