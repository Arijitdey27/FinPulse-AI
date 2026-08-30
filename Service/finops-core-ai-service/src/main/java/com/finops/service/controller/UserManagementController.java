package com.finops.service.controller;

import com.finops.service.dto.CreateUserRequest;
import com.finops.service.dto.ResetUserPasswordRequest;
import com.finops.service.dto.UpdateUserRequest;
import com.finops.service.dto.UserManagementStatsDto;
import com.finops.service.dto.UserSummaryDto;
import com.finops.service.security.AuthenticatedUser;
import com.finops.service.service.UserManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "User Management")
public class UserManagementController {

    private final UserManagementService userManagementService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Return a paginated list of tenant users for the authenticated company admin")
    public Page<UserSummaryDto> getUsers(@AuthenticationPrincipal AuthenticatedUser currentUser,
                                         @RequestParam(required = false) String search,
                                         @PageableDefault(size = 8, sort = "createdAt") Pageable pageable) {
        return userManagementService.getUsers(currentUser.tenantId(), search, pageable);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Return aggregate user management metrics for the authenticated tenant")
    public UserManagementStatsDto getStats(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return userManagementService.getStats(currentUser.tenantId());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new user in the authenticated company")
    public UserSummaryDto createUser(@AuthenticationPrincipal AuthenticatedUser currentUser,
                                     @Valid @RequestBody CreateUserRequest request) {
        return userManagementService.createUser(currentUser.tenantId(), request);
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a tenant user's email or role")
    public UserSummaryDto updateUser(@AuthenticationPrincipal AuthenticatedUser currentUser,
                                     @PathVariable String userId,
                                     @Valid @RequestBody UpdateUserRequest request) {
        return userManagementService.updateUser(currentUser.tenantId(), userId, currentUser.userId(), request);
    }

    @PatchMapping("/{userId}/password")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reset a tenant user's password")
    public UserSummaryDto resetPassword(@AuthenticationPrincipal AuthenticatedUser currentUser,
                                        @PathVariable String userId,
                                        @Valid @RequestBody ResetUserPasswordRequest request) {
        return userManagementService.resetPassword(currentUser.tenantId(), userId, request);
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a tenant user")
    public void deleteUser(@AuthenticationPrincipal AuthenticatedUser currentUser,
                           @PathVariable String userId) {
        userManagementService.deleteUser(currentUser.tenantId(), userId, currentUser.userId());
    }
}
