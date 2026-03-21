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
  selectedTableId: string | null
  tableId: string
  recommendedTableIds: Set<string>
}): TableDisplayState {
  const { availabilityStatus, selectedTableId, tableId, recommendedTableIds } = args

  if (availabilityStatus === 'RESERVED') {
    return 'RESERVED'
  }

  if (selectedTableId === tableId) {
    return 'SELECTED'
  }

  if (recommendedTableIds.has(tableId) && availabilityStatus === 'AVAILABLE') {
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
