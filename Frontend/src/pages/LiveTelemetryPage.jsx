import { Activity, AlertOctagon, Radio, Waves } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import AppShell from '../components/AppShell'
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
  const [resources, setResources] = useState([])
  const [selectedResourceId, setSelectedResourceId] = useState('')
  const [recentMetrics, setRecentMetrics] = useState([])
  const [health, setHealth] = useState(null)
  const [message, setMessage] = useState('')
  const [isLoadingResources, setIsLoadingResources] = useState(true)
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(false)
  const [resourceError, setResourceError] = useState('')
  const [telemetryError, setTelemetryError] = useState('')

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
        setTelemetryError('')
      }
    } catch {
      setResources([])
      setSelectedResourceId('')
      setRecentMetrics([])
      setResourceError('Unable to load resources from the backend. Make sure the core API is running and you are logged in.')
    } finally {
      setIsLoadingResources(false)
    }
  }

  const loadTelemetry = async (resourceId) => {
    setIsLoadingTelemetry(true)
    setTelemetryError('')

    try {
      const [metricsRes, healthRes] = await Promise.all([
        api.get(`${TELEMETRY_API_BASE_URL}/resource/${resourceId}/recent`),
        api.get(`${TELEMETRY_API_BASE_URL}/health-metrics`),
      ])
      setRecentMetrics(metricsRes.data)
      setHealth(healthRes.data)
    } catch {
      setRecentMetrics([])
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
      loadTelemetry(selectedResourceId)
    } else {
      setRecentMetrics([])
      setHealth(null)
      setTelemetryError('')
    }
  }, [selectedResourceId])

  const injectAnomaly = async (anomalyType) => {
    if (!selectedResourceId) {
      setMessage('Select a backend resource before injecting an anomaly.')
      return
    }

    try {
      await api.post(`${TELEMETRY_API_BASE_URL}/inject-anomaly`, {
        resourceId: selectedResourceId,
        anomalyType,
      })
      setMessage(`${anomalyType === 'SPIKE' ? 'Spike' : 'Idle drop'} injected successfully.`)
      await loadTelemetry(selectedResourceId)
    } catch {
      setMessage(`Unable to inject ${anomalyType === 'SPIKE' ? 'a spike' : 'an idle drop'}. Confirm the telemetry service is available.`)
    }
  }

  const latestMetric = recentMetrics[0] || null

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

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => injectAnomaly('IDLE_DROP')}
                className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/20"
              >
                Inject Anomaly: Idle Drop
              </button>
              <button
                type="button"
                onClick={() => injectAnomaly('SPIKE')}
                className="rounded-2xl bg-gradient-to-r from-indigo-500 to-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Inject Anomaly: Resource Spike
              </button>
            </div>
          </div>
        </section>

        {message ? (
          <div className="rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-100">
            {message}
          </div>
        ) : null}

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
                onChange={(event) => setSelectedResourceId(event.target.value)}
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
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-rose-100">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertOctagon className="h-4 w-4" />
                    Live anomaly controls
                  </div>
                  <p className="mt-2 leading-6">
                    Use the anomaly buttons to trigger a sudden utilization event once a backend resource has been loaded.
                  </p>
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
