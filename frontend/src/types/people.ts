export interface PersonListItem {
  id: string
  name: string
  name_native?: string
  birth_date?: string
  death_date?: string
  person_types?: string[]
  ideology_tags?: string[]
  bio_short?: string
  image_url?: string
  primary_country_id?: string
}

export interface PersonConnection {
  id: string
  person_id: string
  person_name: string
  person_image?: string
  connection_type: string
  description?: string
  strength?: number
  start_date?: string
  end_date?: string
}

export interface PersonPosition {
  id: string
  title: string
  position_type: string
  country_id?: string
  country_name?: string
  start_date?: string
  end_date?: string
}

export interface BookListItem {
  id: string
  title: string
  publication_year?: number
  book_type?: string
  topics?: string[]
  cover_url?: string
}

export interface Person extends PersonListItem {
  wikidata_id?: string
  bio_full?: string
  progressive_analysis?: string
  birth_place?: string
  death_place?: string
  connections: PersonConnection[]
  positions: PersonPosition[]
  books: BookListItem[]
}

export interface BookAuthor {
  person_id: string
  person_name: string
  role: string
}

export interface Book extends BookListItem {
  title_original?: string
  publisher?: string
  description?: string
  significance?: string
  progressive_analysis?: string
  marxists_archive_url?: string
  gutenberg_url?: string
  pdf_url?: string
  wikidata_id?: string
  isbn?: string
  authors: BookAuthor[]
}

export interface ConnectionGraphNode {
  id: string
  name: string
  image?: string
  person_types?: string[]
}

export interface ConnectionGraphLink {
  source: string
  target: string
  type: string
  strength: number
}

export interface ConnectionGraph {
  nodes: ConnectionGraphNode[]
  links: ConnectionGraphLink[]
}
