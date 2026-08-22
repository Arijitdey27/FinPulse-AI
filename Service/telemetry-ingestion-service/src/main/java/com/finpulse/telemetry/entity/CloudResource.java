package com.finpulse.telemetry.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cloud_resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CloudResource {

    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "resource_name", length = 100, nullable = false)
    private String resourceName;

    @Column(name = "resource_type", length = 50, nullable = false)
    private String resourceType;

    @Column(name = "instance_type", length = 50, nullable = false)
    private String instanceType;

    @Column(name = "hourly_cost", precision = 10, scale = 4, nullable = false)
    private BigDecimal hourlyCost;

    @Column(length = 20, nullable = false)
    private String status;

    @OneToMany(mappedBy = "resource")
    @Builder.Default
    private List<UsageMetric> metrics = new ArrayList<>();
}
