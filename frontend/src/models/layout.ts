export type ZoneCode = 'INDOOR' | 'TERRACE' | 'PRIVATE'

export type AvailabilityStatus = 'AVAILABLE' | 'RESERVED' | 'UNAVAILABLE'

export type Preference = 'PRIVACY' | 'WINDOW' | 'ACCESSIBLE' | 'NEAR_PLAY_AREA'

export interface LayoutPoint {
  x: number
  y: number
}

export interface LayoutZone {
  code: ZoneCode
  label: string
  description: string
}

export interface LayoutTable {
  tableId: string
  label: string
  capacity: number
  zone: ZoneCode
  center: LayoutPoint
  width: number
  height: number
  rotationDegrees: number
}

export interface LayoutResponse {
  layoutId: string
  venueWidthMeters: number
  venueHeightMeters: number
  zones: LayoutZone[]
  tables: LayoutTable[]
}

export interface AvailabilityRequest {
  date: string
  time: string
  partySize: number
  zone?: ZoneCode | null
}

export interface AvailabilityResponse {
  tableStatusById: Record<string, AvailabilityStatus>
  generatedAt: string
}

export interface Recommendation {
  tableId: string
  score: number
  reasons: string[]
}

export interface RecommendationsRequest {
  date: string
  time: string
  partySize: number
  zone?: ZoneCode | null
  preferences: Preference[]
}

export interface RecommendationsResponse {
  topRecommendationId: string | null
  recommendations: Recommendation[]
}
