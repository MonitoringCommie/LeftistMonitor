import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { apiClient, defaultQueryOptions, staticQueryOptions } from './client'
import type {
  Country,
  CountryListItem,
  GeoJSONFeatureCollection,
  PaginatedResponse
} from '../types'

// Fetch all borders once for client-side filtering
export function useAllBordersGeoJSON() {
  return useQuery({
    queryKey: ['borders', 'all'],
    queryFn: async () => {
      const { data } = await apiClient.get<GeoJSONFeatureCollection>(
        '/geography/borders/all',
        { params: { simplify: 0.01 } }
      )
      return data
    },
    ...staticQueryOptions,
  })
}

// Legacy endpoint - kept for compatibility
export function useBordersGeoJSON(year: number) {
  return useQuery({
    queryKey: ['borders', 'geojson', year],
    queryFn: async () => {
      const { data } = await apiClient.get<GeoJSONFeatureCollection>(
        '/geography/borders/geojson',
        { params: { year, simplify: 0.01 } }
      )
      return data
    },
    ...defaultQueryOptions,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

export function useCountries(params?: {
  year?: number
  search?: string
  page?: number
  per_page?: number
}) {
  return useQuery({
    queryKey: ['countries', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<CountryListItem>>(
        '/geography/countries',
        { params }
      )
      return data
    },
    ...defaultQueryOptions,
  })
}

export function useCountry(id: string) {
  return useQuery({
    queryKey: ['country', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Country>(`/geography/countries/${id}`)
      return data
    },
    enabled: !!id,
    ...defaultQueryOptions,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function useCountryBorder(countryId: string, year: number) {
  return useQuery({
    queryKey: ['country', countryId, 'border', year],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/geography/countries/${countryId}/borders`,
        { params: { year } }
      )
      return data
    },
    enabled: !!countryId,
    ...defaultQueryOptions,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

export interface CountryRelationship {
  id: string
  country_a_id: string
  country_a_name: string
  country_a_lat?: number
  country_a_lng?: number
  country_b_id: string
  country_b_name: string
  country_b_lat?: number
  country_b_lng?: number
  relationship_type: string
  relationship_nature: string
  name?: string
  description?: string
  valid_from: string
  valid_to?: string
}

export function useCountryRelationships(year: number, relationshipType?: string) {
  return useQuery({
    queryKey: ['countryRelationships', year, relationshipType],
    queryFn: async () => {
      const { data } = await apiClient.get<CountryRelationship[]>(
        '/geography/relationships',
        { params: { year, relationship_type: relationshipType } }
      )
      return data
    },
    enabled: !!year,
    ...defaultQueryOptions,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

// Prefetch borders on app load for smoother experience
export function usePrefetchBorders() {
  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['borders', 'all'],
      queryFn: async () => {
        const { data } = await apiClient.get<GeoJSONFeatureCollection>(
          '/geography/borders/all',
          { params: { simplify: 0.01 } }
        )
        return data
      },
      ...staticQueryOptions,
    })
  }, [queryClient])
}
