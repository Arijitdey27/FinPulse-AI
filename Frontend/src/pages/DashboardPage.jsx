import { AlertTriangle, Boxes, DollarSign, ShieldCheck, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import AppShell from '../components/AppShell'
import CostChart from '../components/CostChart'
import MetricCard from '../components/MetricCard'
import api, { TELEMETRY_API_BASE_URL } from '../services/api'

const fallbackSummary = {
  totalMonthlySpend: 12450,
  totalActiveResources: 84,
  estimatedWaste: 3180,
}

const fallbackTrends = [
  { date: '2026-08-10', totalDailyCost: 345, avgCpuPct: 54 },
  { date: '2026-08-11', totalDailyCost: 338, avgCpuPct: 52 },
  { date: '2026-08-12', totalDailyCost: 352, avgCpuPct: 57 },
  { date: '2026-08-13', totalDailyCost: 367, avgCpuPct: 59 },
  { date: '2026-08-14', totalDailyCost: 372, avgCpuPct: 61 },
  { date: '2026-08-15', totalDailyCost: 361, avgCpuPct: 58 },
  { date: '2026-08-16', totalDailyCost: 340, avgCpuPct: 48 },
  { date: '2026-08-17', totalDailyCost: 331, avgCpuPct: 44 },
  { date: '2026-08-18', totalDailyCost: 326, avgCpuPct: 41 },
  { date: '2026-08-19', totalDailyCost: 322, avgCpuPct: 39 },
  { date: '2026-08-20', totalDailyCost: 334, avgCpuPct: 42 },
  { date: '2026-08-21', totalDailyCost: 341, avgCpuPct: 47 },
  { date: '2026-08-22', totalDailyCost: 356, avgCpuPct: 53 },
  { date: '2026-08-23', totalDailyCost: 363, avgCpuPct: 56 },
]

const fallbackResources = [
  { id: 'r-101', resourceName: 'acme-api-prod-01', resourceType: 'EC2', instanceType: 'm5.2xlarge', hourlyCost: 0.46, status: 'ACTIVE' },
  { id: 'r-102', resourceName: 'acme-batch-worker-02', resourceType: 'EC2', instanceType: 'm5.xlarge', hourlyCost: 0.24, status: 'IDLE' },
  { id: 'r-103', resourceName: 'acme-analytics-cache', resourceType: 'Redis', instanceType: 'cache.r6g.large', hourlyCost: 0.19, status: 'ACTIVE' },
  { id: 'r-104', resourceName: 'acme-dev-kafka', resourceType: 'MSK', instanceType: 'kafka.m5.large', hourlyCost: 0.33, status: 'IDLE' },
]

function DashboardPage() {
  const [summary, setSummary] = useState(fallbackSummary)
  const [trends, setTrends] = useState(fallbackTrends)
  const [resources, setResources] = useState(fallbackResources)
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
        setError('Live backend data is unavailable, so demo telemetry is being shown.')
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
      trend: 6.4,
      icon: DollarSign,
      tone: 'indigo',
      detail: 'Cross-account blended cloud spend',
    },
    {
      title: 'Active Cloud Resources',
      value: Number(summary.totalActiveResources || 0).toLocaleString(),
      trend: 2.1,
      icon: Boxes,
      tone: 'emerald',
      detail: 'Compute, cache, stream, and data plane assets',
    },
    {
      title: 'Idle Wastage Detected',
      value: `$${Number(summary.estimatedWaste || 0).toLocaleString()}`,
      trend: -4.8,
      icon: AlertTriangle,
      tone: 'amber',
      detail: 'Low-utilization workloads flagged for review',
    },
    {
      title: 'AI Savings Potential',
      value: `$${Math.round(Number(summary.estimatedWaste || 0) * 0.82).toLocaleString()}`,
      trend: 11.7,
      icon: TrendingUp,
      tone: 'rose',
      detail: 'Modeled by rightsizing and termination suggestions',
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
                  {health?.totalRecords?.toLocaleString?.() || '500'}
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
                    ? new Date(health.lastRecordedTimestamp).toLocaleString()
                    : 'August 23, 2026, 12:45 PM'}
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
