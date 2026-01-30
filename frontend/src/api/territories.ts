import { useQuery } from '@tanstack/react-query'
import { apiClient, staticQueryOptions, defaultQueryOptions } from './client'

// Types for Occupations
export interface Occupation {
  id: string
  name: string
  occupier_country_id: string | null
  occupier_name: string | null
  occupied_territory: string
  occupied_people: string
  start_date: string | null
  end_date: string | null
  occupation_type: string
  international_law_status: string
  un_resolutions: string[]
  population_displaced: number | null
  settlements_built: number | null
  land_confiscated_km2: number | null
  description: string | null
  progressive_analysis: string | null
}

export interface ResistanceMovement {
  id: string
  name: string
  occupation_id: string | null
  occupation_name: string | null
  founded_date: string | null
  dissolved_date: string | null
  ideology_tags: string[]
  armed_wing: boolean
  political_wing: boolean
  description: string | null
  progressive_analysis: string | null
}

// GeoJSON Types
export interface GeoJSONFeature<P = Record<string, unknown>> {
  type: 'Feature'
  properties: P
  geometry: {
    type: string
    coordinates: number[] | number[][] | number[][][]
  }
}

export interface GeoJSONFeatureCollection<P = Record<string, unknown>> {
  type: 'FeatureCollection'
  features: GeoJSONFeature<P>[]
}

// Palestine-specific types
export interface NakbaVillageProperties {
  id: string
  name_arabic: string
  name_english: string
  district: string
  sub_district: string
  population_1945: number | null
  land_area_dunams: number | null
  depopulation_date: string | null
  depopulation_cause: string
  current_status: string
  israeli_locality_on_lands: string | null
  refugees_displaced: number | null
  massacre_occurred: boolean
  massacre_deaths: number | null
}

export interface SettlementProperties {
  id: string
  name_english: string
  name_hebrew: string
  settlement_type: string
  established_year: number | null
  location_region: string
  governorate: string
  population: number | null
  population_year: number | null
  built_on_village: string | null
  area_dunams: number | null
  legal_status: string
}

export interface CheckpointProperties {
  id: string
  name: string
  checkpoint_type: string
  governorate: string
  restrictions: string | null
}

export interface WallSegmentProperties {
  id: string
  segment_name: string
  construction_start: string | null
  construction_end: string | null
  length_km: number | null
  wall_type: string
  land_isolated_dunams: number | null
  icj_ruling_2004: boolean
}

export interface MassacreProperties {
  id: string
  name: string
  date: string | null
  location: string
  palestinian_deaths: number | null
  description: string | null
  perpetrator: string
}

export interface PalestineSummary {
  nakba_villages: {
    count: number
    total_population_1945: number | null
    total_refugees_displaced: number | null
    villages_with_massacres: number
  }
  settlements: {
    count: number
    total_population: number | null
    earliest_year: number | null
    latest_year: number | null
  }
  checkpoints: {
    count: number
  }
  separation_wall: {
    segments: number
    total_length_km: number | null
    land_isolated_dunams: number | null
  }
  massacres: {
    count: number
    total_deaths: number | null
  }
}

// Ireland types
export interface TroublesEventProperties {
  id: string
  name: string
  date: string | null
  location_name: string
  category: string
  perpetrator: string
  perpetrator_side: string
  civilian_deaths: number | null
  total_deaths: number | null
  collusion_documented: boolean
  description: string | null
}

export interface FamineCounty {
  id: string
  county: string
  province: string
  population_1841: number | null
  population_1851: number | null
  population_decline_percent: number | null
  estimated_deaths: number | null
  estimated_emigration: number | null
  evictions: number | null
  workhouse_deaths: number | null
  lat: number | null
  lon: number | null
  description: string | null
  progressive_analysis: string | null
}

// API Functions
export async function getOccupations(params?: { year?: number; ongoing?: boolean }): Promise<Occupation[]> {
  const response = await apiClient.get<Occupation[]>('/territories/occupations', { params })
  return response.data
}

export async function getResistanceMovements(params?: { occupation_id?: string; active?: boolean }): Promise<ResistanceMovement[]> {
  const response = await apiClient.get<ResistanceMovement[]>('/territories/resistance-movements', { params })
  return response.data
}

export async function getNakbaVillagesGeoJSON(district?: string): Promise<GeoJSONFeatureCollection<NakbaVillageProperties>> {
  const params = district ? { district } : {}
  const response = await apiClient.get<GeoJSONFeatureCollection<NakbaVillageProperties>>('/territories/palestine/nakba-villages/geojson', { params })
  return response.data
}

export async function getSettlementsGeoJSON(region?: string): Promise<GeoJSONFeatureCollection<SettlementProperties>> {
  const params = region ? { region } : {}
  const response = await apiClient.get<GeoJSONFeatureCollection<SettlementProperties>>('/territories/palestine/settlements/geojson', { params })
  return response.data
}

