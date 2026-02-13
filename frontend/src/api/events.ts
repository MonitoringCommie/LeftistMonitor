import { useQuery } from '@tanstack/react-query'
import { apiClient } from './client'
import type {
  EventListItem,
  Event,
  ConflictListItem,
  Conflict,
  TimelineEvent,
  PaginatedResponse,
} from '../types'

export function useEvents(countryId: string, year?: number, category?: string) {
  return useQuery({
    queryKey: ['events', countryId, year, category],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<EventListItem>>(
        `/events/countries/${countryId}/events`,
        { params: { year, category, per_page: 100 } }
      )
      return data
    },
    enabled: !!countryId,
    staleTime: 1000 * 60 * 10, // 10 minutes - events don't change often
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  })
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const { data } = await apiClient.get<Event>(`/events/events/${eventId}`)
      return data
    },
    enabled: !!eventId,
    staleTime: 1000 * 60 * 60, // 1 hour - single event data is static
    gcTime: 1000 * 60 * 60,
  })
}

export function useConflicts(countryId: string, year?: number) {
  return useQuery({
    queryKey: ['conflicts', countryId, year],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<ConflictListItem>>(
        `/events/countries/${countryId}/conflicts`,
        { params: { year, per_page: 100 } }
      )
      return data
    },
    enabled: !!countryId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30,
  })
}

export function useConflict(conflictId: string) {
  return useQuery({
    queryKey: ['conflict', conflictId],
    queryFn: async () => {
      const { data } = await apiClient.get<Conflict>(`/events/conflict/${conflictId}`)
      return data
    },
    enabled: !!conflictId,
    staleTime: 1000 * 60 * 60, // 1 hour - conflict details are static
    gcTime: 1000 * 60 * 60,
  })
}

export function useConflictCoordinates(conflictId: string) {
  return useQuery({
    queryKey: ['conflict-coordinates', conflictId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/conflicts/${conflictId}/coordinates`)
      return data as {
        conflict_id: string
        conflict_name: string
        center_lat: number | null
        center_lng: number | null
        cities: { name: string; country: string; lat: number; lng: number }[]
        city_count: number
      }
    },
    enabled: !!conflictId,
    staleTime: Infinity,
  })
}

export function useTimeline(countryId: string, startYear: number, endYear: number) {
  return useQuery({
    queryKey: ['timeline', countryId, startYear, endYear],
    queryFn: async () => {
      const { data } = await apiClient.get<TimelineEvent[]>(
        `/events/countries/${countryId}/timeline`,
        { params: { start_year: startYear, end_year: endYear } }
      )
      return data
    },
    enabled: !!countryId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60,
  })
}

export function useGlobalEventsByYear(year: number) {
  return useQuery({
    queryKey: ['globalEvents', year],
    queryFn: async () => {
      const { data } = await apiClient.get<EventListItem[]>(
        `/events/global/year/${year}`,
        { params: { limit: 10 } }
      )
      return data
    },
    enabled: !!year && year >= 1900,
    staleTime: 1000 * 60 * 60, // 1 hour - historical data doesn't change
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    placeholderData: (previousData) => previousData, // Keep showing old data while fetching new
  })
}
