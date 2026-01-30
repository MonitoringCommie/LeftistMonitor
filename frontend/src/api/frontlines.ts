import { apiClient } from './client'

export interface ConflictWithFrontlines {
  id: string
  name: string
  start_date: string | null
  end_date: string | null
  conflict_type: string
  first_frontline_date: string | null
  last_frontline_date: string | null
  frontline_dates_count: number
}

export interface FrontlineDate {
  date: string
  sides: string[]
}

export interface FrontlineFeature {
  type: 'Feature'
  properties: {
    id: string
    conflict_id: string
    conflict_name: string
    date: string
    controlled_by: string
    geometry_type: string
    color: string | null
    notes: string | null
    source: string | null
  }
  geometry: any
}

export interface FrontlineGeoJSON {
  type: 'FeatureCollection'
  features: FrontlineFeature[]
}

export interface FrontlineTimeline {
  conflict: {
    id: string
    name: string
    start_date: string | null
    end_date: string | null
  }
  timeline: Array<{
    date: string
    sides: string[]
    notes: string | null
  }>
}

export async function getConflictsWithFrontlines(): Promise<ConflictWithFrontlines[]> {
  const response = await apiClient.get<ConflictWithFrontlines[]>('/frontlines/conflicts-with-frontlines')
  return response.data
}

export async function getFrontlineDates(conflictId: string): Promise<FrontlineDate[]> {
  const response = await apiClient.get<FrontlineDate[]>(`/frontlines/${conflictId}/dates`)
  return response.data
}

export async function getFrontlineGeoJSON(conflictId: string, date?: string): Promise<FrontlineGeoJSON> {
  const params = date ? { target_date: date } : {}
  const response = await apiClient.get<FrontlineGeoJSON>(`/frontlines/${conflictId}/geojson`, { params })
  return response.data
}

export async function getFrontlineTimeline(conflictId: string): Promise<FrontlineTimeline> {
  const response = await apiClient.get<FrontlineTimeline>(`/frontlines/${conflictId}/timeline`)
  return response.data
}
