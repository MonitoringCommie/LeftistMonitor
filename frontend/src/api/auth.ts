import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface User {
  id: string
  email: string
  username: string
  display_name?: string
  avatar_url?: string
  bio?: string
  role: 'viewer' | 'contributor' | 'editor' | 'moderator' | 'admin' | 'superadmin'
  is_active: boolean
  is_verified: boolean
  created_at: string
  last_login?: string
  permissions: string[]
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
  display_name?: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: User
}

// Auth store
interface AuthState {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
      isAuthenticated: () => !!get().token,
      hasPermission: (permission) => {
        const user = get().user
        return user?.permissions?.includes(permission) || false
      },
      hasRole: (role) => {
        const user = get().user
        if (!user) return false
        const roleHierarchy = ['viewer', 'contributor', 'editor', 'moderator', 'admin', 'superadmin']
        const userLevel = roleHierarchy.indexOf(user.role)
        const requiredLevel = roleHierarchy.indexOf(role)
        return userLevel >= requiredLevel
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

// Configure axios to use token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API hooks
export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await apiClient.post<TokenResponse>('/auth/login', credentials)
      return data
    },
    onSuccess: (data) => {
      setAuth(data.access_token, data.user)
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: async (registerData: RegisterData) => {
      const { data } = await apiClient.post<User>('/auth/register', registerData)
      return data
    },
  })
}

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const queryClient = useQueryClient()

  return () => {
    clearAuth()
    queryClient.clear()
  }
}

export function useCurrentUser() {
  const token = useAuthStore((state) => state.token)

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await apiClient.get<User>('/auth/me')
      return data
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Admin API hooks
export function useUsers(skip = 0, limit = 50, role?: string, search?: string) {
  return useQuery({
    queryKey: ['users', skip, limit, role, search],
    queryFn: async () => {
      const { data } = await apiClient.get<User[]>('/auth/users', {
        params: { skip, limit, role, search }
      })
      return data
    },
    staleTime: 1000 * 60, // 1 minute
  })
}

export function useUserCount() {
  return useQuery({
    queryKey: ['userCount'],
    queryFn: async () => {
      const { data } = await apiClient.get<Record<string, number>>('/auth/users/count')
      return data
    },
    staleTime: 1000 * 60,
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, role, extra_permissions, denied_permissions }: {
      userId: string
      role: string
      extra_permissions?: string[]
      denied_permissions?: string[]
    }) => {
      const { data } = await apiClient.put<User>(`/auth/users/${userId}/role`, {
        role,
        extra_permissions,
        denied_permissions,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['userCount'] })
    },
  })
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { data } = await apiClient.put(`/auth/users/${userId}/status`, null, {
        params: { is_active: isActive }
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/auth/users/${userId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['userCount'] })
    },
  })
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data } = await apiClient.get<Record<string, { name: string; permissions: string[] }>>('/auth/roles')
      return data
    },
    staleTime: Infinity, // Roles don't change
  })
}

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data } = await apiClient.get<Array<{ value: string; category: string; action: string }>>('/auth/permissions')
      return data
    },
    staleTime: Infinity,
  })
}
