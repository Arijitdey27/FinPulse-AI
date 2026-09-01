package com.finops.service.service;

import com.finops.service.dto.AuthResponse;
import com.finops.service.dto.AuthSessionResponse;
import com.finops.service.dto.LoginRequest;
import com.finops.service.entity.AppUser;
import com.finops.service.repository.AppUserRepository;
import com.finops.service.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtTokenProvider.generateToken(user);

        return new AuthResponse(
                token,
                jwtTokenProvider.getExpiry(token),
                user.getTenant().getId(),
                user.getTenant().getName(),
                user.getId(),
                user.getEmail(),
                user.getRole()
        );
    }

    @Transactional(readOnly = true)
    public AuthSessionResponse currentSession(String userId, String tenantId, String token) {
        AppUser user = appUserRepository.findByIdAndTenant_Id(userId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session user no longer exists"));

        return new AuthSessionResponse(
                jwtTokenProvider.getExpiry(token),
                user.getTenant().getId(),
                user.getTenant().getName(),
                user.getId(),
                user.getEmail(),
                user.getRole()
        );
    }
}
