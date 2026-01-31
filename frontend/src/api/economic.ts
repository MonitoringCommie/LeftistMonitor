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
      try {
        const { data } = await apiClient.get<GDPDataPoint[]>(
          `/geography/countries/${countryId}/economic/gdp`,
          { params: { start_year: startYear, end_year: endYear } }
        )
        return data
      } catch {
        // Return mock data if endpoint doesn't exist yet
        return generateMockGDPData(startYear || 1960, endYear || 2023)
      }
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
      try {
        const { data } = await apiClient.get<BudgetCategory[]>(
          `/geography/countries/${countryId}/economic/budget`,
          { params: { year } }
        )
        return data
      } catch {
        // Return mock data if endpoint doesn't exist yet
        return generateMockBudgetData()
      }
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
      try {
        const { data } = await apiClient.get<MilitarySpending[]>(
          `/geography/countries/${countryId}/economic/military`,
          { params: { start_year: startYear, end_year: endYear } }
        )
        return data
      } catch {
        return generateMockMilitaryData(startYear || 1990, endYear || 2023)
      }
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
      try {
        const { data } = await apiClient.get<PopulationData[]>(
          `/geography/countries/${countryId}/demographics/population`,
          { params: { start_year: startYear, end_year: endYear } }
        )
        return data
      } catch {
        return generateMockPopulationData(startYear || 1960, endYear || 2023)
      }
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
      try {
        const { data } = await apiClient.get<EconomicOverview>(
          `/geography/countries/${countryId}/economic/overview`
        )
        return data
      } catch {
        return {
          gdp_current: Math.random() * 1e12,
          gdp_per_capita: Math.random() * 50000,
          gdp_growth: (Math.random() - 0.3) * 10,
          inflation: Math.random() * 10,
          unemployment: Math.random() * 15,
          year: 2023
        }
      }
    },
    enabled: !!countryId,
    ...defaultQueryOptions,
  })
}

// Mock data generators for development
function generateMockGDPData(startYear: number, endYear: number): GDPDataPoint[] {
  const data: GDPDataPoint[] = []
  let gdp = 1e9 * (1 + Math.random() * 10)
  
  for (let year = startYear; year <= endYear; year++) {
    const growth = (Math.random() - 0.2) * 0.1
    gdp = gdp * (1 + growth)
    data.push({
      year,
      gdp: Math.round(gdp),
      gdp_per_capita: Math.round(gdp / (10e6 + Math.random() * 100e6)),
      growth_rate: Math.round(growth * 1000) / 10
    })
  }
  return data
}

function generateMockBudgetData(): BudgetCategory[] {
  return [
    { name: 'Military/Defense', value: 150e9, color: '#ef4444' },
    { name: 'Education', value: 120e9, color: '#3b82f6' },
    { name: 'Healthcare', value: 200e9, color: '#22c55e' },
    { name: 'Infrastructure', value: 80e9, color: '#f59e0b' },
    { name: 'Social Services', value: 180e9, color: '#8b5cf6' },
    { name: 'Administration', value: 50e9, color: '#ec4899' },
    { name: 'Debt Service', value: 100e9, color: '#6366f1' },
    { name: 'Other', value: 70e9, color: '#14b8a6' },
  ]
}

function generateMockMilitaryData(startYear: number, endYear: number): MilitarySpending[] {
  const data: MilitarySpending[] = []
  let spending = 10e9 * (1 + Math.random() * 5)
  
  for (let year = startYear; year <= endYear; year++) {
    spending = spending * (1 + (Math.random() - 0.3) * 0.1)
    data.push({
      year,
      spending: Math.round(spending),
      gdp_percent: 2 + Math.random() * 3,
      personnel: Math.round(100000 + Math.random() * 500000)
    })
  }
  return data
}

function generateMockPopulationData(startYear: number, endYear: number): PopulationData[] {
  const data: PopulationData[] = []
  let pop = 10e6 * (1 + Math.random() * 10)
  let urbanRatio = 0.3 + Math.random() * 0.2
  
  for (let year = startYear; year <= endYear; year++) {
    const growth = 0.01 + Math.random() * 0.02
    pop = pop * (1 + growth)
    urbanRatio = Math.min(0.9, urbanRatio + 0.005)
    
    data.push({
      year,
      population: Math.round(pop),
      urban_population: Math.round(pop * urbanRatio),
      rural_population: Math.round(pop * (1 - urbanRatio)),
      growth_rate: Math.round(growth * 1000) / 10
    })
  }
  return data
}
