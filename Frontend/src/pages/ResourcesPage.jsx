import { Search, ServerCog } from 'lucide-react'
import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell'
import { useTheme } from '../context/ThemeContext'
import api from '../services/api'

const PAGE_SIZE = 10

function ResourcesPage() {
  const { isDark } = useTheme()
  const [resources, setResources] = useState([])
  const [page, setPage] = useState(0)
  const [pageMeta, setPageMeta] = useState({
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false,
  })
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const paginationButtonStyle = isDark
    ? {
        borderColor: 'rgba(129, 140, 248, 0.24)',
        backgroundImage: 'linear-gradient(135deg, rgba(30, 41, 59, 0.96), rgba(79, 70, 229, 0.22))',
        backgroundColor: 'rgba(30, 41, 59, 0.92)',
        color: '#dbeafe',
      }
    : {
        borderColor: 'rgba(99, 102, 241, 0.26)',
        backgroundImage: 'linear-gradient(135deg, #eef2ff, #dbeafe)',
        backgroundColor: '#eef2ff',
        color: '#3730a3',
      }

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true)
      setError('')

      try {
        const params = new URLSearchParams({
          page: String(page),
          size: String(PAGE_SIZE),
          sort: 'hourlyCost,desc',
        })

        if (search) {
          params.set('search', search)
        }

        const { data } = await api.get(`/resources?${params.toString()}`)
        setResources(data.content || [])
        setPageMeta({
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0,
          hasNext: !data.last,
          hasPrevious: !data.first,
        })
      } catch {
        setResources([])
        setPageMeta({
          totalPages: 0,
          totalElements: 0,
          hasNext: false,
          hasPrevious: false,
        })
        setError('Unable to load cloud resources right now. Please try again after the backend recovers.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResources()
  }, [page, search])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setPage(0)
    setSearch(searchInput.trim())
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="panel p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Resource Management</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Track every active tenant resource in one place.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                Browse the live cloud inventory with server-side pagination so the page only loads 10 resources at a time.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex w-full max-w-xl gap-3">
              <div className="theme-input flex min-w-0 flex-1 items-center rounded-2xl px-4 py-3">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by name, id, type, or instance"
                  className="w-full bg-transparent px-3 text-sm outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-5 py-3 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-500/15"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {error}
          </div>
        ) : null}

        <section className="panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <ServerCog className="h-5 w-5 text-emerald-300" />
              <div>
                <p className="text-sm text-slate-400">Resource catalog</p>
                <h3 className="mt-1 text-xl font-semibold text-white">Active cloud resources</h3>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              {pageMeta.totalElements
                ? `Showing ${page * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE + resources.length, pageMeta.totalElements)} of ${pageMeta.totalElements}`
                : 'No resources available'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.28em] text-slate-500">
                <tr>
                  <th className="px-4 py-4 sm:px-5">Resource</th>
                  <th className="px-4 py-4 sm:px-5">Type</th>
                  <th className="px-4 py-4 sm:px-5">Instance</th>
                  <th className="px-4 py-4 sm:px-5">Hourly Cost</th>
                  <th className="px-4 py-4 sm:px-5">Status</th>
                </tr>
              </thead>
              <tbody>
                {!resources.length ? (
                  <tr className="border-t border-white/5 text-sm text-slate-400">
                    <td colSpan="5" className="px-4 py-8 text-center sm:px-5">
                      {isLoading ? 'Loading active resources...' : 'No live resources matched this view.'}
                    </td>
                  </tr>
                ) : null}
                {resources.map((resource) => (
                  <tr key={resource.id} className="border-t border-white/5 text-sm text-slate-300">
                    <td className="px-4 py-4 sm:px-5">
                      <p className="font-semibold text-white">{resource.resourceName}</p>
                      <p className="mt-1 text-xs text-slate-500">{resource.id}</p>
                    </td>
                    <td className="px-4 py-4 sm:px-5">{resource.resourceType}</td>
                    <td className="px-4 py-4 sm:px-5">{resource.instanceType}</td>
                    <td className="px-4 py-4 sm:px-5">${Number(resource.hourlyCost || 0).toFixed(2)}/hr</td>
                    <td className="px-4 py-4 sm:px-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          resource.status === 'ACTIVE'
                            ? 'bg-emerald-400/15 text-emerald-300'
                            : 'bg-amber-400/15 text-amber-300'
                        }`}
                      >
                        {resource.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-slate-400">
              Page {pageMeta.totalPages ? page + 1 : 0} of {pageMeta.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(current - 1, 0))}
                disabled={!pageMeta.hasPrevious || isLoading}
                style={paginationButtonStyle}
                className="rounded-xl border px-3 py-2 text-sm font-medium transition hover:brightness-105 disabled:cursor-not-allowed disabled:text-slate-400 disabled:brightness-90"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => (pageMeta.hasNext ? current + 1 : current))}
                disabled={!pageMeta.hasNext || isLoading}
                style={paginationButtonStyle}
                className="rounded-xl border px-3 py-2 text-sm font-medium transition hover:brightness-105 disabled:cursor-not-allowed disabled:text-slate-400 disabled:brightness-90"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

export default ResourcesPage
