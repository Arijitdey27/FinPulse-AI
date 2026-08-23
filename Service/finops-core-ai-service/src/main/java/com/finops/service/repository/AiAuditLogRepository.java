package com.finops.service.repository;

import com.finops.service.entity.AiAuditLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiAuditLogRepository extends JpaRepository<AiAuditLog, Long> {

    List<AiAuditLog> findByTenantIdOrderByCreatedAtDesc(String tenantId);
}
