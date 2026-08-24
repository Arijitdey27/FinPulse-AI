import {
  ChevronUp,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  Radio,
  ServerCog,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const primaryItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard, exact: true },
  { label: 'Resources', to: '/#resources', icon: ServerCog },
  { label: 'Live Telemetry', to: '/telemetry', icon: Radio },
  { label: 'AI Waste Audit', to: '/audit', icon: Sparkles },
  { label: 'Settings', to: '/#settings', icon: Settings },
]

function Sidebar({ isMobile = false, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)

  const initials = useMemo(() => {
    if (!user?.email) return 'FP'
    return user.email
      .split('@')[0]
      .split('.')
      .map((part) => part[0]?.toUpperCase())
      .join('')
      .slice(0, 2)
  }, [user])

  const closeSidebar = () => {
    setIsAccountMenuOpen(false)
    onClose?.()
  }

  const handleAnchorNavigate = (target) => {
    navigate('/')
    closeSidebar()

    window.requestAnimationFrame(() => {
      const id = target.split('#')[1]
      if (!id) return
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const handleNavigate = (target) => {
    navigate(target)
    closeSidebar()
  }

  const handleLogout = () => {
    setIsAccountMenuOpen(false)
    logout()
    navigate('/login')
    closeSidebar()
  }

  return (
    <aside className="sidebar-shell flex h-full flex-col px-3 py-4">
      <div className="flex items-center justify-between px-3">
        <button
          type="button"
          onClick={() => handleNavigate('/')}
          className="text-left text-[1.75rem] font-semibold tracking-tight text-white transition hover:opacity-90"
        >
          FinPulse AI
        </button>

        {isMobile ? (
          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Close sidebar"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:bg-white/10"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <nav className="mt-6 space-y-1">
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
                className="sidebar-nav-item flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-medium transition"
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            )
          }

          return (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={closeSidebar}
              className={({ isActive: navActive }) =>
                `sidebar-nav-item flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium transition ${
                  navActive || isActive ? 'sidebar-nav-item-active' : ''
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto space-y-3 pt-4">
        {isAccountMenuOpen ? (
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/20"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setIsAccountMenuOpen((current) => !current)}
          className="sidebar-account-card flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition"
          aria-expanded={isAccountMenuOpen}
          aria-label="Open account menu"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-400 text-base font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user?.email || 'admin@acme.com'}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              {user?.role || 'ADMIN'}
            </p>
          </div>
          <ChevronUp
            className={`h-4 w-4 shrink-0 text-slate-400 transition ${isAccountMenuOpen ? 'rotate-0' : 'rotate-180'}`}
          />
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
