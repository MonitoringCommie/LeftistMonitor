import { apiClient } from './client'

export interface ConflictParticipant {
  country_id: string | null
  name: string
  side: string | null
}

export interface ConflictMapItem {
  id: string
  name: string
  start_date: string | null
  end_date: string | null
  conflict_type: string | null
  intensity: string | null
  countries: ConflictParticipant[]
  lat: number | null
  lng: number | null
}

export async function getActiveConflicts(year?: number): Promise<ConflictMapItem[]> {
  const params = year ? { year } : {}
  const response = await apiClient.get<ConflictMapItem[]>('/conflicts/active', { params })
  return response.data
}

export async function getAllConflicts(): Promise<ConflictMapItem[]> {
  const response = await apiClient.get<ConflictMapItem[]>('/conflicts/all')
  return response.data
}
