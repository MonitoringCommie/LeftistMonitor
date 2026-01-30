export interface EventListItem {
  id: string
  title: string
  start_date?: string
  end_date?: string
  category: string
  event_type?: string
  importance?: number
  location_name?: string
  image_url?: string
}

export interface Event extends EventListItem {
  title_native?: string
  description?: string
  progressive_analysis?: string
  tags?: string[]
  wikidata_id?: string
  primary_country_id?: string
}

export interface ConflictParticipant {
  id: string
  country_id?: string
  country_name?: string
  actor_name?: string
  side: string
  role?: string
  casualties?: number
}

export interface ConflictListItem {
  id: string
  name: string
  start_date?: string
  end_date?: string
  conflict_type: string
  intensity?: string
  casualties_low?: number
  casualties_high?: number
}

export interface Conflict extends ConflictListItem {
  ucdp_id?: string
  cow_id?: string
  wikidata_id?: string
  description?: string
  progressive_analysis?: string
  outcome?: string
  participants: ConflictParticipant[]
}

export interface TimelineEvent {
  id: string
  title: string
  date: string
  end_date?: string
  type: 'event' | 'election' | 'conflict_start' | 'conflict_end'
  category?: string
  importance?: number
}
