package com.finops.service.repository;

import com.finops.service.entity.CloudResource;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CloudResourceRepository extends JpaRepository<CloudResource, String>, JpaSpecificationExecutor<CloudResource> {

    long countByTenant_IdAndStatus(String tenantId, String status);

    java.util.Optional<CloudResource> findByIdAndStatus(String id, String status);

    java.util.List<CloudResource> findByStatusIgnoreCase(String status);

    @Query("""
            select coalesce(sum(cr.hourlyCost), 0)
            from CloudResource cr
            where cr.tenant.id = :tenantId and cr.status = 'ACTIVE'
            """)
    BigDecimal sumActiveHourlyCostByTenantId(@Param("tenantId") String tenantId);
}
