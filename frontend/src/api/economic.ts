import { useQuery } from '@tanstack/react-query'
import { apiClient, defaultQueryOptions } from './client'

export interface GDPDataPoint {
  year: number
  gdp: number
  gdp_per_capita?: number
  growth_rate?: number
}

export interface BudgetCategory {
  name: string
  value: number
  percent?: number
  color?: string
}

export interface MilitarySpending {
  year: number
  spending: number
  gdp_percent?: number
  personnel?: number
}

export interface PopulationData {
  year: number
  population: number
  urban_population?: number
  rural_population?: number
  growth_rate?: number
}

export interface EconomicOverview {
  gdp_current?: number
  gdp_per_capita?: number
  gdp_growth?: number
  inflation?: number
  unemployment?: number
  debt_to_gdp?: number
  trade_balance?: number
  currency?: string
  year?: number
}

export function useGDPHistory(countryId: string, startYear?: number, endYear?: number) {
  return useQuery({
    queryKey: ['gdp-history', countryId, startYear, endYear],
    queryFn: async () => {
      const { data } = await apiClient.get<GDPDataPoint[]>(
        `/geography/countries/${countryId}/economic/gdp`,
        { params: { start_year: startYear, end_year: endYear } }
      )
      return data
    },
    enabled: !!countryId,
    ...defaultQueryOptions,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

export function useBudgetBreakdown(countryId: string, year?: number) {
  return useQuery({
    queryKey: ['budget', countryId, year],
    queryFn: async () => {
      const { data } = await apiClient.get<BudgetCategory[]>(
        `/geography/countries/${countryId}/economic/budget`,
        { params: { year } }
      )
      return data
    },
    enabled: !!countryId,
    ...defaultQueryOptions,
    staleTime: 1000 * 60 * 60,
  })
}

export function useMilitarySpending(countryId: string, startYear?: number, endYear?: number) {
  return useQuery({
    queryKey: ['military-spending', countryId, startYear, endYear],
    queryFn: async () => {
      const { data } = await apiClient.get<MilitarySpending[]>(
        `/geography/countries/${countryId}/economic/military`,
        { params: { start_year: startYear, end_year: endYear } }
      )
      return data
    },
    enabled: !!countryId,
    ...defaultQueryOptions,
    staleTime: 1000 * 60 * 60,
  })
}

export function usePopulationHistory(countryId: string, startYear?: number, endYear?: number) {
  return useQuery({
    queryKey: ['population-history', countryId, startYear, endYear],
    queryFn: async () => {
      const { data } = await apiClient.get<PopulationData[]>(
        `/geography/countries/${countryId}/demographics/population`,
        { params: { start_year: startYear, end_year: endYear } }
      )
      return data
    },
    enabled: !!countryId,
    ...defaultQueryOptions,
    staleTime: 1000 * 60 * 60,
  })
}

export function useEconomicOverview(countryId: string) {
  return useQuery({
    queryKey: ['economic-overview', countryId],
    queryFn: async () => {
      const { data } = await apiClient.get<EconomicOverview>(
        `/geography/countries/${countryId}/economic/overview`
      )
      return data
    },
    enabled: !!countryId,
    ...defaultQueryOptions,
  })
}
