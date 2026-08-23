package com.finops.service;

import com.finops.service.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
public class FinopsCoreAiServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinopsCoreAiServiceApplication.class, args);
    }
}
