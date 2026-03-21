export type PlanCode = 'INDOOR' | 'TERRACE'

export type ZoneCode = 'INDOOR' | 'TERRACE' | 'PRIVATE'

export type FeatureType = 'PRIVATE_ROOM' | 'PLAY_AREA' | 'WINDOW_BAND'

export type AvailabilityStatus = 'AVAILABLE' | 'RESERVED' | 'UNAVAILABLE'

export type RecommendationPreference = 'PRIVACY' | 'WINDOW' | 'NEAR_PLAY_AREA'

export interface LayoutPoint {
  x: number
  y: number
}

export interface LayoutPlan {
  code: PlanCode
  label: string
  description: string
}

export interface LayoutZone {
  code: ZoneCode
  label: string
  description: string
}

export interface LayoutFeature {
  featureId: string
  plan: PlanCode
  type: FeatureType
  label: string
  center: LayoutPoint
  width: number
  height: number
}

export interface LayoutTable {
  tableId: string
  label: string
  capacity: number
  plan: PlanCode
  zone: ZoneCode
  center: LayoutPoint
  width: number
  height: number
  rotationDegrees: number
  accessible: boolean
  nearWindow: boolean | null
  nearPlayArea: boolean | null
  privacyScore: number
}

export interface LayoutResponse {
  layoutId: string
  venueWidthMeters: number
  venueHeightMeters: number
  plans: LayoutPlan[]
  zones: LayoutZone[]
  features: LayoutFeature[]
  tables: LayoutTable[]
}

export interface AvailabilityRequest {
  date: string
  time: string
  partySize: number
  plan: PlanCode
  zone?: ZoneCode | null
  accessibleRequired: boolean
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
  plan: PlanCode
  zone?: ZoneCode | null
  accessibleRequired: boolean
  preferences: RecommendationPreference[]
}

export interface RecommendationsResponse {
  topRecommendationId: string | null
  recommendations: Recommendation[]
}
