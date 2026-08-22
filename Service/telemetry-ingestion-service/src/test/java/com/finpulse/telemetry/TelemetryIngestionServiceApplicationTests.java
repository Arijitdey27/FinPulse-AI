package com.finpulse.telemetry;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class TelemetryIngestionServiceApplicationTests {

    @Test
    void applicationClassIsAvailable() {
        assertEquals(
                "com.finpulse.telemetry.TelemetryIngestionServiceApplication",
                TelemetryIngestionServiceApplication.class.getName());
    }
}
