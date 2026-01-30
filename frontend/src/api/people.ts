import { useQuery } from '@tanstack/react-query'
import { apiClient, defaultQueryOptions } from './client'
import type {
  PersonListItem,
  Person,
  BookListItem,
  Book,
  ConnectionGraph,
  PaginatedResponse,
} from '../types'

export function usePeople(countryId: string, year?: number, personType?: string) {
  return useQuery({
    queryKey: ['people', countryId, year, personType],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<PersonListItem>>(
        `/people/countries/${countryId}/people`,
        { params: { year, person_type: personType, per_page: 100 } }
      )
      return data
    },
    enabled: !!countryId,
    ...defaultQueryOptions,
    staleTime: 1000 * 60 * 15, // 15 minutes
  })
}

export function usePerson(personId: string) {
  return useQuery({
    queryKey: ['person', personId],
    queryFn: async () => {
      const { data } = await apiClient.get<Person>(`/people/people/${personId}`)
      return data
    },
    enabled: !!personId,
    ...defaultQueryOptions,
    staleTime: 1000 * 60 * 60, // 1 hour - person details are static
  })
}

export function usePersonConnections(personId: string, depth: number = 2) {
  return useQuery({
    queryKey: ['personConnections', personId, depth],
    queryFn: async () => {
      const { data } = await apiClient.get<ConnectionGraph>(
        `/people/people/${personId}/connections`,
        { params: { depth } }
      )
      return data
    },
    enabled: !!personId,
    ...defaultQueryOptions,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function useBooks(countryId: string, bookType?: string) {
  return useQuery({
    queryKey: ['books', countryId, bookType],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<BookListItem>>(
        `/people/countries/${countryId}/books`,
        { params: { book_type: bookType, per_page: 100 } }
      )
      return data
    },
    enabled: !!countryId,
    ...defaultQueryOptions,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function useBook(bookId: string) {
  return useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      const { data } = await apiClient.get<Book>(`/people/books/${bookId}`)
      return data
    },
    enabled: !!bookId,
    ...defaultQueryOptions,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}
