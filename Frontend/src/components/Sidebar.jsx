import {
  Activity,
  ArrowRight,
  GaugeCircle,
  LayoutDashboard,
  ServerCog,
  Settings,
  Sparkles,
} from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

const primaryItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard, exact: true },
  { label: 'Resources', to: '/#resources', icon: ServerCog },
  { label: 'AI Waste Audit', to: '/audit', icon: Sparkles },
  { label: 'Settings', to: '/#settings', icon: Settings },
]

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleAnchorNavigate = (target) => {
    navigate('/')
    window.requestAnimationFrame(() => {
      const id = target.split('#')[1]
      if (!id) return
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <aside className="panel h-fit p-4 lg:sticky lg:top-6">
      <div className="rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/20 via-slate-900 to-emerald-500/10 p-5">
        <p className="text-xs uppercase tracking-[0.32em] text-indigo-200/80">FinOps signal</p>
        <h2 className="mt-3 text-xl font-semibold text-white">Turn telemetry into savings decisions.</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Trace spend drift, isolate idle compute, and operationalize AI-backed remediation.
        </p>
      </div>

      <nav className="mt-6 space-y-2">
        {primaryItems.map((item) => {
          const Icon = item.icon
          const isAnchor = item.to.includes('#')
          const isActive =
            (item.exact && location.pathname === '/') ||
            (!item.exact && !isAnchor && location.pathname.startsWith(item.to))

          if (isAnchor) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleAnchorNavigate(item.to)}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                <Icon className="h-4 w-4 text-slate-400" />
                {item.label}
              </button>
            )
          }

          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive: navActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  navActive || isActive
                    ? 'bg-indigo-500/15 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-400/10 p-2 text-emerald-300">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Live Telemetry Demo</p>
            <p className="text-xs text-slate-400">Realtime anomaly injection for interviews</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/telemetry')}
          className="mt-4 flex w-full items-center justify-between rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/20"
        >
          Open telemetry lab
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div id="settings" className="mt-6 rounded-3xl border border-dashed border-white/10 p-4">
        <div className="flex items-center gap-3">
          <GaugeCircle className="h-5 w-5 text-indigo-300" />
          <div>
            <p className="text-sm font-semibold text-white">Settings lane</p>
            <p className="text-xs text-slate-400">SSO, policies, and chargeback controls can layer in here next.</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
