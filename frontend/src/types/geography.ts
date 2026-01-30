export interface Country {
  id: string
  name_en: string
  name_native?: string
  name_short?: string
  iso_alpha2?: string
  iso_alpha3?: string
  gwcode?: number
  cowcode?: number
  wikidata_id?: string
  entity_type: string
  valid_from: string
  valid_to?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface CountryListItem {
  id: string
  name_en: string
  name_short?: string
  iso_alpha2?: string
  iso_alpha3?: string
  entity_type: string
  valid_from: string
  valid_to?: string
}

export interface BorderGeoJSONProperties {
  id: string
  country_id: string
  name: string
  name_short?: string
  iso_alpha2?: string
  iso_alpha3?: string
  gwcode?: number
  entity_type: string
  valid_from: string
  valid_to?: string | null
}

export interface GeoJSONFeature {
  type: 'Feature'
  properties: {
    id: string
    name: string
    name_short?: string
    iso_alpha2?: string
    iso_alpha3?: string
    gwcode?: number
    entity_type: string
    // Border-specific properties (from /borders/all endpoint)
    country_id?: string
    valid_from?: string
    valid_to?: string | null
  }
  geometry: GeoJSON.Geometry
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  pages: number
}


// MapLibre compatible GeoJSON types
export interface MapGeoJSONFeature {
  type: "Feature"
  properties: Record<string, unknown>
  geometry: {
    type: string
    coordinates: number[] | number[][] | number[][][] | number[][][][]
  }
}

export interface MapGeoJSONFeatureCollection {
  type: "FeatureCollection"
  features: MapGeoJSONFeature[]
}

export interface BorderFeature extends MapGeoJSONFeature {
  properties: {
    id: string
    country_id?: string
    name?: string
    name_en?: string
    iso_alpha2?: string
    gwcode?: number
    entity_type?: string
    valid_from?: string
    valid_to?: string | null
  }
}

export interface RelationshipLineFeature extends MapGeoJSONFeature {
  properties: {
    id: string
    name?: string
    nature: string
    type: string
    country_a: string
    country_b: string
    color: string
  }
  geometry: {
    type: "LineString"
    coordinates: [number, number][]
  }
}
