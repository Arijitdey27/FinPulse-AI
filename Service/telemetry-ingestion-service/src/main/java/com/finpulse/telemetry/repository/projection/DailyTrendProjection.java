package com.finpulse.telemetry.repository.projection;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface DailyTrendProjection {

    LocalDate getTrendDate();

    BigDecimal getTotalDailyCost();

    BigDecimal getAvgCpuPct();
}
