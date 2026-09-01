package com.finops.service.controller;

import com.finops.service.dto.AuthResponse;
import com.finops.service.dto.AuthSessionResponse;
import com.finops.service.dto.LoginRequest;
import com.finops.service.security.AuthenticatedUser;
import com.finops.service.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
@Tag(name = "Auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Authenticate a platform user and return a JWT access token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Return the current authenticated platform session")
    public ResponseEntity<AuthSessionResponse> me(@AuthenticationPrincipal AuthenticatedUser user,
                                                  @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) {
        String token = authorization.substring("Bearer ".length());
        return ResponseEntity.ok(authService.currentSession(user.userId(), user.tenantId(), token));
    }
}
