import {
  Box,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import type { AvailabilityStatus, LayoutTable } from '../models/layout'
import {
  getTableDisplayState,
  getTableGridPlacement,
  type LayoutBounds,
  type TableDisplayState,
} from '../util/floorplan'

function getStateStyle(displayState: TableDisplayState) {
  if (displayState === 'RESERVED') {
    return {
      backgroundColor: 'grey.300',
      borderColor: 'grey.500',
      borderStyle: 'solid',
      color: 'text.secondary',
    }
  }

  if (displayState === 'SELECTED') {
    return {
      backgroundColor: 'primary.main',
      borderColor: 'primary.dark',
      borderStyle: 'solid',
      color: 'primary.contrastText',
    }
  }

  if (displayState === 'RECOMMENDED') {
    return {
      backgroundColor: 'warning.main',
      borderColor: 'warning.dark',
      borderStyle: 'solid',
      color: 'common.white',
    }
  }

  if (displayState === 'AVAILABLE') {
    return {
      backgroundColor: 'success.light',
      borderColor: 'success.main',
      borderStyle: 'solid',
      color: 'text.primary',
    }
  }

  return {
    backgroundColor: 'grey.50',
    borderColor: 'grey.300',
    borderStyle: 'dashed',
    color: 'text.secondary',
  }
}

function getStateLabel(displayState: TableDisplayState, hasAvailabilityData: boolean) {
  if (!hasAvailabilityData) {
    return 'Saadavuse infot ei ole. Saaliplaan on ajutiselt ainult vaatamiseks.'
  }

  if (displayState === 'RESERVED') {
    return 'Broneeritud'
  }

  if (displayState === 'UNAVAILABLE') {
    return 'Ei sobi valitud tingimustega'
  }

  if (displayState === 'RECOMMENDED') {
    return 'Soovitatud laud'
  }

  if (displayState === 'SELECTED') {
    return 'Sinu valitud laud'
  }

  return 'Vaba laud'
}

interface FloorplanTableTileProps {
  table: LayoutTable
  availabilityStatus: AvailabilityStatus
  bounds: LayoutBounds
  venueWidthMeters: number
  venueHeightMeters: number
  gridColumns: number
  gridRows: number
  hasAvailabilityData: boolean
  isSelected: boolean
  isRecommended: boolean
  zoneLabel: string
  onSelect: (tableId: string) => void
}

export default function FloorplanTableTile({
  table,
  availabilityStatus,
  bounds,
  venueWidthMeters,
  venueHeightMeters,
  gridColumns,
  gridRows,
  hasAvailabilityData,
  isSelected,
  isRecommended,
  zoneLabel,
  onSelect,
}: FloorplanTableTileProps) {
  const isSelectable = hasAvailabilityData && availabilityStatus === 'AVAILABLE'
  const displayState = getTableDisplayState({
    availabilityStatus,
    isSelected,
    isRecommended,
  })
  const style = hasAvailabilityData
    ? getStateStyle(displayState)
    : {
        backgroundColor: 'grey.50',
        borderColor: 'grey.300',
        borderStyle: 'dashed',
        color: 'text.secondary',
      }
  const stateLabel = getStateLabel(displayState, hasAvailabilityData)
  const { colStart, colSpan, rowStart, rowSpan } = getTableGridPlacement({
    table,
    bounds,
    venueWidthMeters,
    venueHeightMeters,
    gridColumns,
    gridRows,
  })

  return (
    <Box
      sx={{
        gridColumn: `${colStart} / span ${colSpan}`,
        gridRow: `${rowStart} / span ${rowSpan}`,
        minWidth: 0,
      }}
    >
      <Tooltip title={stateLabel} arrow placement="top">
        <Box component="span" sx={{ display: 'block' }}>
          <Box
            component="button"
            type="button"
            disabled={!isSelectable}
            aria-pressed={isSelected}
            aria-label={`${table.label}. ${stateLabel}.`}
            onClick={() => onSelect(table.tableId)}
            sx={{
              appearance: 'none',
              background: 'none',
              width: '100%',
              minHeight: { xs: 60, sm: 64 },
              p: { xs: 1, sm: 1.2 },
              borderRadius: 2,
              borderWidth: 2,
              cursor: isSelectable ? 'pointer' : 'not-allowed',
              font: 'inherit',
              textAlign: 'left',
              userSelect: 'none',
              overflow: 'hidden',
              transition: 'transform 120ms ease, box-shadow 120ms ease',
              '&:hover': {
                transform: isSelectable ? 'translateY(-1px)' : 'none',
                boxShadow: isSelectable ? 2 : 'none',
              },
              '&:disabled': { opacity: 1 },
              ...style,
            }}
          >
            <Stack spacing={0.35} sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap sx={{ lineHeight: 1.15 }}>
                {table.label}
              </Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
                  {table.capacity} kohta
                </Typography>
                <Typography variant="caption" noWrap sx={{ minWidth: 0 }}>
                  {zoneLabel}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Tooltip>
    </Box>
  )
}
