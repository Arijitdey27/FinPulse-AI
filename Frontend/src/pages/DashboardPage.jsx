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
  const [resources, setResources] = useState([])
  const [health, setHealth] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: 'hourlyCost', direction: 'desc' })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true)
      setError('')

      try {
        const [summaryRes, trendsRes, resourcesRes, healthRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/trends?days=14'),
          api.get('/resources?page=0&size=8'),
          api.get(`${TELEMETRY_API_BASE_URL}/health-metrics`),
        ])

        setSummary(summaryRes.data)
        setTrends(trendsRes.data)
        setResources(resourcesRes.data.content || [])
        setHealth(healthRes.data)
      } catch {
        setSummary({
          totalMonthlySpend: 0,
          totalActiveResources: 0,
          estimatedWaste: 0,
        })
        setTrends([])
        setResources([])
        setHealth(null)
        setError('Live backend data is unavailable. The dashboard is showing empty states until the APIs recover.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const sortedResources = useMemo(() => {
    const list = [...resources]
    list.sort((left, right) => {
      const leftValue = left[sortConfig.key]
      const rightValue = right[sortConfig.key]

      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        return sortConfig.direction === 'asc' ? leftValue - rightValue : rightValue - leftValue
      }

      return sortConfig.direction === 'asc'
        ? String(leftValue).localeCompare(String(rightValue))
        : String(rightValue).localeCompare(String(leftValue))
    })
    return list
  }, [resources, sortConfig])

  const chartData = useMemo(
    () =>
      trends.map((item) => ({
        dateLabel: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        spend: Number(item.totalDailyCost || 0),
        cpu: Number(item.avgCpuPct || 0),
      })),
    [trends],
  )

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

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

        <section className="grid gap-4 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
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

        <section id="resources" className="panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-400">Resource catalog</p>
              <h3 className="mt-1 text-xl font-semibold text-white">Active cloud resources</h3>
            </div>
            {isLoading ? <p className="text-sm text-slate-500">Refreshing inventory...</p> : null}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.28em] text-slate-500">
                <tr>
                  {[
                    ['resourceName', 'Resource'],
                    ['resourceType', 'Type'],
                    ['instanceType', 'Instance'],
                    ['hourlyCost', 'Hourly Cost'],
                    ['status', 'Status'],
                  ].map(([key, label]) => (
                    <th key={key} className="px-5 py-4">
                      <button type="button" onClick={() => handleSort(key)} className="transition hover:text-white">
                        {label}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!sortedResources.length ? (
                  <tr className="border-t border-white/5 text-sm text-slate-400">
                    <td colSpan="5" className="px-5 py-8 text-center">
                      {isLoading ? 'Loading active resources...' : 'No live resources are available to display.'}
                    </td>
                  </tr>
                ) : null}
                {sortedResources.map((resource) => (
                  <tr key={resource.id} className="border-t border-white/5 text-sm text-slate-300">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{resource.resourceName}</p>
                      <p className="mt-1 text-xs text-slate-500">{resource.id}</p>
                    </td>
                    <td className="px-5 py-4">{resource.resourceType}</td>
                    <td className="px-5 py-4">{resource.instanceType}</td>
                    <td className="px-5 py-4">${Number(resource.hourlyCost || 0).toFixed(2)}/hr</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          resource.status === 'ACTIVE'
                            ? 'bg-emerald-400/15 text-emerald-300'
                            : 'bg-amber-400/15 text-amber-300'
                        }`}
                      >
                        {resource.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

export default DashboardPage
