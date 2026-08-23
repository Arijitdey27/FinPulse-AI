package com.finops.service.security;

import com.finops.service.config.JwtProperties;
import com.finops.service.entity.AppUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import javax.crypto.SecretKey;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

    private final JwtProperties jwtProperties;
    private final SecretKey secretKey;

    public JwtTokenProvider(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        this.secretKey = Keys.hmacShaKeyFor(resolveSecret(jwtProperties.getSecret()));
    }

    public String generateToken(AppUser user) {
        Instant issuedAt = Instant.now();
        Instant expiry = issuedAt.plus(jwtProperties.getAccessTokenExpirationMinutes(), ChronoUnit.MINUTES);
        List<String> roles = List.of(user.getRole());

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("tenantId", user.getTenant().getId())
                .claim("userId", user.getId())
                .claim("roles", roles)
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(expiry))
                .signWith(secretKey)
                .compact();
    }

    public Instant getExpiry(String token) {
        return getClaims(token).getExpiration().toInstant();
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (RuntimeException exception) {
            return false;
        }
    }

    public Authentication getAuthentication(String token) {
        Claims claims = getClaims(token);
        List<String> roles = claims.get("roles", List.class);
        Collection<SimpleGrantedAuthority> authorities = roles.stream()
                .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                .map(SimpleGrantedAuthority::new)
                .toList();

        AuthenticatedUser principal = new AuthenticatedUser(
                claims.get("userId", String.class),
                claims.get("tenantId", String.class),
                claims.getSubject(),
                authorities
        );

        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private byte[] resolveSecret(String rawSecret) {
        try {
            return Decoders.BASE64.decode(rawSecret);
        } catch (IllegalArgumentException ignored) {
            return rawSecret.getBytes(StandardCharsets.UTF_8);
        }
    }
}
