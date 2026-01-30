import { useQuery } from "@tanstack/react-query"
import { apiClient } from "./client"
import type { PolicyTopic, PolicyListItem, Policy, PaginatedResponse } from "../types"

export function usePolicyTopics() {
  return useQuery({
    queryKey: ["policy-topics"],
    queryFn: async () => {
      const { data } = await apiClient.get<PolicyTopic[]>("/policies/topics")
      return data
    },
    staleTime: Infinity,
  })
}

export function usePolicies(
  countryId: string,
  options?: { topicId?: string; policyType?: string; year?: number }
) {
  return useQuery({
    queryKey: ["policies", countryId, options],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<PolicyListItem>>(
        `/policies/countries/${countryId}/policies`,
        {
          params: {
            topic_id: options?.topicId,
            policy_type: options?.policyType,
            year: options?.year,
            per_page: 50,
          },
        }
      )
      return data
    },
    enabled: !!countryId,
  })
}

export function usePolicy(policyId: string) {
  return useQuery({
    queryKey: ["policy", policyId],
    queryFn: async () => {
      const { data } = await apiClient.get<Policy>(`/policies/policies/${policyId}`)
      return data
    },
    enabled: !!policyId,
  })
}
