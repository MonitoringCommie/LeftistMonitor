import axios, { AxiosError, AxiosResponse } from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

// Custom error class for API errors
export class ApiError extends Error {
  public status: number
  public code?: string
  public details?: unknown

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging and request ID
apiClient.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: Date.now() }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (import.meta.env.DEV && response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime
      if (duration > 1000) {
        console.warn(`Slow API request: ${response.config.url} took ${duration}ms`)
      }
    }
    return response
  },
  (error: AxiosError<{ detail?: string; message?: string }>) => {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        throw new ApiError('Request timeout - please try again', 408, 'TIMEOUT')
      }
      throw new ApiError('Network error - please check your connection', 0, 'NETWORK_ERROR')
    }

    const status = error.response.status
    const message = error.response.data?.detail || error.response.data?.message || error.message

    if (import.meta.env.DEV) {
      console.error('API Error:', {
        status,
        url: error.config?.url,
        message,
        data: error.response.data,
      })
    }

    throw new ApiError(message, status, undefined, error.response.data)
  }
)

// Shared query options for React Query
export const defaultQueryOptions = {
  retry: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  staleTime: 1000 * 60 * 5, // 5 minutes default
  gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
}

// Options for static/rarely changing data
export const staticQueryOptions = {
  ...defaultQueryOptions,
  staleTime: Infinity,
  gcTime: Infinity,
}

// Options for frequently updated data
export const liveQueryOptions = {
  ...defaultQueryOptions,
  staleTime: 1000 * 30, // 30 seconds
  gcTime: 1000 * 60 * 5, // 5 minutes
}

// Extend axios config type to include metadata
declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: {
      startTime: number
    }
  }
}
