package com.finpulse.telemetry.repository;

import com.finpulse.telemetry.entity.Tenant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantRepository extends JpaRepository<Tenant, String> {

    Optional<Tenant> findByNameIgnoreCase(String name);
}
