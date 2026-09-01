import { AlertTriangle, KeyRound, Plus, Search, ShieldCheck, Trash2, UserCog, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const PAGE_SIZE = 8

const emptyCreateForm = {
  name: '',
  email: '',
  password: '',
  role: 'USER',
  description: '',
}

const emptyEditForm = {
  id: '',
  name: '',
  email: '',
  role: 'USER',
  description: '',
}

const emptyPasswordForm = {
  userId: '',
  password: '',
}

const emptyDeleteDialog = {
  isOpen: false,
  userId: '',
  userName: '',
}

function UsersPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    standardUsers: 0,
  })
  const [page, setPage] = useState(0)
  const [pageMeta, setPageMeta] = useState({
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false,
  })
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [createForm, setCreateForm] = useState(emptyCreateForm)
  const [editForm, setEditForm] = useState(emptyEditForm)
  const [initialEditForm, setInitialEditForm] = useState(emptyEditForm)
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(emptyDeleteDialog)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false)
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadUsers = async (nextPage = page, nextSearch = search) => {
    setIsLoading(true)
    setError('')

    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        size: String(PAGE_SIZE),
        sort: 'createdAt,desc',
      })

      if (nextSearch) {
        params.set('search', nextSearch)
      }

      const [usersResponse, statsResponse] = await Promise.all([
        api.get(`/users?${params.toString()}`),
        api.get('/users/stats'),
      ])

      setUsers(usersResponse.data.content || [])
      setPageMeta({
        totalPages: usersResponse.data.totalPages || 0,
        totalElements: usersResponse.data.totalElements || 0,
        hasNext: !usersResponse.data.last,
        hasPrevious: !usersResponse.data.first,
      })
      setStats(statsResponse.data || { totalUsers: 0, adminUsers: 0, standardUsers: 0 })
    } catch (requestError) {
      setUsers([])
      setStats({ totalUsers: 0, adminUsers: 0, standardUsers: 0 })
      setPageMeta({
        totalPages: 0,
        totalElements: 0,
        hasNext: false,
        hasPrevious: false,
      })
      setError(getErrorMessage(requestError, 'Unable to load company users right now.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    loadUsers(page, search)
  }, [page, search, user?.tenantId])

  useEffect(() => {
    if (!isCreateModalOpen && !isEditModalOpen && !deleteDialog.isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeCreateModal()
        closeEditModal()
        closeDeleteDialog()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isCreateModalOpen, isEditModalOpen, deleteDialog.isOpen])

  const closeCreateModal = () => {
    setIsCreateModalOpen(false)
    setCreateForm(emptyCreateForm)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditForm(emptyEditForm)
    setInitialEditForm(emptyEditForm)
    setPasswordForm(emptyPasswordForm)
  }

  const closeDeleteDialog = () => {
    if (deletingUserId) return
    setDeleteDialog(emptyDeleteDialog)
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setSuccess('')
    setPage(0)
    setSearch(searchInput.trim())
  }

  const handleCreateSubmit = async (event) => {
    event.preventDefault()
    if (!isAdmin) return
    setIsCreateSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await api.post('/users', createForm)
      closeCreateModal()
      setPage(0)
      setSearch('')
      setSearchInput('')
      setSuccess('New company user created successfully.')
      await loadUsers(0, '')
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to create the user.'))
    } finally {
      setIsCreateSubmitting(false)
    }
  }

  const beginEdit = (targetUser) => {
    if (!isAdmin) return
    setSuccess('')
    setError('')
    const nextEditForm = {
      id: targetUser.id,
      name: targetUser.name || '',
      email: targetUser.email,
      role: targetUser.role,
      description: targetUser.description || '',
    }
    setEditForm(nextEditForm)
    setInitialEditForm(nextEditForm)
    setPasswordForm({
      userId: targetUser.id,
      password: '',
    })
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!isAdmin) return
    if (!editForm.id) return

    setIsEditSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await api.put(`/users/${editForm.id}`, {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        description: editForm.description,
      })
      closeEditModal()
      setSuccess('User details updated successfully.')
      await loadUsers()
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to update the user.'))
    } finally {
      setIsEditSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    if (!isAdmin) return
    if (!passwordForm.userId) return

    setIsPasswordSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await api.patch(`/users/${passwordForm.userId}/password`, {
        password: passwordForm.password,
      })
      setPasswordForm((current) => ({ ...current, password: '' }))
      setSuccess('User password reset successfully.')
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to reset the password.'))
    } finally {
      setIsPasswordSubmitting(false)
    }
  }

  const openDeleteDialog = (targetUser) => {
    if (!isAdmin) return
    setDeleteDialog({
      isOpen: true,
      userId: targetUser.id,
      userName: targetUser.name || targetUser.email,
    })
  }

  const isEditDirty =
    editForm.id !== initialEditForm.id ||
    editForm.name !== initialEditForm.name ||
    editForm.email !== initialEditForm.email ||
    editForm.role !== initialEditForm.role ||
    editForm.description !== initialEditForm.description

  const handleDeleteConfirm = async () => {
    if (!isAdmin) return
    if (!deleteDialog.userId) return

    setDeletingUserId(deleteDialog.userId)
    setError('')
    setSuccess('')

    try {
      await api.delete(`/users/${deleteDialog.userId}`)
      if (editForm.id === deleteDialog.userId) {
        closeEditModal()
      }

      const nextPage = page > 0 && users.length === 1 ? page - 1 : page
      setSuccess('User deleted successfully.')
      setDeleteDialog(emptyDeleteDialog)

      if (nextPage !== page) {
        setPage(nextPage)
      } else {
        await loadUsers(nextPage, search)
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to delete the user.'))
    } finally {
      setDeletingUserId('')
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="panel p-6">
          <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">User Management</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">View company access across your tenant.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                Review teammates, roles, profile notes, and directory health in one place.
              </p>
            </div>

            <div className="flex w-full max-w-3xl flex-col gap-3 2xl:items-end">
              <form onSubmit={handleSearchSubmit} className="flex w-full min-w-0 flex-col gap-3 lg:flex-row 2xl:max-w-2xl">
                <div className="theme-input flex min-w-0 flex-1 items-center rounded-2xl px-4 py-3">
                  <Search className="h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search by name, email, role, or description"
                    className="w-full bg-transparent px-3 text-sm outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="app-button app-button-primary w-full rounded-2xl px-5 py-3 text-sm font-semibold transition lg:w-auto"
                >
                  Search
                </button>
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="app-button app-button-success inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition lg:w-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Add user
                  </button>
                ) : null}
              </form>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {success}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard icon={Users} label="Total users" value={stats.totalUsers} tone="indigo" />
          <StatCard icon={ShieldCheck} label="Company admins" value={stats.adminUsers} tone="emerald" />
          <StatCard icon={UserCog} label="Standard users" value={stats.standardUsers} tone="amber" />
        </section>

        <section>
          <section className="panel overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-emerald-300" />
                <div>
                  <p className="text-sm text-slate-400">Company directory</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">Tenant users</h3>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                {pageMeta.totalElements
                  ? `Showing ${page * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE + users.length, pageMeta.totalElements)} of ${pageMeta.totalElements}`
                  : 'No users available'}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left">
                <thead className="bg-white/5 text-xs uppercase tracking-[0.28em] text-slate-500">
                  <tr>
                    <th className="px-4 py-4 sm:px-5">User</th>
                    <th className="px-4 py-4 sm:px-5">Email</th>
                    <th className="px-4 py-4 sm:px-5">Role</th>
                    <th className="px-4 py-4 sm:px-5">Description</th>
                    <th className="px-4 py-4 sm:px-5">Created</th>
                    {isAdmin ? <th className="px-4 py-4 sm:px-5">Actions</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {!users.length ? (
                    <tr className="border-t border-white/5 text-sm text-slate-400">
                      <td colSpan={isAdmin ? 6 : 5} className="px-4 py-8 text-center sm:px-5">
                        {isLoading ? 'Loading company users...' : 'No users matched this view.'}
                      </td>
                    </tr>
                  ) : null}

                  {users.map((tenantUser) => {
                    const isSelected = editForm.id === tenantUser.id
                    const isDeleting = deletingUserId === tenantUser.id
                    const canDelete = tenantUser.role !== 'ADMIN'

                    return (
                      <tr
                        key={tenantUser.id}
                        className={`border-t border-white/5 text-sm text-slate-300 ${isSelected ? 'bg-white/5' : ''}`}
                      >
                        <td className="px-4 py-4 align-top sm:px-5">
                          <p className="font-semibold text-white">{tenantUser.name || 'Unnamed user'}</p>
                        </td>
                        <td className="px-4 py-4 align-top sm:px-5">{tenantUser.email}</td>
                        <td className="px-4 py-4 align-top sm:px-5">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              tenantUser.role === 'ADMIN'
                                ? 'bg-emerald-400/15 text-emerald-300'
                                : 'bg-indigo-500/10 text-indigo-100'
                            }`}
                          >
                            {tenantUser.role}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top text-sm leading-6 text-slate-400 sm:px-5">
                          {tenantUser.description || 'No description added yet.'}
                        </td>
                        <td className="px-4 py-4 align-top sm:px-5">
                          {tenantUser.createdAt
                            ? new Date(tenantUser.createdAt).toLocaleString('en-US', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })
                            : 'Unavailable'}
                        </td>
                        {isAdmin ? (
                          <td className="px-4 py-4 align-top sm:px-5">
                            <div className="flex flex-nowrap gap-2 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => beginEdit(tenantUser)}
                                className="app-button shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition"
                              >
                                Manage
                              </button>
                              {canDelete ? (
                                <button
                                  type="button"
                                  onClick={() => openDeleteDialog(tenantUser)}
                                  disabled={isDeleting}
                                  className="app-button app-button-danger inline-flex shrink-0 items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                              ) : null}
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-slate-400">
                Page {pageMeta.totalPages ? page + 1 : 0} of {pageMeta.totalPages}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(current - 1, 0))}
                  disabled={!pageMeta.hasPrevious || isLoading}
                  className="app-button rounded-xl px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:text-slate-400 disabled:brightness-90"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => (pageMeta.hasNext ? current + 1 : current))}
                  disabled={!pageMeta.hasNext || isLoading}
                  className="app-button rounded-xl px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:text-slate-400 disabled:brightness-90"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </section>
      </div>

      {isAdmin && isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close create user modal"
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
            onClick={closeCreateModal}
          />

          <section className="panel relative z-10 w-full max-w-2xl overflow-hidden rounded-[2rem]">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Create user</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Add a teammate to your company</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Capture identity details, a temporary password, and a short description in one flow.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="surface-icon-button flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5 px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-400">Name</span>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
                    className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
                    placeholder="Full name"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-slate-400">Role</span>
                  <select
                    value={createForm.role}
                    onChange={(event) => setCreateForm((current) => ({ ...current, role: event.target.value }))}
                    className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-400">Email</span>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))}
                  className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
                  name="create-user-email"
                  autoComplete="off"
                  placeholder="example@gmail.com"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-400">Temporary password</span>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))}
                  className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
                  name="create-user-password"
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-400">Description</span>
                <textarea
                  value={createForm.description}
                  onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
                  className="theme-input min-h-[132px] w-full rounded-2xl px-4 py-3 text-sm outline-none"
                  placeholder="Describe this teammate's access, team, or responsibilities"
                  maxLength={255}
                />
              </label>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="app-button rounded-2xl px-5 py-3 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreateSubmitting}
                  className="app-button app-button-success rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isCreateSubmitting ? 'Creating user...' : 'Create user'}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {isAdmin && isEditModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close edit user modal"
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
            onClick={closeEditModal}
          />

          <section className="panel relative z-10 w-full max-w-3xl overflow-hidden rounded-[2rem]">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Manage user</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Update profile, role, and credentials</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Edit teammate details and reset their temporary password from one place.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="surface-icon-button flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 px-6 py-6 xl:grid-cols-[1.2fr_0.9fr]">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-400">Name</span>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
                    className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
                    placeholder="Full name"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-slate-400">Email</span>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))}
                    className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
                    placeholder="example@gmail.com"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-slate-400">Description</span>
                  <textarea
                    value={editForm.description}
                    onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))}
                    className="theme-input min-h-[132px] w-full rounded-2xl px-4 py-3 text-sm outline-none"
                    placeholder="Add team context, responsibility, or access notes"
                    maxLength={255}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-slate-400">Role</span>
                  <select
                    value={editForm.role}
                    onChange={(event) => setEditForm((current) => ({ ...current, role: event.target.value }))}
                    className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </label>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="app-button rounded-2xl px-5 py-3 text-sm font-semibold transition"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isEditSubmitting || !isEditDirty}
                    className="app-button app-button-success rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isEditSubmitting ? 'Saving changes...' : 'Save changes'}
                  </button>
                </div>
              </form>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <KeyRound className="h-4 w-4 text-indigo-300" />
                  Reset temporary password
                </div>
                <p className="text-sm leading-6 text-slate-400">
                  Set a new temporary password for this teammate. They can change it after signing in.
                </p>
                <input
                  type="password"
                  value={passwordForm.password}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, password: event.target.value }))}
                  className="theme-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                />
                <button
                  type="submit"
                  disabled={isPasswordSubmitting}
                  className="app-button app-button-primary w-full rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPasswordSubmitting ? 'Resetting password...' : 'Reset password'}
                </button>
              </form>
            </div>
          </section>
        </div>
      ) : null}

      {isAdmin && deleteDialog.isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close delete user dialog"
            className="absolute inset-0 bg-white/8 backdrop-blur-[2px] dark:bg-slate-950/22"
            onClick={closeDeleteDialog}
          />

          <section className="panel relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-rose-400/20">
            <div className="px-6 pt-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/10 text-rose-200">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">Are you sure?</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Delete{' '}
                <span className="font-semibold text-slate-900 dark:text-slate-100">{deleteDialog.userName}</span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex flex-col gap-3 px-6 py-6 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={Boolean(deletingUserId)}
                className="app-button app-button-danger rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deletingUserId ? 'Deleting user...' : 'Delete user'}
              </button>
              <button
                type="button"
                onClick={closeDeleteDialog}
                disabled={Boolean(deletingUserId)}
                className="app-button rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </AppShell>
  )
}

function StatCard({ icon: Icon, label, value, tone }) {
  const toneClassMap = {
    indigo: {
      card: 'border-indigo-400/20 bg-indigo-500/10',
      label: 'text-indigo-300',
      value: 'text-slate-900 dark:text-white',
      iconWrap: 'border-indigo-400/20 bg-white/70 dark:border-white/10 dark:bg-white/10',
      icon: 'text-indigo-600 dark:text-indigo-200',
    },
    emerald: {
      card: 'border-emerald-400/20 bg-emerald-400/10',
      label: 'text-emerald-300',
      value: 'text-slate-900 dark:text-white',
      iconWrap: 'border-emerald-400/20 bg-white/70 dark:border-white/10 dark:bg-white/10',
      icon: 'text-emerald-600 dark:text-emerald-200',
    },
    amber: {
      card: 'border-amber-400/20 bg-amber-400/10',
      label: 'text-amber-300',
      value: 'text-slate-900 dark:text-white',
      iconWrap: 'border-amber-400/20 bg-white/70 dark:border-white/10 dark:bg-white/10',
      icon: 'text-amber-700 dark:text-amber-200',
    },
  }
  const toneClasses = toneClassMap[tone] || toneClassMap.indigo

  return (
    <div className={`rounded-3xl border p-4 sm:p-5 ${toneClasses.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-[11px] uppercase tracking-[0.28em] sm:text-xs ${toneClasses.label}`}>{label}</p>
          <p className={`mt-3 text-2xl font-semibold sm:text-3xl ${toneClasses.value}`}>
            {Number(value || 0).toLocaleString()}
          </p>
        </div>
        <div className={`rounded-2xl border p-3 ${toneClasses.iconWrap}`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${toneClasses.icon}`} />
        </div>
      </div>
    </div>
  )
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.details?.[0] ||
    fallback
  )
}

export default UsersPage
