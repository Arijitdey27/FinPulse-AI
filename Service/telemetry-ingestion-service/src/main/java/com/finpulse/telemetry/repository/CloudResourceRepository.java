package com.finpulse.telemetry.repository;

import com.finpulse.telemetry.entity.CloudResource;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CloudResourceRepository extends JpaRepository<CloudResource, String> {

    List<CloudResource> findByTenant_Id(String tenantId);

    List<CloudResource> findByStatusIgnoreCase(String status);

    long countByStatusIgnoreCase(String status);
}
