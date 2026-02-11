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

// Role badge colors - using new light theme palette
const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  viewer: { bg: 'rgba(196, 30, 58, 0.08)', text: '#8B7355' },
  contributor: { bg: 'rgba(196, 30, 58, 0.08)', text: '#C41E3A' },
  editor: { bg: 'rgba(196, 30, 58, 0.1)', text: '#C41E3A' },
  moderator: { bg: 'rgba(196, 30, 58, 0.1)', text: '#E8485C' },
  admin: { bg: 'rgba(196, 30, 58, 0.12)', text: '#C41E3A' },
  superadmin: { bg: 'rgba(196, 30, 58, 0.15)', text: '#8B1A1A' },
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
    <tr style={{ borderBottom: '1px solid #E8C8C8' }} className="hover:opacity-80">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' }}>
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium" style={{ color: '#2C1810' }}>{user.display_name || user.username}</p>
            <p className="text-sm" style={{ color: '#8B7355' }}>@{user.username}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm" style={{ color: '#2C1810' }}>{user.email}</td>
      <td className="px-4 py-3">
        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: ROLE_COLORS[user.role].bg, color: ROLE_COLORS[user.role].text }}>
          {user.role}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="px-2 py-1 rounded-full text-xs" style={
          user.is_active
            ? { backgroundColor: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' }
            : { backgroundColor: 'rgba(196, 30, 58, 0.08)', color: '#8B7355' }
        }>
          {user.is_active ? 'Active' : 'Disabled'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm" style={{ color: '#8B7355' }}>
        {user.last_login
          ? new Date(user.last_login).toLocaleDateString()
          : 'Never'
        }
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(user)}
            className="px-3 py-1 text-sm rounded hover:opacity-80"
            style={{ background: 'rgba(196, 30, 58, 0.08)', color: '#C41E3A' }}
          >
            Edit
          </button>
          {!isCurrentUser && (
            <>
              <button
                onClick={() => onToggleStatus(user.id, !user.is_active)}
                className="px-3 py-1 text-sm rounded hover:opacity-80"
                style={{ background: 'rgba(196, 30, 58, 0.08)', color: '#C41E3A' }}
              >
                {user.is_active ? 'Disable' : 'Enable'}
              </button>
              <button
                onClick={() => onDelete(user.id)}
                className="px-3 py-1 text-sm rounded hover:opacity-80"
                style={{ background: 'rgba(196, 30, 58, 0.12)', color: '#8B1A1A' }}
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
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
      <div className="rounded-lg p-6 w-full max-w-md" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#2C1810' }}>Edit User: {user.username}</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#C41E3A', letterSpacing: '0.5px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as User['role'])}
              className="w-full rounded-lg px-3 py-2"
              style={{ background: '#FFF5F6', border: '1px solid #E8C8C8', color: '#2C1810' }}
            >
              {roles && Object.keys(roles).map((role) => (
                <option key={role} value={role} style={{ backgroundColor: '#FFFFFF', color: '#2C1810' }}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {roles && roles[selectedRole] && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#C41E3A', letterSpacing: '0.5px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Permissions</label>
              <div className="max-h-40 overflow-y-auto rounded-lg p-2" style={{ border: '1px solid #E8C8C8', background: 'rgba(196, 30, 58, 0.04)' }}>
                {roles[selectedRole].permissions.map((perm) => (
                  <div key={perm} className="text-xs py-0.5" style={{ color: '#8B7355' }}>
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
            className="px-4 py-2 text-sm rounded-lg hover:opacity-80"
            style={{ border: '1px solid #E8C8C8', color: '#8B7355' }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(user.id, selectedRole)}
            className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: '#C41E3A' }}
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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
      <div className="rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}>
        <div className="p-4 flex justify-between items-center" style={{ borderBottom: '1px solid #E8C8C8' }}>
          <h3 className="text-lg font-semibold" style={{ color: '#2C1810' }}>
            {item ? 'Edit' : 'Create'} {entityType.slice(0, -1)}
          </h3>
          <button onClick={onClose} className="text-2xl hover:opacity-80" style={{ color: '#C41E3A' }}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1 capitalize" style={{ color: '#C41E3A', letterSpacing: '0.5px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                {field.name.replace(/_/g, ' ')}
                {field.required && <span style={{ color: '#8B1A1A', marginLeft: '0.25rem' }}>*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg px-3 py-2"
                  style={{ background: '#FFF5F6', border: '1px solid #E8C8C8', color: '#2C1810' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.5)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E8C8C8'}
                />
              ) : field.type === 'number' ? (
                <input
                  type="number"
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value ? Number(e.target.value) : null })}
                  className="w-full rounded-lg px-3 py-2"
                  style={{ background: '#FFF5F6', border: '1px solid #E8C8C8', color: '#2C1810' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.5)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E8C8C8'}
                />
              ) : field.type === 'date' ? (
                <input
                  type="date"
                  value={formData[field.name]?.slice(0, 10) || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  className="w-full rounded-lg px-3 py-2"
                  style={{ background: '#FFF5F6', border: '1px solid #E8C8C8', color: '#2C1810' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.5)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E8C8C8'}
                />
              ) : (
                <input
                  type="text"
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  required={field.required}
                  className="w-full rounded-lg px-3 py-2"
                  style={{ background: '#FFF5F6', border: '1px solid #E8C8C8', color: '#2C1810' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.5)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E8C8C8'}
                />
              )}
            </div>
          ))}
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving} className="px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: '#C41E3A' }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg hover:opacity-80" style={{ border: '1px solid #E8C8C8', color: '#8B7355' }}>
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
    <div className="rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}>
      {message && (
        <div className="p-3 text-sm" style={message.type === 'success' ? { background: 'rgba(196, 30, 58, 0.08)', color: '#C41E3A' } : { background: 'rgba(196, 30, 58, 0.12)', color: '#8B1A1A' }}>
          {message.text}
        </div>
      )}

      <div className="p-4 flex justify-between items-center" style={{ borderBottom: '1px solid #E8C8C8' }}>
        <h2 className="text-xl font-semibold" style={{ color: '#2C1810' }}>{title}</h2>
        <div className="flex gap-2">
          <button onClick={() => { setEditItem(null); setShowModal(true) }} className="px-4 py-2 text-white rounded-lg hover:opacity-90" style={{ backgroundColor: '#C41E3A' }}>
            + Create New
          </button>
          <button onClick={fetchItems} className="px-4 py-2 text-white rounded-lg hover:opacity-90" style={{ backgroundColor: '#E8485C' }}>
            Load Data
          </button>
        </div>
      </div>

      <div className="p-4 flex gap-4" style={{ borderBottom: '1px solid #E8C8C8' }}>
        <input
          type="text"
          placeholder={`Search ${entityType}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchItems()}
          className="rounded-lg px-4 py-2 w-64"
          style={{ background: '#FFF5F6', border: '1px solid #E8C8C8', color: '#2C1810' }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.5)'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#E8C8C8'}
        />
        <button onClick={fetchItems} className="px-4 py-2 rounded-lg hover:opacity-80" style={{ border: '1px solid rgba(196, 30, 58, 0.3)', color: '#8B7355' }}>
          Search
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center" style={{ color: '#8B7355' }}>Loading...</div>
      ) : items.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: 'rgba(196, 30, 58, 0.06)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#8B7355' }}>Name/Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#8B7355' }}>Details</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#8B7355' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="hover:opacity-80" style={{ borderBottom: '1px solid #E8C8C8' }}>
                    <td className="px-4 py-3" style={{ color: '#2C1810' }}>{item.title || item.name}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#8B7355' }}>
                      {entityType === 'books' && `${item.publication_year || 'N/A'} | ${item.book_type || 'N/A'}`}
                      {entityType === 'people' && `${item.nationality || 'N/A'} | ${item.birth_year || 'N/A'}`}
                      {entityType === 'events' && `${item.start_date?.slice(0, 10) || 'N/A'} | ${item.category || 'N/A'}`}
                      {entityType === 'conflicts' && `${item.start_date?.slice(0, 10) || 'N/A'} | ${item.conflict_type || 'N/A'}`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditItem(item); setShowModal(true) }} className="px-3 py-1 text-sm rounded hover:opacity-80" style={{ background: 'rgba(196, 30, 58, 0.08)', color: '#C41E3A' }}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="px-3 py-1 text-sm rounded hover:opacity-80" style={{ background: 'rgba(196, 30, 58, 0.12)', color: '#8B1A1A' }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 flex justify-between items-center" style={{ borderTop: '1px solid #E8C8C8' }}>
            <span className="text-sm" style={{ color: '#8B7355' }}>
              Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button onClick={() => { setPage(p => Math.max(0, p - 1)); fetchItems() }} disabled={page === 0} className="px-3 py-1 rounded disabled:opacity-50" style={{ border: '1px solid rgba(196, 30, 58, 0.3)', color: '#8B7355' }}>Previous</button>
              <button onClick={() => { setPage(p => p + 1); fetchItems() }} disabled={(page + 1) * limit >= total} className="px-3 py-1 rounded disabled:opacity-50" style={{ border: '1px solid rgba(196, 30, 58, 0.3)', color: '#8B7355' }}>Next</button>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 text-center" style={{ color: '#8B7355' }}>
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
    <div className="rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}>
      <div className="p-4 flex justify-between items-center" style={{ borderBottom: '1px solid #E8C8C8' }}>
        <h2 className="text-xl font-semibold" style={{ color: '#2C1810' }}>Audit Log</h2>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 text-white rounded-lg hover:opacity-90"
          style={{ backgroundColor: '#C41E3A' }}
        >
          Load Logs
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center" style={{ color: '#8B7355' }}>Loading...</div>
      ) : logs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: 'rgba(196, 30, 58, 0.06)' }}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#8B7355' }}>Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#8B7355' }}>User</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#8B7355' }}>Action</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#8B7355' }}>Table</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #E8C8C8' }}>
                  <td className="px-4 py-3 text-sm" style={{ color: '#2C1810' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#2C1810' }}>{log.user_email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-xs" style={
                      log.action === 'CREATE' ? { background: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' } :
                      log.action === 'UPDATE' ? { background: 'rgba(196, 30, 58, 0.08)', color: '#8B7355' } :
                      { background: 'rgba(196, 30, 58, 0.12)', color: '#8B1A1A' }
                    }>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#2C1810' }}>{log.table_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center" style={{ color: '#8B7355' }}>
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
        <div className="rounded-lg p-4" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}>
          <p className="text-sm" style={{ color: '#8B7355' }}>Total Users</p>
          <p className="text-2xl font-bold" style={{ color: '#2C1810' }}>{userCounts?.total || 0}</p>
        </div>
        <div className="rounded-lg p-4" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}>
          <p className="text-sm" style={{ color: '#8B7355' }}>Superadmins</p>
          <p className="text-2xl font-bold" style={{ color: '#8B1A1A' }}>{userCounts?.superadmin || 0}</p>
        </div>
        <div className="rounded-lg p-4" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}>
          <p className="text-sm" style={{ color: '#8B7355' }}>Admins</p>
          <p className="text-2xl font-bold" style={{ color: '#C41E3A' }}>{userCounts?.admin || 0}</p>
        </div>
        <div className="rounded-lg p-4" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}>
          <p className="text-sm" style={{ color: '#8B7355' }}>Moderators</p>
          <p className="text-2xl font-bold" style={{ color: '#E8485C' }}>{userCounts?.moderator || 0}</p>
        </div>
        <div className="rounded-lg p-4" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}>
          <p className="text-sm" style={{ color: '#8B7355' }}>Editors</p>
          <p className="text-2xl font-bold" style={{ color: '#C41E3A' }}>{userCounts?.editor || 0}</p>
        </div>
        <div className="rounded-lg p-4" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}>
          <p className="text-sm" style={{ color: '#8B7355' }}>Viewers</p>
          <p className="text-2xl font-bold" style={{ color: '#E8485C' }}>{userCounts?.viewer || 0}</p>
        </div>
      </div>

      {/* User Management Section */}
      <div className="rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}>
        <div className="p-4" style={{ borderBottom: '1px solid #E8C8C8' }}>
          <h2 className="text-xl font-semibold" style={{ color: '#2C1810' }}>User Management</h2>
        </div>

        {/* Filters */}
        <div className="p-4 flex gap-4 flex-wrap" style={{ borderBottom: '1px solid #E8C8C8' }}>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg px-4 py-2 w-64"
            style={{ background: '#FFF5F6', border: '1px solid #E8C8C8', color: '#2C1810' }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.5)'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#E8C8C8'}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg px-4 py-2"
            style={{ background: '#FFF5F6', border: '1px solid #E8C8C8', color: '#2C1810' }}
          >
            <option value="" style={{ backgroundColor: '#FFFFFF', color: '#2C1810' }}>All Roles</option>
            <option value="viewer" style={{ backgroundColor: '#FFFFFF', color: '#2C1810' }}>Viewer</option>
            <option value="contributor" style={{ backgroundColor: '#FFFFFF', color: '#2C1810' }}>Contributor</option>
            <option value="editor" style={{ backgroundColor: '#FFFFFF', color: '#2C1810' }}>Editor</option>
            <option value="moderator" style={{ backgroundColor: '#FFFFFF', color: '#2C1810' }}>Moderator</option>
            <option value="admin" style={{ backgroundColor: '#FFFFFF', color: '#2C1810' }}>Admin</option>
            <option value="superadmin" style={{ backgroundColor: '#FFFFFF', color: '#2C1810' }}>Superadmin</option>
          </select>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div className="p-8 text-center" style={{ color: '#8B7355' }}>Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: 'rgba(196, 30, 58, 0.06)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#8B7355' }}>User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#8B7355' }}>Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#8B7355' }}>Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#8B7355' }}>Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#8B7355' }}>Last Login</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#8B7355' }}>Actions</th>
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
              <div className="p-8 text-center" style={{ color: '#8B7355' }}>No users found</div>
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
    <div className="min-h-screen" style={{ backgroundColor: '#FFF5F6' }}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#8B1A1A' }}>Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-lg w-fit" style={{ background: 'rgba(196, 30, 58, 0.06)', border: '1px solid #E8C8C8' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
              style={
                activeTab === tab.id
                  ? { background: '#C41E3A', color: '#fff' }
                  : { color: '#8B7355' }
              }
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
