package com.finops.service.security;

import java.security.Principal;
import java.util.Collection;
import org.springframework.security.core.GrantedAuthority;

public record AuthenticatedUser(
        String userId,
        String tenantId,
        String email,
        Collection<? extends GrantedAuthority> authorities
) implements Principal {

    @Override
    public String getName() {
        return email;
    }
}
