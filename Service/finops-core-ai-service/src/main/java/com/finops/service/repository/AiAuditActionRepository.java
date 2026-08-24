package com.finops.service.repository;

import com.finops.service.entity.AiAuditAction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiAuditActionRepository extends JpaRepository<AiAuditAction, Long> {
}