export async function getCheckpointsGeoJSON(governorate?: string): Promise<GeoJSONFeatureCollection<CheckpointProperties>> {
  const params = governorate ? { governorate } : {}
  const response = await apiClient.get<GeoJSONFeatureCollection<CheckpointProperties>>('/territories/palestine/checkpoints/geojson', { params })
  return response.data
}

export async function getSeparationWallGeoJSON(): Promise<GeoJSONFeatureCollection<WallSegmentProperties>> {
  const response = await apiClient.get<GeoJSONFeatureCollection<WallSegmentProperties>>('/territories/palestine/separation-wall/geojson')
  return response.data
}

export async function getMassacresGeoJSON(): Promise<GeoJSONFeatureCollection<MassacreProperties>> {
  const response = await apiClient.get<GeoJSONFeatureCollection<MassacreProperties>>('/territories/palestine/massacres/geojson')
  return response.data
}

export async function getPalestineSummary(): Promise<PalestineSummary> {
  const response = await apiClient.get<PalestineSummary>('/territories/palestine/summary')
  return response.data
}

export async function getTroublesEventsGeoJSON(): Promise<GeoJSONFeatureCollection<TroublesEventProperties>> {
  const response = await apiClient.get<GeoJSONFeatureCollection<TroublesEventProperties>>('/territories/ireland/troubles/geojson')
  return response.data
}

export async function getFamineData(): Promise<FamineCounty[]> {
  const response = await apiClient.get<FamineCounty[]>('/territories/ireland/famine')
  return response.data
}

// React Query Hooks
export function useOccupations(params?: { year?: number; ongoing?: boolean }) {
  return useQuery({
    queryKey: ['occupations', params],
    queryFn: () => getOccupations(params),
    ...defaultQueryOptions,
  })
}

export function useOngoingOccupations() {
  return useQuery({
    queryKey: ['occupations', 'ongoing'],
    queryFn: () => getOccupations({ ongoing: true }),
    ...staticQueryOptions,
  })
}

export function useResistanceMovements(params?: { occupation_id?: string; active?: boolean }) {
  return useQuery({
    queryKey: ['resistance-movements', params],
    queryFn: () => getResistanceMovements(params),
    ...defaultQueryOptions,
  })
}

export function useNakbaVillagesGeoJSON(district?: string) {
  return useQuery({
    queryKey: ['nakba-villages-geojson', district],
    queryFn: () => getNakbaVillagesGeoJSON(district),
    ...staticQueryOptions,
  })
}

export function useSettlementsGeoJSON(region?: string) {
  return useQuery({
    queryKey: ['settlements-geojson', region],
    queryFn: () => getSettlementsGeoJSON(region),
    ...staticQueryOptions,
  })
}

export function useCheckpointsGeoJSON(governorate?: string) {
  return useQuery({
    queryKey: ['checkpoints-geojson', governorate],
    queryFn: () => getCheckpointsGeoJSON(governorate),
    ...staticQueryOptions,
  })
}

export function useSeparationWallGeoJSON() {
  return useQuery({
    queryKey: ['separation-wall-geojson'],
    queryFn: getSeparationWallGeoJSON,
    ...staticQueryOptions,
  })
}

export function useMassacresGeoJSON() {
  return useQuery({
    queryKey: ['massacres-geojson'],
    queryFn: getMassacresGeoJSON,
    ...staticQueryOptions,
  })
}

export function usePalestineSummary() {
  return useQuery({
    queryKey: ['palestine-summary'],
    queryFn: getPalestineSummary,
    ...staticQueryOptions,
  })
}

export function useTroublesEventsGeoJSON() {
  return useQuery({
    queryKey: ['troubles-events-geojson'],
    queryFn: getTroublesEventsGeoJSON,
    ...staticQueryOptions,
  })
}

export function useFamineData() {
  return useQuery({
    queryKey: ['famine-data'],
    queryFn: getFamineData,
    ...staticQueryOptions,
  })
}


// ==========================================
// Liberation Struggle GeoJSON Types
// ==========================================

export interface LiberationEventProperties {
  id: string
  name: string
  description: string | null
  date: string | null
  category: string
  progressive_analysis: string | null
}

export interface LiberationSummary {
  [category: string]: {
    count: number
  }
}

// ==========================================
// KASHMIR API
// ==========================================

export async function getKashmirEventsGeoJSON(eventType?: string): Promise<GeoJSONFeatureCollection<LiberationEventProperties>> {
  const params = eventType ? { event_type: eventType } : {}
  const response = await apiClient.get<GeoJSONFeatureCollection<LiberationEventProperties>>('/territories/kashmir/events/geojson', { params })
  return response.data
}

