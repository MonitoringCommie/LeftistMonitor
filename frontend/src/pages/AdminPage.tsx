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
  viewer: 'bg-gray-100 text-gray-700',
  contributor: 'bg-blue-100 text-blue-700',
  editor: 'bg-green-100 text-green-700',
  moderator: 'bg-yellow-100 text-yellow-700',
  admin: 'bg-purple-100 text-purple-700',
  superadmin: 'bg-red-100 text-red-700',
}

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
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium">{user.display_name || user.username}</p>
            <p className="text-sm text-gray-500">@{user.username}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm">{user.email}</td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
          {user.role}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs ${
          user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {user.is_active ? 'Active' : 'Disabled'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {user.last_login 
          ? new Date(user.last_login).toLocaleDateString()
          : 'Never'
        }
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(user)}
            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
          >
            Edit
          </button>
          {!isCurrentUser && (
            <>
              <button
                onClick={() => onToggleStatus(user.id, !user.is_active)}
                className={`px-3 py-1 text-sm rounded ${
                  user.is_active
                    ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                {user.is_active ? 'Disable' : 'Enable'}
              </button>
              <button
                onClick={() => onDelete(user.id)}
                className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
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
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Edit User: {user.username}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as User['role'])}
              className="w-full border rounded-lg px-3 py-2"
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
              <label className="block text-sm font-medium mb-1">Permissions</label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
                {roles[selectedRole].permissions.map((perm) => (
                  <div key={perm} className="text-xs text-gray-600 py-0.5">
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
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
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

export default function AdminPage() {
  const { user: currentUser, hasRole } = useAuthStore()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const { data: users, isLoading } = useUsers(0, 100, roleFilter || undefined, search || undefined)
  const { data: userCounts } = useUserCount()
  const updateRole = useUpdateUserRole()
  const toggleStatus = useToggleUserStatus()
  const deleteUser = useDeleteUser()

  // Require admin role
  if (!hasRole('admin')) {
    return <Navigate to="/" replace />
  }

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold">{userCounts?.total || 0}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Superadmins</p>
            <p className="text-2xl font-bold text-red-600">{userCounts?.superadmin || 0}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Admins</p>
            <p className="text-2xl font-bold text-purple-600">{userCounts?.admin || 0}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Moderators</p>
            <p className="text-2xl font-bold text-yellow-600">{userCounts?.moderator || 0}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Editors</p>
            <p className="text-2xl font-bold text-green-600">{userCounts?.editor || 0}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Viewers</p>
            <p className="text-2xl font-bold text-gray-600">{userCounts?.viewer || 0}</p>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">User Management</h2>
          </div>

          {/* Filters */}
          <div className="p-4 border-b flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 w-64"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border rounded-lg px-4 py-2"
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
            <div className="p-8 text-center text-gray-500">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Last Login</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
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
                <div className="p-8 text-center text-gray-500">No users found</div>
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
      </div>
    </div>
  )
}
