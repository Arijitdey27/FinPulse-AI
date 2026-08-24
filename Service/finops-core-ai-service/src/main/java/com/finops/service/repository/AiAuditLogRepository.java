package com.finops.service.repository;

import com.finops.service.entity.AiAuditLog;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiAuditLogRepository extends JpaRepository<AiAuditLog, Long> {

    List<AiAuditLog> findByTenantIdOrderByCreatedAtDesc(String tenantId);

    Optional<AiAuditLog> findByIdAndTenantId(Long id, String tenantId);
}
