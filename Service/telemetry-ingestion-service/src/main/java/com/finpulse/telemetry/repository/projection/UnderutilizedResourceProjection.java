package com.finpulse.telemetry.repository.projection;

import java.math.BigDecimal;

public interface UnderutilizedResourceProjection {

    String getResourceId();

    String getResourceName();

    String getResourceType();

    String getInstanceType();

    BigDecimal getHourlyCost();

    BigDecimal getAvgCpuPct();

    BigDecimal getAvgMemoryPct();
}
