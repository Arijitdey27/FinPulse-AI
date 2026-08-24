import { Bell, ChevronDown, Menu, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

function Navbar({ onOpenSidebar }) {
  const { user } = useAuth()

  return (
    <header className="panel flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
          className="mt-0.5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:bg-white/10 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Enterprise FinOps command</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Logo className="h-10 w-auto" />
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Spring AI connected
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <button
          type="button"
          className="panel-muted flex items-center justify-between gap-3 px-4 py-3 text-left transition hover:border-indigo-400/40 hover:bg-indigo-500/10"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Tenant</p>
            <p className="mt-1 text-sm font-semibold text-white">{user?.tenantName || 'Acme Cloud'}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:bg-white/10"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export default Navbar
