import { Activity, Radio, Waves } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import AppShell from '../components/AppShell'
import { useTheme } from '../context/ThemeContext'
import api, { TELEMETRY_API_BASE_URL } from '../services/api'
import { formatUtcTimestamp } from '../utils/time'

function formatTelemetryTimestamp(value) {
  return formatUtcTimestamp(value, 'en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function LiveTelemetryPage() {
  const { isDark } = useTheme()
  const telemetryPageSize = 10
  const [resources, setResources] = useState([])
  const [selectedResourceId, setSelectedResourceId] = useState('')
  const [recentMetrics, setRecentMetrics] = useState([])
  const [health, setHealth] = useState(null)
  const [anomalyNotice, setAnomalyNotice] = useState(null)
  const [isLoadingResources, setIsLoadingResources] = useState(true)
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(false)
  const [resourceError, setResourceError] = useState('')
  const [telemetryError, setTelemetryError] = useState('')
  const [telemetryPage, setTelemetryPage] = useState(0)
  const [telemetryPageMeta, setTelemetryPageMeta] = useState({
    page: 0,
    size: telemetryPageSize,
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false,
  })

  const loadResources = async () => {
    setIsLoadingResources(true)
    setResourceError('')

    try {
      const { data } = await api.get('/resources?page=0&size=20')
      const mapped = (data.content || []).map((resource) => ({
        id: resource.id,
        resourceName: resource.resourceName,
      }))

      setResources(mapped)
      setSelectedResourceId((current) => {
        if (!mapped.length) {
          return ''
        }

        return mapped.some((resource) => resource.id === current) ? current : mapped[0].id
      })
      if (!mapped.length) {
        setRecentMetrics([])
        setTelemetryPage(0)
        setTelemetryPageMeta({
          page: 0,
          size: telemetryPageSize,
          totalPages: 0,
          totalElements: 0,
          hasNext: false,
          hasPrevious: false,
        })
        setTelemetryError('')
      }
    } catch {
      setResources([])
      setSelectedResourceId('')
      setRecentMetrics([])
      setTelemetryPage(0)
      setTelemetryPageMeta({
        page: 0,
        size: telemetryPageSize,
        totalPages: 0,
        totalElements: 0,
        hasNext: false,
        hasPrevious: false,
      })
      setResourceError('Unable to load resources from the backend. Make sure the core API is running and you are logged in.')
    } finally {
      setIsLoadingResources(false)
    }
  }

  const loadTelemetry = async (resourceId, page) => {
    setIsLoadingTelemetry(true)
    setTelemetryError('')

    try {
      const [metricsRes, healthRes] = await Promise.all([
        api.get(`${TELEMETRY_API_BASE_URL}/resource/${resourceId}/recent?page=${page}&size=${telemetryPageSize}`),
        api.get(`${TELEMETRY_API_BASE_URL}/health-metrics`),
      ])
      setRecentMetrics(metricsRes.data.content || [])
      setTelemetryPageMeta({
        page: metricsRes.data.page ?? page,
        size: metricsRes.data.size ?? telemetryPageSize,
        totalPages: metricsRes.data.totalPages ?? 0,
        totalElements: metricsRes.data.totalElements ?? 0,
        hasNext: metricsRes.data.hasNext ?? false,
        hasPrevious: metricsRes.data.hasPrevious ?? false,
      })
      setHealth(healthRes.data)
    } catch {
      setRecentMetrics([])
      setTelemetryPageMeta({
        page: 0,
        size: telemetryPageSize,
        totalPages: 0,
        totalElements: 0,
        hasNext: false,
        hasPrevious: false,
      })
      setHealth(null)
      setTelemetryError('Unable to load telemetry for the selected resource. Verify the telemetry service is running and has data.')
    } finally {
      setIsLoadingTelemetry(false)
    }
  }

  useEffect(() => {
    loadResources()
  }, [])

  useEffect(() => {
    if (selectedResourceId) {
      loadTelemetry(selectedResourceId, telemetryPage)
    } else {
      setRecentMetrics([])
      setHealth(null)
      setTelemetryPageMeta({
        page: 0,
        size: telemetryPageSize,
        totalPages: 0,
        totalElements: 0,
        hasNext: false,
        hasPrevious: false,
      })
      setTelemetryError('')
    }
  }, [selectedResourceId, telemetryPage])

  const injectAnomaly = async (anomalyType) => {
    if (!selectedResourceId) {
      setAnomalyNotice({
        tone: 'warning',
        text: 'Select a backend resource before injecting an anomaly.',
      })
      return
    }

    try {
      await api.post(`${TELEMETRY_API_BASE_URL}/inject-anomaly`, {
        resourceId: selectedResourceId,
        anomalyType,
      })
      setAnomalyNotice({
        tone: 'success',
        text: `${anomalyType === 'SPIKE' ? 'Spike' : 'Idle drop'} injected successfully.`,
      })
      await loadTelemetry(selectedResourceId, telemetryPage)
    } catch {
      setAnomalyNotice({
        tone: 'error',
        text: `Unable to inject ${anomalyType === 'SPIKE' ? 'a spike' : 'an idle drop'}. Confirm the telemetry service is available.`,
      })
    }
  }

  const latestMetric = recentMetrics[0] || null
  const selectedResource = resources.find((resource) => resource.id === selectedResourceId) || null
  const anomalyControlsReady = Boolean(selectedResourceId && resources.length)
  const anomalyButtonDisabled = !anomalyControlsReady || isLoadingResources || isLoadingTelemetry
  const idleDropButtonStyle = isDark
    ? {
        borderColor: 'rgba(251, 191, 36, 0.28)',
        backgroundImage: 'linear-gradient(135deg, rgba(120, 53, 15, 0.88), rgba(245, 158, 11, 0.22))',
        backgroundColor: 'rgba(120, 53, 15, 0.78)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        color: '#fef3c7',
      }
    : {
        borderColor: 'rgba(245, 158, 11, 0.42)',
        backgroundImage: 'linear-gradient(135deg, #fff7d6, #ffefbf)',
        backgroundColor: '#fff4cc',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
        color: '#b45309',
      }
  const spikeButtonStyle = isDark
    ? {
        borderColor: 'rgba(129, 140, 248, 0.28)',
        backgroundImage: 'linear-gradient(135deg, rgba(49, 46, 129, 0.88), rgba(99, 102, 241, 0.24))',
        backgroundColor: 'rgba(49, 46, 129, 0.8)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        color: '#e0e7ff',
      }
    : {
        borderColor: 'rgba(99, 102, 241, 0.4)',
        backgroundImage: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
        backgroundColor: '#e5e7eb',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
        color: '#4338ca',
      }
  const paginationButtonStyle = isDark
    ? {
        borderColor: 'rgba(129, 140, 248, 0.24)',
        backgroundImage: 'linear-gradient(135deg, rgba(30, 41, 59, 0.96), rgba(79, 70, 229, 0.22))',
        backgroundColor: 'rgba(30, 41, 59, 0.92)',
        color: '#dbeafe',
      }
    : {
        borderColor: 'rgba(99, 102, 241, 0.26)',
        backgroundImage: 'linear-gradient(135deg, #eef2ff, #dbeafe)',
        backgroundColor: '#eef2ff',
        color: '#3730a3',
      }

  const statTiles = useMemo(
    () => [
      {
        label: 'CPU utilization',
        value: `${Number(latestMetric?.cpuUtilizationPct || 0).toFixed(1)}%`,
      },
      {
        label: 'Memory utilization',
        value: `${Number(latestMetric?.memoryUtilizationPct || 0).toFixed(1)}%`,
      },
      {
        label: 'Storage IOPS',
        value: `${latestMetric?.storageIops || 0}`,
      },
    ],
    [latestMetric],
  )

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="panel p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Live telemetry lab</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Stream real-time infrastructure behavior for demos.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                Showcase sudden workload spikes or extreme idle drops and let downstream analytics react in real time.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2 xl:flex">
              <button
                type="button"
                onClick={() => injectAnomaly('IDLE_DROP')}
                disabled={anomalyButtonDisabled}
                style={idleDropButtonStyle}
                className="min-h-12 w-full rounded-2xl border px-5 py-3 text-center text-sm font-semibold transition-all duration-200 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[220px] xl:w-auto"
              >
                Inject Anomaly: Idle Drop
              </button>
              <button
                type="button"
                onClick={() => injectAnomaly('SPIKE')}
                disabled={anomalyButtonDisabled}
                style={spikeButtonStyle}
                className="min-h-12 w-full rounded-2xl border px-5 py-3 text-center text-sm font-semibold transition-all duration-200 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[220px] xl:w-auto"
              >
                Inject Anomaly: Resource Spike
              </button>
            </div>
          </div>
        </section>

        {resourceError ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {resourceError}
          </div>
        ) : null}

        {telemetryError ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {telemetryError}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="panel p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Observed resource</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Recent telemetry stream</h3>
              </div>
              <select
                value={selectedResourceId}
                onChange={(event) => {
                  setTelemetryPage(0)
                  setSelectedResourceId(event.target.value)
                }}
                className="theme-input rounded-2xl px-4 py-3 text-sm"
                disabled={isLoadingResources || !resources.length}
              >
                {!resources.length ? (
                  <option value="" className="bg-slate-950">
                    {isLoadingResources ? 'Loading resources...' : 'No resources available'}
                  </option>
                ) : null}
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id} className="bg-slate-950">
                    {resource.resourceName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 space-y-3">
              {isLoadingTelemetry ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  Loading telemetry...
                </div>
              ) : null}

              {!isLoadingTelemetry && !selectedResourceId ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  Select a resource after the backend resource list loads.
                </div>
              ) : null}

              {!isLoadingTelemetry && selectedResourceId && !recentMetrics.length && !telemetryError ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  No telemetry samples are available yet for this resource.
                </div>
              ) : null}

              {recentMetrics.map((metric) => (
                <div
                  key={metric.id}
                  className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1.1fr_0.9fr_0.9fr_0.8fr]"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Recorded at</p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {formatTelemetryTimestamp(metric.recordedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">CPU</p>
                    <p className="mt-2 text-sm font-semibold text-white">{metric.cpuUtilizationPct}%</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Memory</p>
                    <p className="mt-2 text-sm font-semibold text-white">{metric.memoryUtilizationPct}%</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">IOPS</p>
                    <p className="mt-2 text-sm font-semibold text-white">{metric.storageIops}</p>
                  </div>
                </div>
              ))}

              <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="text-slate-400">
                  {telemetryPageMeta.totalElements
                    ? `Showing ${telemetryPageMeta.page * telemetryPageMeta.size + 1}-${Math.min(
                        telemetryPageMeta.page * telemetryPageMeta.size + recentMetrics.length,
                        telemetryPageMeta.totalElements,
                      )} of ${telemetryPageMeta.totalElements} telemetry records`
                    : 'No telemetry records loaded yet'}
                </span>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setTelemetryPage((current) => Math.max(current - 1, 0))}
                    disabled={!telemetryPageMeta.hasPrevious || isLoadingTelemetry}
                    style={paginationButtonStyle}
                    className="rounded-xl border px-3 py-2 text-sm font-medium transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-slate-400">
                    Page {telemetryPageMeta.totalPages ? telemetryPageMeta.page + 1 : 0} of {telemetryPageMeta.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setTelemetryPage((current) =>
                        telemetryPageMeta.hasNext ? current + 1 : current,
                      )
                    }
                    disabled={!telemetryPageMeta.hasNext || isLoadingTelemetry}
                    style={paginationButtonStyle}
                    className="rounded-xl border px-3 py-2 text-sm font-medium transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="panel p-5">
              <div className="flex items-center gap-3">
                <Radio className="h-5 w-5 text-emerald-300" />
                <h3 className="text-xl font-semibold text-white">Live metrics</h3>
              </div>

              <div className="mt-5 grid gap-3">
                {statTiles.map((tile) => (
                  <div key={tile.label} className="panel-muted p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{tile.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{tile.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel p-5">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-indigo-300" />
                <h3 className="text-xl font-semibold text-white">Pipeline health</h3>
              </div>
              <div className="mt-5 space-y-4 text-sm text-slate-300">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span>Total records</span>
                  <span className="font-semibold text-white">{health?.totalRecords || 0}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span>Active resources</span>
                  <span className="font-semibold text-white">{health?.activeResources || 0}</span>
                </div>
                <div
                  style={
                    anomalyControlsReady
                      ? isDark
                        ? {
                            borderColor: 'rgba(16, 185, 129, 0.24)',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            color: '#d1fae5',
                          }
                        : {
                            borderColor: 'rgba(16, 185, 129, 0.28)',
                            backgroundColor: '#ecfdf5',
                            color: '#065f46',
                          }
                      : isDark
                        ? {
                            borderColor: 'rgba(244, 63, 94, 0.22)',
                            backgroundColor: 'rgba(244, 63, 94, 0.1)',
                            color: '#ffe4e6',
                          }
                        : {
                            borderColor: 'rgba(244, 63, 94, 0.24)',
                            backgroundColor: '#fff1f2',
                            color: '#9f1239',
                          }
                  }
                  className="rounded-2xl border p-4"
                >
                  <div className="font-semibold">Live anomaly controls</div>
                  <p className="mt-2 leading-6">
                    {anomalyControlsReady
                      ? `Ready. Anomaly injection is armed for ${selectedResource?.resourceName || 'the selected resource'}.`
                      : 'Load and select a backend resource to enable anomaly injection controls.'}
                  </p>
                  {anomalyNotice ? (
                    <div
                      style={
                        anomalyNotice.tone === 'success'
                          ? isDark
                            ? {
                                borderColor: 'rgba(110, 231, 183, 0.2)',
                                backgroundColor: 'rgba(110, 231, 183, 0.1)',
                                color: '#ecfdf5',
                              }
                            : {
                                borderColor: 'rgba(16, 185, 129, 0.22)',
                                backgroundColor: '#f0fdf4',
                                color: '#166534',
                              }
                          : anomalyNotice.tone === 'warning'
                            ? isDark
                              ? {
                                  borderColor: 'rgba(252, 211, 77, 0.2)',
                                  backgroundColor: 'rgba(252, 211, 77, 0.1)',
                                  color: '#fef3c7',
                                }
                              : {
                                  borderColor: 'rgba(245, 158, 11, 0.24)',
                                  backgroundColor: '#fffbeb',
                                  color: '#92400e',
                                }
                            : isDark
                              ? {
                                  borderColor: 'rgba(253, 164, 175, 0.2)',
                                  backgroundColor: 'rgba(253, 164, 175, 0.1)',
                                  color: '#fff1f2',
                                }
                              : {
                                  borderColor: 'rgba(244, 63, 94, 0.22)',
                                  backgroundColor: '#fff1f2',
                                  color: '#9f1239',
                                }
                      }
                      className="mt-3 rounded-xl border px-3 py-2 text-sm"
                    >
                      {anomalyNotice.text}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="panel p-5">
              <div className="flex items-center gap-3">
                <Waves className="h-5 w-5 text-emerald-300" />
                <h3 className="text-xl font-semibold text-white">Last sample</h3>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                {latestMetric?.recordedAt
                  ? `Latest signal observed at ${formatTelemetryTimestamp(latestMetric.recordedAt)}.`
                  : health?.lastRecordedTimestamp
                    ? `Latest signal observed at ${formatTelemetryTimestamp(health.lastRecordedTimestamp)}.`
                  : 'No telemetry samples have been observed yet.'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

export default LiveTelemetryPage
