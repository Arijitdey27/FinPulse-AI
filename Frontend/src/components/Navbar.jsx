import { Menu, Sparkles } from 'lucide-react'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

function Navbar({ onOpenSidebar }) {
  return (
    <header className="panel flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
          className="surface-icon-button mt-0.5 flex h-12 w-12 items-center justify-center rounded-2xl transition lg:hidden"
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

      <div className="flex items-center gap-3 self-start lg:self-auto">
        <ThemeToggle />
      </div>
    </header>
  )
}

export default Navbar
