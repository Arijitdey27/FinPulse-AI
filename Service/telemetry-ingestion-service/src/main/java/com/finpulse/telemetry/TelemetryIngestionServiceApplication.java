package com.finpulse.telemetry;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class TelemetryIngestionServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TelemetryIngestionServiceApplication.class, args);
    }
}
