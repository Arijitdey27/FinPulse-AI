package com.finops.service.repository;

import com.finops.service.entity.AiAuditDismissal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiAuditDismissalRepository extends JpaRepository<AiAuditDismissal, Long> {

    boolean existsByAuditIdAndTenantIdAndResourceName(Long auditId, String tenantId, String resourceName);

    List<AiAuditDismissal> findByAuditIdInAndTenantId(List<Long> auditIds, String tenantId);
}
