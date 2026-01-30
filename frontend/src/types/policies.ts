export interface PolicyTopic {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  parent_id?: string
}

export interface PolicyListItem {
  id: string
  title: string
  title_original?: string
  summary?: string
  country_id: string
  policy_type: string
  status: string
  date_enacted?: string
  progressive_score?: number
  topics: PolicyTopic[]
}

export interface PolicyVote {
  id: string
  party_id: string
  vote: string
  votes_for?: number
  votes_against?: number
  votes_abstain?: number
}

export interface Policy extends PolicyListItem {
  description?: string
  date_proposed?: string
  date_passed?: string
  date_repealed?: string
  progressive_analysis?: string
  wikidata_id?: string
  official_url?: string
  votes: PolicyVote[]
}
