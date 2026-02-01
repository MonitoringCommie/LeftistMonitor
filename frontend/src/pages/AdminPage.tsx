import { useState, memo } from 'react'
import { Navigate } from 'react-router-dom'
import {
  useAuthStore,
  useUsers,
  useUserCount,
  useUpdateUserRole,
  useToggleUserStatus,
  useDeleteUser,
  useRoles,
  User
} from '../api/auth'

// Role badge colors
const ROLE_COLORS: Record<string, string> = {
  viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  contributor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  editor: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  moderator: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  superadmin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

type AdminTab = 'users' | 'books' | 'people' | 'events' | 'conflicts' | 'audit'

// User row component
const UserRow = memo(function UserRow({
  user,
  onEdit,
  onToggleStatus,
  onDelete,
  currentUserId,
}: {
  user: User
  onEdit: (user: User) => void
  onToggleStatus: (userId: string, isActive: boolean) => void
  onDelete: (userId: string) => void
  currentUserId?: string
}) {
  const isCurrentUser = user.id === currentUserId

  return (
    <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm font-medium">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium dark:text-white">{user.display_name || user.username}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm dark:text-gray-300">{user.email}</td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
          {user.role}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs ${
          user.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
        }`}>
          {user.is_active ? 'Active' : 'Disabled'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
        {user.last_login
          ? new Date(user.last_login).toLocaleDateString()
          : 'Never'
        }
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(user)}
            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
          >
            Edit
          </button>
          {!isCurrentUser && (
            <>
              <button
                onClick={() => onToggleStatus(user.id, !user.is_active)}
                className={`px-3 py-1 text-sm rounded ${
                  user.is_active
                    ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
                    : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900 dark:text-green-300'
                }`}
              >
                {user.is_active ? 'Disable' : 'Enable'}
              </button>
              <button
                onClick={() => onDelete(user.id)}
                className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 dark:bg-red-900 dark:text-red-300"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
})

// Edit user modal
function EditUserModal({
  user,
  onClose,
  onSave,
}: {
  user: User
  onClose: () => void
  onSave: (userId: string, role: string) => void
}) {
  const [selectedRole, setSelectedRole] = useState(user.role)
  const { data: roles } = useRoles()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Edit User: {user.username}</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as User['role'])}
              className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
            >
              {roles && Object.keys(roles).map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {roles && roles[selectedRole] && (
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Permissions</label>
              <div className="max-h-40 overflow-y-auto border dark:border-gray-600 rounded-lg p-2">
                {roles[selectedRole].permissions.map((perm) => (
                  <div key={perm} className="text-xs text-gray-600 dark:text-gray-400 py-0.5">
                    {perm}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(user.id, selectedRole)}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

// Entity form fields configuration
const ENTITY_FIELDS: Record<string, { name: string; type: string; required?: boolean }[]> = {
  books: [
    { name: 'title', type: 'text', required: true },
    { name: 'author', type: 'text' },
    { name: 'publication_year', type: 'number' },
    { name: 'book_type', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'topics', type: 'text' },
  ],
  people: [
    { name: 'name', type: 'text', required: true },
    { name: 'nationality', type: 'text' },
    { name: 'birth_year', type: 'number' },
    { name: 'death_year', type: 'number' },
    { name: 'description', type: 'textarea' },
  ],
  events: [
    { name: 'name', type: 'text', required: true },
    { name: 'start_date', type: 'date' },
    { name: 'end_date', type: 'date' },
    { name: 'category', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'location', type: 'text' },
  ],
  conflicts: [
    { name: 'name', type: 'text', required: true },
    { name: 'start_date', type: 'date' },
    { name: 'end_date', type: 'date' },
    { name: 'conflict_type', type: 'text' },
    { name: 'description', type: 'textarea' },
  ],
}

// Edit/Create Modal
function EntityModal({
  entityType,
  item,
  onClose,
  onSave,
}: {
  entityType: string
  item: any | null
  onClose: () => void
  onSave: (data: any) => void
}) {
  const [formData, setFormData] = useState<any>(item || {})
  const [saving, setSaving] = useState(false)
  const fields = ENTITY_FIELDS[entityType] || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave(formData)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold dark:text-white">
            {item ? 'Edit' : 'Create'} {entityType.slice(0, -1)}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300 capitalize">
                {field.name.replace(/_/g, ' ')}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  rows={3}
                  className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                />
              ) : field.type === 'number' ? (
                <input
                  type="number"
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value ? Number(e.target.value) : null })}
                  className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                />
              ) : field.type === 'date' ? (
                <input
                  type="date"
                  value={formData[field.name]?.slice(0, 10) || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <input
                  type="text"
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  required={field.required}
                  className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                />
              )}
            </div>
          ))}
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Data management panel (generic for books, people, events, conflicts)
function DataManagementPanel({
  entityType,
  title
}: {
  entityType: 'books' | 'people' | 'events' | 'conflicts'
  title: string
}) {
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [editItem, setEditItem] = useState<any | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const limit = 20
  const { token } = useAuthStore()

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ skip: String(page * limit), limit: String(limit) })
      if (search) params.append('search', search)
      const res = await fetch(`/api/v1/admin/${entityType}?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
        setTotal(data.total || 0)
      }
    } catch (err) {
      console.error('Failed to fetch', err)
    }
    setLoading(false)
  }

  const handleSave = async (data: any) => {
    try {
      const isUpdate = !!data.id
      const url = isUpdate ? `/api/v1/admin/${entityType}/${data.id}` : `/api/v1/admin/${entityType}`
      const res = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        setMessage({ type: 'success', text: `${isUpdate ? 'Updated' : 'Created'} successfully!` })
        setShowModal(false)
        setEditItem(null)
        fetchItems()
        setTimeout(() => setMessage(null), 3000)
      } else {
        const err = await res.json()
        setMessage({ type: 'error', text: err.detail || 'Failed to save' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    try {
      const res = await fetch(`/api/v1/admin/${entityType}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setMessage({ type: 'success', text: 'Deleted successfully!' })
        fetchItems()
        setTimeout(() => setMessage(null), 3000)
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete' })
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
      {message && (
        <div className={`p-3 text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
          {message.text}
        </div>
      )}
      
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold dark:text-white">{title}</h2>
        <div className="flex gap-2">
          <button onClick={() => { setEditItem(null); setShowModal(true) }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            + Create New
          </button>
          <button onClick={fetchItems} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Load Data
          </button>
        </div>
      </div>

      <div className="p-4 border-b dark:border-gray-700 flex gap-4">
        <input
          type="text"
          placeholder={`Search ${entityType}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchItems()}
          className="border dark:border-gray-600 rounded-lg px-4 py-2 w-64 dark:bg-gray-700 dark:text-white"
        />
        <button onClick={fetchItems} className="px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300">
          Search
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>
      ) : items.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Name/Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Details</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 dark:text-white">{item.title || item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {entityType === 'books' && `${item.publication_year || 'N/A'} | ${item.book_type || 'N/A'}`}
                      {entityType === 'people' && `${item.nationality || 'N/A'} | ${item.birth_year || 'N/A'}`}
                      {entityType === 'events' && `${item.start_date?.slice(0, 10) || 'N/A'} | ${item.category || 'N/A'}`}
                      {entityType === 'conflicts' && `${item.start_date?.slice(0, 10) || 'N/A'} | ${item.conflict_type || 'N/A'}`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditItem(item); setShowModal(true) }} className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 dark:bg-red-900 dark:text-red-300">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 flex justify-between items-center border-t dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button onClick={() => { setPage(p => Math.max(0, p - 1)); fetchItems() }} disabled={page === 0} className="px-3 py-1 border dark:border-gray-600 rounded disabled:opacity-50 dark:text-gray-300">Previous</button>
              <button onClick={() => { setPage(p => p + 1); fetchItems() }} disabled={(page + 1) * limit >= total} className="px-3 py-1 border dark:border-gray-600 rounded disabled:opacity-50 dark:text-gray-300">Next</button>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          Click "Load Data" to fetch {entityType}
        </div>
      )}

      {showModal && (
        <EntityModal
          entityType={entityType}
          item={editItem}
          onClose={() => { setShowModal(false); setEditItem(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
// Audit log panel
function AuditLogPanel() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { token } = useAuthStore()

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/admin/audit-log?limit=50', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setLogs(data.items || [])
      }
    } catch (err) {
      console.error('Failed to fetch audit log', err)
    }
    setLoading(false)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold dark:text-white">Audit Log</h2>
        <button 
          onClick={fetchLogs}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Load Logs
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>
      ) : logs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Action</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Table</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b dark:border-gray-700">
                  <td className="px-4 py-3 text-sm dark:text-gray-300">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm dark:text-gray-300">{log.user_email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      log.action === 'CREATE' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm dark:text-gray-300">{log.table_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          Click "Load Logs" to fetch audit history
        </div>
      )}
    </div>
  )
}

// Users panel
function UsersPanel() {
  const { user: currentUser } = useAuthStore()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const { data: users, isLoading } = useUsers(0, 100, roleFilter || undefined, search || undefined)
  const { data: userCounts } = useUserCount()
  const updateRole = useUpdateUserRole()
  const toggleStatus = useToggleUserStatus()
  const deleteUser = useDeleteUser()

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    if (confirm(`Are you sure you want to ${isActive ? 'enable' : 'disable'} this user?`)) {
      toggleStatus.mutate({ userId, isActive })
    }
  }

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUser.mutate(userId)
    }
  }

  const handleSaveRole = async (userId: string, role: string) => {
    updateRole.mutate({ userId, role })
    setEditingUser(null)
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
          <p className="text-2xl font-bold dark:text-white">{userCounts?.total || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Superadmins</p>
          <p className="text-2xl font-bold text-red-600">{userCounts?.superadmin || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Admins</p>
          <p className="text-2xl font-bold text-purple-600">{userCounts?.admin || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Moderators</p>
          <p className="text-2xl font-bold text-yellow-600">{userCounts?.moderator || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Editors</p>
          <p className="text-2xl font-bold text-green-600">{userCounts?.editor || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Viewers</p>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">{userCounts?.viewer || 0}</p>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">User Management</h2>
        </div>

        {/* Filters */}
        <div className="p-4 border-b dark:border-gray-700 flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border dark:border-gray-600 rounded-lg px-4 py-2 w-64 dark:bg-gray-700 dark:text-white"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border dark:border-gray-600 rounded-lg px-4 py-2 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Roles</option>
            <option value="viewer">Viewer</option>
            <option value="contributor">Contributor</option>
            <option value="editor">Editor</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Last Login</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onEdit={setEditingUser}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                    currentUserId={currentUser?.id}
                  />
                ))}
              </tbody>
            </table>
            {users?.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">No users found</div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveRole}
        />
      )}
    </>
  )
}

export default function AdminPage() {
  const { hasRole } = useAuthStore()
  const [activeTab, setActiveTab] = useState<AdminTab>('users')

  // Require admin role
  if (!hasRole('admin')) {
    return <Navigate to="/" replace />
  }

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'users', label: 'Users' },
    { id: 'books', label: 'Books' },
    { id: 'people', label: 'People' },
    { id: 'events', label: 'Events' },
    { id: 'conflicts', label: 'Conflicts' },
    { id: 'audit', label: 'Audit Log' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && <UsersPanel />}
        {activeTab === 'books' && <DataManagementPanel entityType="books" title="Books Management" />}
        {activeTab === 'people' && <DataManagementPanel entityType="people" title="People Management" />}
        {activeTab === 'events' && <DataManagementPanel entityType="events" title="Events Management" />}
        {activeTab === 'conflicts' && <DataManagementPanel entityType="conflicts" title="Conflicts Management" />}
        {activeTab === 'audit' && <AuditLogPanel />}
      </div>
    </div>
  )
}
