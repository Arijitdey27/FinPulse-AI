import { LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [allowInputEdit, setAllowInputEdit] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const result = await login(form)

    if (!result.ok) {
      setError(result.message)
      return
    }

    navigate(location.state?.from?.pathname || '/', { replace: true })
  }

  return (
    <div className="relative flex h-[100dvh] items-center justify-center overflow-hidden px-3 py-4 sm:px-4 sm:py-5 lg:px-6">
      <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4 lg:right-6 lg:top-6">
        <ThemeToggle />
      </div>

      <div className="panel grid w-full max-w-6xl overflow-hidden rounded-[1.75rem] lg:max-h-[660px] lg:grid-cols-[1.02fr_0.98fr]">
        <section className="relative overflow-hidden border-b border-white/10 p-5 sm:p-6 lg:border-b-0 lg:border-r lg:p-7 xl:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_32%)]" />
          <div className="relative flex h-full flex-col">
            <Logo className="h-9 w-auto sm:h-10" />
            <span className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-200 sm:text-[11px]">
              <Sparkles className="h-4 w-4" />
              Cost intelligence platform
            </span>
            <h1 className="mt-4 max-w-[15ch] text-[1.7rem] font-semibold leading-[1.08] text-white sm:max-w-[14ch] sm:text-[2rem] sm:leading-[1.05] lg:max-w-[15ch] lg:text-[2.2rem] lg:leading-[1.05] xl:max-w-[16ch] xl:text-[2.45rem]">
              Protect every cloud dollar with AI-guided operational insight.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-[15px] sm:leading-6">
              FinPulse AI unifies telemetry, spend trends, and optimization recommendations into a single
              enterprise-grade control plane for cloud finance teams.
            </p>

            <div className="mt-6 hidden gap-3 md:grid md:grid-cols-2 lg:mt-6">
              <div className="panel-muted p-4">
                <ShieldCheck className="h-6 w-6 text-emerald-300" />
                <p className="mt-3 text-sm font-semibold text-white">Tenant-isolated access</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  JWT-secured sessions with contextual tenant switching.
                </p>
              </div>
              <div className="panel-muted p-4">
                <LockKeyhole className="h-6 w-6 text-indigo-300" />
                <p className="mt-3 text-sm font-semibold text-white">Audit-ready automation</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Traceable savings actions designed for FinOps governance.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center p-5 sm:p-6 lg:p-7 xl:p-8">
          <div className="mx-auto w-full max-w-md">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500 sm:text-sm">Platform login</p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-[1.85rem]">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Use the seeded demo account to access the command center.</p>

            <form className="mt-5 space-y-3 sm:mt-6" onSubmit={handleSubmit} autoComplete="off">
              <input type="text" name="username" autoComplete="username" className="hidden" tabIndex={-1} aria-hidden="true" />
              <input type="password" name="password" autoComplete="current-password" className="hidden" tabIndex={-1} aria-hidden="true" />

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Email</span>
                <input
                  type="email"
                  name="finpulse-email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  onFocus={() => setAllowInputEdit(true)}
                  className="theme-input w-full rounded-2xl px-4 py-2.5 transition"
                  autoComplete="off"
                  readOnly={!allowInputEdit}
                  placeholder="Enter your email"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Password</span>
                <input
                  type="password"
                  name="finpulse-password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  onFocus={() => setAllowInputEdit(true)}
                  className="theme-input w-full rounded-2xl px-4 py-2.5 transition"
                  autoComplete="new-password"
                  readOnly={!allowInputEdit}
                  placeholder="Enter your password"
                />
              </label>

              {error ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isLoading}
                className="auth-primary-button w-full rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Authenticating...' : 'Launch FinPulse AI'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}

export default LoginPage
