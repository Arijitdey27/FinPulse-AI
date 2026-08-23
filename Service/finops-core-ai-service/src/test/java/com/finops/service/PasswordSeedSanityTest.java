package com.finops.service;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

class PasswordSeedSanityTest {

    private static final String SEEDED_HASH = "$2a$10$HB.PCiaJP8MuLe7yTmQXvOQosWk15oabKOkCw7Kd5GS1l8OaCXFL6";

    @Test
    void seededAdminPasswordMatchesDocumentedCredential() {
        assertThat(new BCryptPasswordEncoder().matches("Admin@123", SEEDED_HASH)).isTrue();
    }
}
