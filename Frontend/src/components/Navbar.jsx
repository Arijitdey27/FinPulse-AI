import { Bell, ChevronDown, LogOut, ShieldCheck, Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = useMemo(() => {
    if (!user?.email) return 'FP'
    return user.email
      .split('@')[0]
      .split('.')
      .map((part) => part[0]?.toUpperCase())
      .join('')
      .slice(0, 2)
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="panel flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Enterprise FinOps command</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-white">FinPulse AI</h1>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            Spring AI connected
          </span>
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

          <div className="panel-muted flex items-center gap-3 px-3 py-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-400 text-sm font-bold text-white">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user?.email || 'admin@acme.com'}</p>
              <p className="flex items-center gap-1 text-xs text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                {user?.role || 'ADMIN'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/20"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
