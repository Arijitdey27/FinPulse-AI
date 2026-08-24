import { useEffect, useState } from 'react'
import Navbar from './Navbar'
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

      <div className="flex min-w-0 flex-1 flex-col gap-6 px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
        <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main>{children}</main>
      </div>
    </div>
  )
}

export default AppShell
