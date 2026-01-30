export interface Ideology {
  id: string
  name: string
  description?: string
  color?: string
  left_right_position?: number
  libertarian_authoritarian_position?: number
}

export interface PartyListItem {
  id: string
  name: string
  name_english?: string
  name_short?: string
  country_id: string
  founded?: string
  dissolved?: string
  left_right_score?: number
  party_family?: string
  logo_url?: string
}

export interface PartyElectionHistory {
  election_id: string
  election_date: string
  election_type: string
  vote_share?: number
  seats?: number
  seat_share?: number
}

export interface Party extends PartyListItem {
  parlgov_id?: number
  partyfacts_id?: number
  manifesto_id?: string
  wikidata_id?: string
  description?: string
  progressive_analysis?: string
  ideologies: Ideology[]
  election_history: PartyElectionHistory[]
}

export interface ElectionListItem {
  id: string
  country_id: string
  date: string
  election_type: string
  turnout_percent?: number
  total_votes?: number
  total_seats?: number
}

export interface ElectionResult {
  id: string
  party_id: string
  party_name: string
  party_short?: string
  party_color?: string
  party_family?: string
  left_right?: number
  votes?: number
  vote_share?: number
  seats?: number
  seat_share?: number
}

export interface Election extends ElectionListItem {
  notes?: string
  results: ElectionResult[]
}
