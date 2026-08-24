import { Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'

const SIDEBAR_COLLAPSED_KEY = 'finpulse-sidebar-collapsed'

function AppShell({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
  })

  useEffect(() => {
    if (!isSidebarOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isSidebarOpen])

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  return (
    <div className="flex min-h-screen w-full">
      <div
        className={`hidden transition-[width] duration-200 ease-out lg:block lg:shrink-0 ${
          isSidebarCollapsed ? 'lg:w-[92px]' : 'lg:w-[290px]'
        }`}
      >
        <div className="sticky top-0 h-screen border-r border-white/10 sidebar-shell backdrop-blur-xl">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
          />
        </div>
      </div>

      {isSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar overlay"
            className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="sidebar-mobile-sheet absolute inset-y-0 left-0 w-[min(86vw,320px)]">
            <Sidebar isMobile onClose={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col gap-4 px-3 py-4 sm:gap-5 sm:px-4 sm:py-5 lg:gap-6 lg:px-6 lg:py-6">
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:bg-white/10 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}

export default AppShell
