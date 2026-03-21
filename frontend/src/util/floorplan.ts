import type { AvailabilityStatus, LayoutResponse } from '../models/layout'

export type TableDisplayState = 'RESERVED' | 'SELECTED' | 'RECOMMENDED' | 'AVAILABLE' | 'UNAVAILABLE'

export interface LayoutBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export function getTableDisplayState(args: {
  availabilityStatus: AvailabilityStatus
  isSelected: boolean
  isRecommended: boolean
}): TableDisplayState {
  const { availabilityStatus, isSelected, isRecommended } = args

  if (availabilityStatus === 'RESERVED') {
    return 'RESERVED'
  }

  if (isSelected) {
    return 'SELECTED'
  }

  if (isRecommended && availabilityStatus === 'AVAILABLE') {
    return 'RECOMMENDED'
  }

  if (availabilityStatus === 'AVAILABLE') {
    return 'AVAILABLE'
  }

  return 'UNAVAILABLE'
}

export function getLayoutBounds(layout: LayoutResponse | null): LayoutBounds {
  if (!layout?.tables.length) {
    return { minX: 0, minY: 0, maxX: 1, maxY: 1 }
  }

  let minX = layout.tables[0].center.x
  let minY = layout.tables[0].center.y
  let maxX = layout.tables[0].center.x
  let maxY = layout.tables[0].center.y

  for (const table of layout.tables.slice(1)) {
    minX = Math.min(minX, table.center.x)
    minY = Math.min(minY, table.center.y)
    maxX = Math.max(maxX, table.center.x)
    maxY = Math.max(maxY, table.center.y)
  }

  return { minX, minY, maxX, maxY }
}

export interface TableGridPlacement {
  colStart: number
  colSpan: number
  rowStart: number
  rowSpan: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function getTableGridPlacement(args: {
  table: LayoutResponse['tables'][number]
  bounds: LayoutBounds
  venueWidthMeters: number
  venueHeightMeters: number
  gridColumns: number
  gridRows: number
}): TableGridPlacement {
  const { table, bounds, venueWidthMeters, venueHeightMeters, gridColumns, gridRows } = args
  const xRange = Math.max(bounds.maxX - bounds.minX, 1)
  const yRange = Math.max(bounds.maxY - bounds.minY, 1)
  const normalizedX = (table.center.x - bounds.minX) / xRange
  const normalizedY = (table.center.y - bounds.minY) / yRange
  const colSpan = clamp(
    Math.ceil((table.width / Math.max(venueWidthMeters, 1)) * gridColumns * 3),
    2,
    4,
  )
  const rowSpan = clamp(
    Math.ceil((table.height / Math.max(venueHeightMeters, 1)) * gridRows * 3),
    1,
    2,
  )
  const colStart = Math.round(normalizedX * Math.max(gridColumns - colSpan, 0)) + 1
  const rowStart = Math.round(normalizedY * Math.max(gridRows - rowSpan, 0)) + 1

  return { colStart, colSpan, rowStart, rowSpan }
}
