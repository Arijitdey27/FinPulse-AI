import Navbar from './Navbar'
import Sidebar from './Sidebar'

function AppShell({ children }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-6 px-4 py-6 lg:px-6">
      <div className="hidden w-[300px] shrink-0 lg:block">
        <Sidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <Navbar />
        <div className="lg:hidden">
          <Sidebar />
        </div>
        <main>{children}</main>
      </div>
    </div>
  )
}

export default AppShell
