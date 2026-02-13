import { useQuery } from '@tanstack/react-query'
import { apiClient, staticQueryOptions } from './client'

export interface BrowseCategory {
  label: string
  value: string
  count?: number
}

export function useConflictTypes() {
  return useQuery({
    queryKey: ['conflict-types'],
    queryFn: async () => {
      const { data } = await apiClient.get<BrowseCategory[]>('/events/conflict-types')
      return data
    },
    ...staticQueryOptions,
  })
}

export function useBookTypes() {
  return useQuery({
    queryKey: ['book-types'],
    queryFn: async () => {
      const { data } = await apiClient.get<BrowseCategory[]>('/books/types')
      return data
    },
    ...staticQueryOptions,
  })
}

export function useBookTopics() {
  return useQuery({
    queryKey: ['book-topics'],
    queryFn: async () => {
      const { data } = await apiClient.get<BrowseCategory[]>('/books/topics')
      return data
    },
    ...staticQueryOptions,
  })
}

export function usePartyFamilies() {
  return useQuery({
    queryKey: ['party-families'],
    queryFn: async () => {
      const { data } = await apiClient.get<BrowseCategory[]>('/politics/party-families')
      return data
    },
    ...staticQueryOptions,
  })
}
