import { useQuery } from '@tanstack/react-query'
import { apiClient, defaultQueryOptions, staticQueryOptions } from './client'
import type {
  PartyListItem,
  Party,
  ElectionListItem,
  Election,
  Ideology,
  PaginatedResponse,
} from '../types'

export function useParties(countryId: string, year?: number) {
  return useQuery({
    queryKey: ['parties', countryId, year],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<PartyListItem>>(
        `/politics/countries/${countryId}/parties`,
        { params: { year, per_page: 100 } }
      )
      return data
    },
    enabled: !!countryId,
    ...defaultQueryOptions,
    staleTime: 1000 * 60 * 10, // 10 minutes - party data rarely changes
  })
}

export function useParty(partyId: string) {
  return useQuery({
    queryKey: ['party', partyId],
    queryFn: async () => {
      const { data } = await apiClient.get<Party>(`/politics/parties/${partyId}`)
      return data
    },
    enabled: !!partyId,
    ...defaultQueryOptions,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function useElections(countryId: string, electionType?: string) {
  return useQuery({
    queryKey: ['elections', countryId, electionType],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<ElectionListItem>>(
        `/politics/countries/${countryId}/elections`,
        { params: { election_type: electionType, per_page: 100 } }
      )
      return data
    },
    enabled: !!countryId,
    ...defaultQueryOptions,
    staleTime: 1000 * 60 * 30, // 30 minutes - historical data
  })
}

export function useElection(electionId: string) {
  return useQuery({
    queryKey: ['election', electionId],
    queryFn: async () => {
      const { data } = await apiClient.get<Election>(`/politics/elections/${electionId}`)
      return data
    },
    enabled: !!electionId,
    ...defaultQueryOptions,
    staleTime: 1000 * 60 * 60, // 1 hour - election details are static
  })
}

export function useIdeologies() {
  return useQuery({
    queryKey: ['ideologies'],
    queryFn: async () => {
      const { data } = await apiClient.get<Ideology[]>('/politics/ideologies')
      return data
    },
    ...staticQueryOptions,
  })
}

export interface VotingTrendParty {
  party_id: string
  party_name: string
  party_short?: string
  party_family?: string
  left_right?: number
  vote_share: number
  seats?: number
}

export interface VotingTrendItem {
  date: string
  year: number
  parties: VotingTrendParty[]
}

export function useVotingTrends(countryId: string, electionType = 'parliament') {
  return useQuery({
    queryKey: ['voting-trends', countryId, electionType],
    queryFn: async () => {
      const { data } = await apiClient.get<VotingTrendItem[]>(
        `/politics/countries/${countryId}/voting-trends`,
        { params: { election_type: electionType, limit: 20 } }
      )
      return data
    },
    enabled: !!countryId,
    ...defaultQueryOptions,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}
