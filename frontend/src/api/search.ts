import { apiClient } from './client'

export interface SearchResult {
  id: string
  type: 'person' | 'event' | 'conflict' | 'book' | 'country'
  title: string
  subtitle: string | null
  year: number | null
}

export interface SearchResponse {
  query: string
  total: number
  results: SearchResult[]
}

export async function globalSearch(
  query: string,
  types?: string[],
  limit: number = 20
): Promise<SearchResponse> {
  const params: Record<string, any> = { q: query, limit }
  if (types && types.length > 0) {
    params.types = types.join(',')
  }
  const response = await apiClient.get<SearchResponse>('/search/', { params })
  return response.data
}
