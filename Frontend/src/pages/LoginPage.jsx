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
  const [form, setForm] = useState({
    email: 'admin@acme.com',
    password: 'Admin@123',
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
    <div className="relative flex min-h-screen items-center justify-center px-4 py-8">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="panel grid w-full max-w-6xl overflow-hidden rounded-[2rem] lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden border-b border-white/10 p-8 lg:border-b-0 lg:border-r lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_32%)]" />
          <div className="relative">
            <Logo className="h-12 w-auto" />
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">
              <Sparkles className="h-4 w-4" />
              Cost intelligence platform
            </span>
            <h1 className="mt-8 max-w-xl text-5xl font-semibold leading-tight text-white">
              Protect every cloud dollar with AI-guided operational insight.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
              FinPulse AI unifies telemetry, spend trends, and optimization recommendations into a single
              enterprise-grade control plane for cloud finance teams.
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <div className="panel-muted p-5">
                <ShieldCheck className="h-6 w-6 text-emerald-300" />
                <p className="mt-4 text-sm font-semibold text-white">Tenant-isolated access</p>
                <p className="mt-2 text-sm text-slate-400">JWT-secured sessions with contextual tenant switching.</p>
              </div>
              <div className="panel-muted p-5">
                <LockKeyhole className="h-6 w-6 text-indigo-300" />
                <p className="mt-4 text-sm font-semibold text-white">Audit-ready automation</p>
                <p className="mt-2 text-sm text-slate-400">Traceable savings actions designed for FinOps governance.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="p-8 lg:p-12">
          <div className="mx-auto max-w-md">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Platform login</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-400">Use the seeded demo account to access the command center.</p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="theme-input w-full rounded-2xl px-4 py-3 transition"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Password</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  className="theme-input w-full rounded-2xl px-4 py-3 transition"
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
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Authenticating...' : 'Launch FinPulse AI'}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
              Demo credentials: <span className="font-semibold text-white">admin@acme.com</span> /{' '}
              <span className="font-semibold text-white">Admin@123</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default LoginPage
