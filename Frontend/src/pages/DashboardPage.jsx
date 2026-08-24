import { AlertTriangle, Boxes, DollarSign, ShieldCheck, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import AppShell from '../components/AppShell'
import CostChart from '../components/CostChart'
import MetricCard from '../components/MetricCard'
import api, { TELEMETRY_API_BASE_URL } from '../services/api'
import { formatUtcTimestamp } from '../utils/time'

function DashboardPage() {
  const [summary, setSummary] = useState({
    totalMonthlySpend: 0,
    totalActiveResources: 0,
    estimatedWaste: 0,
  })
  const [trends, setTrends] = useState([])
  const [health, setHealth] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true)
      setError('')

      try {
        const [summaryRes, trendsRes, healthRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/trends?days=14'),
          api.get(`${TELEMETRY_API_BASE_URL}/health-metrics`),
        ])

        setSummary(summaryRes.data)
        setTrends(trendsRes.data)
        setHealth(healthRes.data)
      } catch {
        setSummary({
          totalMonthlySpend: 0,
          totalActiveResources: 0,
          estimatedWaste: 0,
        })
        setTrends([])
        setHealth(null)
        setError('Live backend data is unavailable. The dashboard is showing empty states until the APIs recover.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const chartData = useMemo(
    () =>
      trends.map((item) => ({
        dateLabel: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        spend: Number(item.totalDailyCost || 0),
        cpu: Number(item.avgCpuPct || 0),
      })),
    [trends],
  )

  const metrics = [
    {
      title: 'Total Monthly Spend',
      value: `$${Number(summary.totalMonthlySpend || 0).toLocaleString()}/mo`,
      icon: DollarSign,
      tone: 'indigo',
      detail: 'Cross-account blended cloud spend',
    },
    {
      title: 'Active Cloud Resources',
      value: Number(summary.totalActiveResources || 0).toLocaleString(),
      icon: Boxes,
      tone: 'emerald',
      detail: 'Compute, cache, stream, and data plane assets',
    },
    {
      title: 'Idle Wastage Detected',
      value: `$${Number(summary.estimatedWaste || 0).toLocaleString()}`,
      icon: AlertTriangle,
      tone: 'amber',
      detail: 'Low-utilization workloads flagged for review',
    },
    {
      title: 'AI Audit Status',
      value: isLoading ? 'Loading...' : trends.length ? 'Ready' : 'No data',
      icon: TrendingUp,
      tone: 'rose',
      detail: 'Run the waste audit after telemetry and dashboard APIs return live tenant data.',
    },
  ]

  return (
    <AppShell>
      <div className="space-y-6">
        {error ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </section>

        <section className="grid gap-6 2xl:grid-cols-[1.6fr_0.8fr]">
          <CostChart data={chartData} />

          <div className="panel flex flex-col gap-5 p-5">
            <div>
              <p className="text-sm text-slate-400">Telemetry health</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Live ingestion status</h3>
            </div>

            <div className="grid gap-4">
              <div className="panel-muted p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Ingested rows</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {health?.totalRecords?.toLocaleString?.() || '0'}
                </p>
              </div>
              <div className="panel-muted p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Active resources</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {health?.activeResources?.toLocaleString?.() || summary.totalActiveResources}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  Pipeline heartbeat healthy
                </div>
                <p className="mt-3 text-sm leading-6 text-emerald-50/90">
                  Last telemetry event:{' '}
                  {health?.lastRecordedTimestamp
                    ? formatUtcTimestamp(health.lastRecordedTimestamp, undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'medium',
                      })
                    : 'No telemetry has been ingested yet.'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

export default DashboardPage
