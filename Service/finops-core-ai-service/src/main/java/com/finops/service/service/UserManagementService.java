package com.finops.service.service;

import com.finops.service.dto.CreateUserRequest;
import com.finops.service.dto.ResetUserPasswordRequest;
import com.finops.service.dto.UpdateUserRequest;
import com.finops.service.dto.UserManagementStatsDto;
import com.finops.service.dto.UserSummaryDto;
import com.finops.service.entity.AppUser;
import com.finops.service.repository.AppUserRepository;
import com.finops.service.repository.TenantRepository;
import jakarta.transaction.Transactional;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final AppUserRepository appUserRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserSummaryDto createUser(String tenantId, CreateUserRequest request) {
        String normalizedName = normalizeName(request.name());
        String normalizedEmail = normalizeEmail(request.email());
        String normalizedRole = normalizeRole(request.role());
        String normalizedDescription = normalizeDescription(request.description());

        if (appUserRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(CONFLICT, "A user with this email already exists");
        }

        AppUser newUser = AppUser.builder()
                .id(UUID.randomUUID().toString())
                .tenant(tenantRepository.findById(tenantId)
                        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Tenant context could not be resolved")))
                .name(normalizedName)
                .email(normalizedEmail)
                .description(normalizedDescription)
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(normalizedRole)
                .build();

        AppUser savedUser = appUserRepository.save(newUser);
        return toSummary(savedUser);
    }

    @Transactional
    public UserSummaryDto updateUser(String tenantId, String targetUserId, String actorUserId, UpdateUserRequest request) {
        AppUser targetUser = getTenantUser(targetUserId, tenantId);
        String normalizedName = normalizeName(request.name());
        String normalizedEmail = normalizeEmail(request.email());
        String normalizedRole = normalizeRole(request.role());
        String normalizedDescription = normalizeDescription(request.description());

        appUserRepository.findByEmailIgnoreCase(normalizedEmail)
                .filter(existing -> !existing.getId().equals(targetUser.getId()))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(CONFLICT, "A user with this email already exists");
                });

        guardLastAdminDemotion(tenantId, actorUserId, targetUser, normalizedRole);

        targetUser.setName(normalizedName);
        targetUser.setEmail(normalizedEmail);
        targetUser.setRole(normalizedRole);
        targetUser.setDescription(normalizedDescription);
        return toSummary(appUserRepository.save(targetUser));
    }

    @Transactional
    public UserSummaryDto resetPassword(String tenantId, String targetUserId, ResetUserPasswordRequest request) {
        AppUser targetUser = getTenantUser(targetUserId, tenantId);
        targetUser.setPasswordHash(passwordEncoder.encode(request.password()));
        return toSummary(appUserRepository.save(targetUser));
    }

    @Transactional
    public void deleteUser(String tenantId, String targetUserId, String actorUserId) {
        AppUser targetUser = getTenantUser(targetUserId, tenantId);
        guardSelfDelete(targetUserId, actorUserId);
        guardAdminDelete(targetUser);
        appUserRepository.delete(targetUser);
    }

    @Transactional
    public Page<UserSummaryDto> getUsers(String tenantId, String search, Pageable pageable) {
        String normalizedSearch = normalizeSearch(search);
        Page<AppUser> page = normalizedSearch == null
                ? appUserRepository.findByTenant_Id(tenantId, pageable)
                : appUserRepository.searchTenantUsers(tenantId, normalizedSearch, pageable);

        return page
                .map(this::toSummary);
    }

    @Transactional
    public UserManagementStatsDto getStats(String tenantId) {
        long totalUsers = appUserRepository.countByTenant_Id(tenantId);
        long adminUsers = appUserRepository.countByTenant_IdAndRoleIgnoreCase(tenantId, "ADMIN");
        return new UserManagementStatsDto(totalUsers, adminUsers, Math.max(totalUsers - adminUsers, 0));
    }

    private AppUser getTenantUser(String userId, String tenantId) {
        return appUserRepository.findByIdAndTenant_Id(userId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found for this company"));
    }

    private void guardSelfDelete(String targetUserId, String actorUserId) {
        if (targetUserId.equals(actorUserId)) {
            throw new ResponseStatusException(CONFLICT, "You cannot delete your own account");
        }
    }

    private void guardAdminDelete(AppUser targetUser) {
        if ("ADMIN".equalsIgnoreCase(targetUser.getRole())) {
            throw new ResponseStatusException(CONFLICT, "Admin accounts cannot be deleted");
        }
    }

    private void guardLastAdminDemotion(String tenantId, String actorUserId, AppUser targetUser, String nextRole) {
        if (!"ADMIN".equalsIgnoreCase(targetUser.getRole()) || "ADMIN".equalsIgnoreCase(nextRole)) {
            return;
        }

        long adminUsers = appUserRepository.countByTenant_IdAndRoleIgnoreCase(tenantId, "ADMIN");
        if (adminUsers <= 1) {
            throw new ResponseStatusException(CONFLICT, "At least one company admin must remain");
        }

        if (targetUser.getId().equals(actorUserId)) {
            throw new ResponseStatusException(CONFLICT, "You cannot remove your own admin access");
        }
    }

    private UserSummaryDto toSummary(AppUser user) {
        return new UserSummaryDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getDescription(),
                user.getCreatedAt()
        );
    }

    private String normalizeName(String name) {
        return name == null ? null : name.trim();
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeRole(String role) {
        return role == null ? null : role.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeDescription(String description) {
        if (description == null) {
            return null;
        }
        String trimmed = description.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeSearch(String search) {
        if (search == null) {
            return null;
        }
        String trimmed = search.trim();
        return trimmed.isEmpty() ? null : trimmed.toLowerCase(Locale.ROOT);
    }

}