export async function getKashmirSummary(): Promise<LiberationSummary> {
  const response = await apiClient.get<LiberationSummary>('/territories/kashmir/summary')
  return response.data
}

export function useKashmirEventsGeoJSON(eventType?: string) {
  return useQuery({
    queryKey: ['kashmir-events-geojson', eventType],
    queryFn: () => getKashmirEventsGeoJSON(eventType),
    ...staticQueryOptions,
  })
}

export function useKashmirSummary() {
  return useQuery({
    queryKey: ['kashmir-summary'],
    queryFn: getKashmirSummary,
    ...staticQueryOptions,
  })
}

// ==========================================
// TIBET API
// ==========================================

export async function getTibetEventsGeoJSON(eventType?: string): Promise<GeoJSONFeatureCollection<LiberationEventProperties>> {
  const params = eventType ? { event_type: eventType } : {}
  const response = await apiClient.get<GeoJSONFeatureCollection<LiberationEventProperties>>('/territories/tibet/events/geojson', { params })
  return response.data
}

export async function getTibetSummary(): Promise<LiberationSummary> {
  const response = await apiClient.get<LiberationSummary>('/territories/tibet/summary')
  return response.data
}

export function useTibetEventsGeoJSON(eventType?: string) {
  return useQuery({
    queryKey: ['tibet-events-geojson', eventType],
    queryFn: () => getTibetEventsGeoJSON(eventType),
    ...staticQueryOptions,
  })
}

export function useTibetSummary() {
  return useQuery({
    queryKey: ['tibet-summary'],
    queryFn: getTibetSummary,
    ...staticQueryOptions,
  })
}

// ==========================================
// KURDISTAN API
// ==========================================

export async function getKurdistanEventsGeoJSON(eventType?: string): Promise<GeoJSONFeatureCollection<LiberationEventProperties>> {
  const params = eventType ? { event_type: eventType } : {}
  const response = await apiClient.get<GeoJSONFeatureCollection<LiberationEventProperties>>('/territories/kurdistan/events/geojson', { params })
  return response.data
}

export async function getKurdistanSummary(): Promise<LiberationSummary> {
  const response = await apiClient.get<LiberationSummary>('/territories/kurdistan/summary')
  return response.data
}

export function useKurdistanEventsGeoJSON(eventType?: string) {
  return useQuery({
    queryKey: ['kurdistan-events-geojson', eventType],
    queryFn: () => getKurdistanEventsGeoJSON(eventType),
    ...staticQueryOptions,
  })
}

export function useKurdistanSummary() {
  return useQuery({
    queryKey: ['kurdistan-summary'],
    queryFn: getKurdistanSummary,
    ...staticQueryOptions,
  })
}

// ==========================================
// WESTERN SAHARA API
// ==========================================

export async function getWesternSaharaEventsGeoJSON(eventType?: string): Promise<GeoJSONFeatureCollection<LiberationEventProperties>> {
  const params = eventType ? { event_type: eventType } : {}
  const response = await apiClient.get<GeoJSONFeatureCollection<LiberationEventProperties>>('/territories/western-sahara/events/geojson', { params })
  return response.data
}

export async function getWesternSaharaSummary(): Promise<LiberationSummary> {
  const response = await apiClient.get<LiberationSummary>('/territories/western-sahara/summary')
  return response.data
}

export function useWesternSaharaEventsGeoJSON(eventType?: string) {
  return useQuery({
    queryKey: ['western-sahara-events-geojson', eventType],
    queryFn: () => getWesternSaharaEventsGeoJSON(eventType),
    ...staticQueryOptions,
  })
}

export function useWesternSaharaSummary() {
  return useQuery({
    queryKey: ['western-sahara-summary'],
    queryFn: getWesternSaharaSummary,
    ...staticQueryOptions,
  })
}


// ==========================================
// WEST PAPUA API
// ==========================================

export async function getWestPapuaEventsGeoJSON(eventType?: string): Promise<GeoJSONFeatureCollection<LiberationEventProperties>> {
  const params = eventType ? { event_type: eventType } : {}
  const response = await apiClient.get<GeoJSONFeatureCollection<LiberationEventProperties>>('/territories/west-papua/events/geojson', { params })
  return response.data
}

export async function getWestPapuaSummary(): Promise<LiberationSummary> {
  const response = await apiClient.get<LiberationSummary>('/territories/west-papua/summary')
  return response.data
}

export function useWestPapuaEventsGeoJSON(eventType?: string) {
  return useQuery({
    queryKey: ['west-papua-events-geojson', eventType],
    queryFn: () => getWestPapuaEventsGeoJSON(eventType),
    ...staticQueryOptions,
  })
}

export function useWestPapuaSummary() {
  return useQuery({
    queryKey: ['west-papua-summary'],
    queryFn: getWestPapuaSummary,
    ...staticQueryOptions,
  })
}
