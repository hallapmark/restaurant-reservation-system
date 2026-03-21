import type {
  AvailabilityStatus,
  LayoutFeature,
  LayoutTable,
} from '../models/layout'

export type TableDisplayState = 'RESERVED' | 'SELECTED' | 'RECOMMENDED' | 'AVAILABLE' | 'UNAVAILABLE'

export interface LayoutBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

interface LayoutRect {
  center: {
    x: number
    y: number
  }
  width: number
  height: number
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

export function getLayoutBounds(args: {
  tables: LayoutTable[]
  features?: LayoutFeature[]
}): LayoutBounds {
  const items: LayoutRect[] = [...args.tables, ...(args.features ?? [])]

  if (!items.length) {
    return { minX: 0, minY: 0, maxX: 1, maxY: 1 }
  }

  let minX = items[0].center.x - items[0].width / 2
  let minY = items[0].center.y - items[0].height / 2
  let maxX = items[0].center.x + items[0].width / 2
  let maxY = items[0].center.y + items[0].height / 2

  for (const item of items.slice(1)) {
    minX = Math.min(minX, item.center.x - item.width / 2)
    minY = Math.min(minY, item.center.y - item.height / 2)
    maxX = Math.max(maxX, item.center.x + item.width / 2)
    maxY = Math.max(maxY, item.center.y + item.height / 2)
  }

  return { minX, minY, maxX, maxY }
}

export interface GridPlacement {
  colStart: number
  colSpan: number
  rowStart: number
  rowSpan: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getGridPlacement(args: {
  item: LayoutRect
  bounds: LayoutBounds
  venueWidthMeters: number
  venueHeightMeters: number
  gridColumns: number
  gridRows: number
  minColSpan: number
  maxColSpan: number
  minRowSpan: number
  maxRowSpan: number
  spanMultiplier: number
}): GridPlacement {
  const {
    item,
    bounds,
    venueWidthMeters,
    venueHeightMeters,
    gridColumns,
    gridRows,
    minColSpan,
    maxColSpan,
    minRowSpan,
    maxRowSpan,
    spanMultiplier,
  } = args
  const xRange = Math.max(bounds.maxX - bounds.minX, 1)
  const yRange = Math.max(bounds.maxY - bounds.minY, 1)
  const left = item.center.x - item.width / 2
  const right = item.center.x + item.width / 2
  const top = item.center.y - item.height / 2
  const bottom = item.center.y + item.height / 2

  const leftNormalized = (left - bounds.minX) / xRange
  const rightNormalized = (right - bounds.minX) / xRange
  const topNormalized = (top - bounds.minY) / yRange
  const bottomNormalized = (bottom - bounds.minY) / yRange

  const rawColSpan = Math.max(
    Math.ceil(rightNormalized * gridColumns) - Math.floor(leftNormalized * gridColumns),
    Math.ceil((item.width / Math.max(venueWidthMeters, 1)) * gridColumns * spanMultiplier),
    1,
  )
  const rawRowSpan = Math.max(
    Math.ceil(bottomNormalized * gridRows) - Math.floor(topNormalized * gridRows),
    Math.ceil((item.height / Math.max(venueHeightMeters, 1)) * gridRows * spanMultiplier),
    1,
  )

  const colSpan = clamp(rawColSpan, minColSpan, Math.min(maxColSpan, gridColumns))
  const rowSpan = clamp(rawRowSpan, minRowSpan, Math.min(maxRowSpan, gridRows))

  const colStart = clamp(
    Math.floor(leftNormalized * gridColumns) + 1,
    1,
    Math.max(gridColumns - colSpan + 1, 1),
  )
  const rowStart = clamp(
    Math.floor(topNormalized * gridRows) + 1,
    1,
    Math.max(gridRows - rowSpan + 1, 1),
  )

  return { colStart, colSpan, rowStart, rowSpan }
}

export function getTableGridPlacement(args: {
  table: LayoutTable
  bounds: LayoutBounds
  venueWidthMeters: number
  venueHeightMeters: number
  gridColumns: number
  gridRows: number
}): GridPlacement {
  const { table, ...rest } = args
  return getGridPlacement({
    item: table,
    ...rest,
    minColSpan: 2,
    maxColSpan: 3,
    minRowSpan: 1,
    maxRowSpan: 2,
    spanMultiplier: 2,
  })
}

export function getFeatureGridPlacement(args: {
  feature: LayoutFeature
  bounds: LayoutBounds
  venueWidthMeters: number
  venueHeightMeters: number
  gridColumns: number
  gridRows: number
}): GridPlacement {
  const { feature, ...rest } = args
  if (feature.type === 'WINDOW_BAND') {
    return getGridPlacement({
      item: feature,
      ...rest,
      minColSpan: 6,
      maxColSpan: rest.gridColumns,
      minRowSpan: 1,
      maxRowSpan: 1,
      spanMultiplier: 0.75,
    })
  }

  if (feature.type === 'PRIVATE_ROOM') {
    return getGridPlacement({
      item: feature,
      ...rest,
      minColSpan: 4,
      maxColSpan: rest.gridColumns,
      minRowSpan: 2,
      maxRowSpan: 4,
      spanMultiplier: 1.25,
    })
  }

  return getGridPlacement({
    item: feature,
    ...rest,
    minColSpan: 3,
    maxColSpan: 5,
    minRowSpan: 2,
    maxRowSpan: 3,
    spanMultiplier: 1.2,
  })
}
