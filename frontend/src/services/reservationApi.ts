import type {
  AvailabilityRequest,
  AvailabilityResponse,
  AvailabilitySlotsRequest,
  AvailabilitySlotsResponse,
  LayoutResponse,
  RecommendationsRequest,
  RecommendationsResponse,
} from '../models/layout'

const configuredBackendUrl = import.meta.env.VITE_BACKEND_URL
if (!configuredBackendUrl) {
  throw new Error('VITE_BACKEND_URL is required for API calls. Set it in .env.development.local')
}

const API_BASE = configuredBackendUrl.replace(/\/+$/, '')
const API_PREFIX = '/api/v1'

function apiUrl(path: string) {
  return `${API_BASE}${API_PREFIX}${path}`
}

export async function fetchLayout(): Promise<LayoutResponse> {
  const res = await fetch(apiUrl('/layout'))
  if (!res.ok) {
    throw new Error(`Layout API failed: ${res.status}`)
  }
  return res.json()
}

export async function fetchAvailability(request: AvailabilityRequest): Promise<AvailabilityResponse> {
  const res = await fetch(apiUrl('/availability'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!res.ok) {
    throw new Error(`Availability API failed: ${res.status}`)
  }
  return res.json()
}

export async function fetchAvailabilitySlots(
  request: AvailabilitySlotsRequest,
): Promise<AvailabilitySlotsResponse> {
  const res = await fetch(apiUrl('/availability/slots'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!res.ok) {
    throw new Error(`Availability slots API failed: ${res.status}`)
  }
  return res.json()
}

export async function fetchRecommendations(
  request: RecommendationsRequest,
): Promise<RecommendationsResponse> {
  const res = await fetch(apiUrl('/recommendations'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!res.ok) {
    throw new Error(`Recommendations API failed: ${res.status}`)
  }
  return res.json()
}
