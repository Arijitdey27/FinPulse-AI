package com.telemetry.service;

import org.springframework.boot.SpringApplication;

public class TestTelemetryIngestionServiceApplication {

	public static void main(String[] args) {
		SpringApplication.from(TelemetryIngestionServiceApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
