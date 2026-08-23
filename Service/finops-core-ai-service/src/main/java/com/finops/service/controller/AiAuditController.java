package com.finops.service.controller;

import com.finops.service.dto.AiAuditReportDto;
import com.finops.service.security.AuthenticatedUser;
import com.finops.service.service.FinOpsAiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/ai/audit")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "AI Auditor")
public class AiAuditController {

    private final FinOpsAiService finOpsAiService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Trigger an AI-powered waste audit for the authenticated tenant")
    public AiAuditReportDto runAudit(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return finOpsAiService.runAudit(currentUser);
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Operation(summary = "Return previous AI audit reports for the authenticated tenant")
    public List<AiAuditReportDto> getAuditHistory(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return finOpsAiService.getAuditHistory(currentUser.tenantId());
    }
}
