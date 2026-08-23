package com.finops.service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cloud_resources")
public class CloudResource {

    @Id
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "resource_name", nullable = false, length = 100)
    private String resourceName;

    @Column(name = "resource_type", nullable = false, length = 50)
    private String resourceType;

    @Column(name = "instance_type", nullable = false, length = 50)
    private String instanceType;

    @Column(name = "hourly_cost", nullable = false, precision = 10, scale = 4)
    private BigDecimal hourlyCost;

    @Column(nullable = false, length = 20)
    private String status;
}
