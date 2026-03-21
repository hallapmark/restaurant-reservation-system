import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import type { LayoutFeature } from '../models/layout'
import {
  getFeatureGridPlacement,
  type LayoutBounds,
} from '../util/floorplan'

interface FloorplanFeatureTileProps {
  feature: LayoutFeature
  bounds: LayoutBounds
  venueWidthMeters: number
  venueHeightMeters: number
  gridColumns: number
  gridRows: number
}

export default function FloorplanFeatureTile({
  feature,
  bounds,
  venueWidthMeters,
  venueHeightMeters,
  gridColumns,
  gridRows,
}: FloorplanFeatureTileProps) {
  const { colStart, colSpan, rowStart, rowSpan } = getFeatureGridPlacement({
    feature,
    bounds,
    venueWidthMeters,
    venueHeightMeters,
    gridColumns,
    gridRows,
  })

  return (
    <Box
      sx={(theme) => {
        const baseStyle =
          feature.type === 'PRIVATE_ROOM'
            ? {
                backgroundColor: alpha(theme.palette.secondary.main, 0.06),
                borderColor: alpha(theme.palette.secondary.main, 0.28),
                borderStyle: 'solid',
                color: theme.palette.secondary.dark,
                borderRadius: 3,
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                flexDirection: 'column',
              }
            : feature.type === 'PLAY_AREA'
              ? {
                backgroundColor: alpha(theme.palette.success.main, 0.08),
                borderColor: alpha(theme.palette.success.main, 0.28),
                borderStyle: 'dashed',
                color: theme.palette.text.secondary,
                borderRadius: 3,
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                flexDirection: 'column',
              }
              : {
                  backgroundColor: alpha(theme.palette.warning.main, 0.06),
                  borderColor: alpha(theme.palette.warning.main, 0.22),
                  borderStyle: 'dashed',
                  color: theme.palette.text.secondary,
                  borderRadius: 999,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                }

        return {
          gridColumn: `${colStart} / span ${colSpan}`,
          gridRow: `${rowStart} / span ${rowSpan}`,
          minWidth: 0,
          minHeight: feature.type === 'WINDOW_BAND' ? 20 : 56,
          display: 'flex',
          p: feature.type === 'WINDOW_BAND' ? 0.25 : 0.9,
          borderWidth: feature.type === 'WINDOW_BAND' ? 1 : 2,
          position: 'relative',
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          ...baseStyle,
        }
      }}
    >
      <Typography
        variant="caption"
        sx={(theme) => ({
          fontWeight: 700,
          letterSpacing: feature.type === 'WINDOW_BAND' ? '0.03em' : '0.01em',
          textTransform: feature.type === 'WINDOW_BAND' ? 'uppercase' : 'none',
          textAlign: feature.type === 'WINDOW_BAND' ? 'center' : 'right',
          fontSize: feature.type === 'WINDOW_BAND' ? '0.68rem' : undefined,
          px: feature.type === 'PRIVATE_ROOM' ? 0.75 : 0.4,
          py: feature.type === 'PRIVATE_ROOM' ? 0.2 : 0,
          borderRadius: feature.type === 'PRIVATE_ROOM' ? 999 : 0,
          backgroundColor:
            feature.type === 'PRIVATE_ROOM'
              ? alpha(theme.palette.background.paper, 0.92)
              : 'transparent',
        })}
      >
        {feature.label}
      </Typography>
    </Box>
  )
}
