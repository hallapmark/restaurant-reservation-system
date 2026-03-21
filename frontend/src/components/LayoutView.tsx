import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import type {
  AvailabilityStatus,
  LayoutResponse,
  ZoneCode,
} from '../models/layout'
import {
  fetchAvailability,
  fetchLayout,
  fetchRecommendations,
} from '../services/reservationApi'
import {
  getLayoutBounds,
  getTableDisplayState,
  type TableDisplayState,
} from '../util/floorplan'

const GRID_COLUMNS = 12
const GRID_ROWS = 8

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

export default function LayoutView() {
  const [layout, setLayout] = useState<LayoutResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [hasAvailabilityData, setHasAvailabilityData] = useState(false)
  const [partySize, setPartySize] = useState(2)
  const [zoneFilter, setZoneFilter] = useState<ZoneCode | 'ALL'>('ALL')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState('19:00')
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [tableStatusById, setTableStatusById] = useState<Record<string, AvailabilityStatus>>({})
  const [recommendedTableIds, setRecommendedTableIds] = useState<Set<string>>(new Set())
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadLayout() {
      setLoading(true)
      setLoadError(null)

      try {
        const payload = await fetchLayout()
        if (!cancelled) {
          setLayout(payload)
        }
      } catch {
        if (!cancelled) {
          setLayout(null)
          setLoadError('Saaliplaani laadimine ebaõnnestus. Palun proovi hiljem uuesti.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadLayout()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!layout) {
      setHasAvailabilityData(false)
      setTableStatusById({})
      setRecommendedTableIds(new Set())
      return
    }

    let cancelled = false

    async function loadStatusAndRecommendations() {
      setLoading(true)
      setLoadError(null)
      const request = {
        date,
        time,
        partySize,
        zone: zoneFilter === 'ALL' ? undefined : zoneFilter,
      }

      const [availabilityResult, recommendationsResult] = await Promise.allSettled([
        fetchAvailability(request),
        fetchRecommendations({ ...request, preferences: [] }),
      ])

      if (cancelled) {
        return
      }

      if (availabilityResult.status === 'fulfilled') {
        setHasAvailabilityData(true)
        setTableStatusById(availabilityResult.value.tableStatusById)
      } else {
        setHasAvailabilityData(false)
        setLoadError(
          'Saadavuse infot ei õnnestunud laadida. Saaliplaan on ajutiselt ainult vaatamiseks.',
        )
        setSelectionNotice(null)
        setSelectedTableId(null)
        setTableStatusById({})
        setRecommendedTableIds(new Set())
        setLoading(false)
        return
      }

      if (recommendationsResult.status === 'fulfilled') {
        setRecommendedTableIds(
          new Set(recommendationsResult.value.recommendations.map((item) => item.tableId)),
        )
      } else {
        setLoadError('Soovituse päring ebaõnnestus. Saadavad lauad on siiski nähtavad.')
        setRecommendedTableIds(new Set())
      }

      if (!cancelled) {
        setLoading(false)
      }
    }

    loadStatusAndRecommendations()

    return () => {
      cancelled = true
    }
  }, [layout, date, time, partySize, zoneFilter])

  useEffect(() => {
    if (!selectedTableId) {
      return
    }

    const selectedStatus = tableStatusById[selectedTableId]
    if (!selectedStatus || selectedStatus === 'AVAILABLE') {
      return
    }

    setSelectedTableId(null)
    setSelectionNotice(
      selectedStatus === 'RESERVED'
        ? `Laua ${selectedTableId} saadavus muutus. See laud on valitud ajaks broneeritud.`
        : `Laua ${selectedTableId} saadavus muutus. See laud ei sobi enam valitud tingimustega.`,
    )
  }, [selectedTableId, tableStatusById])

  const { minX, minY, maxX, maxY } = useMemo(() => getLayoutBounds(layout), [layout])

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Filtrid</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              type="date"
              label="Kuupäev"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ width: { xs: '100%', md: 200 } }}
            />
            <TextField
              type="time"
              label="Aeg"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ width: { xs: '100%', md: 160 } }}
            />
            <TextField
              type="number"
              label="Seltskonna suurus"
              value={partySize}
              onChange={(event) => {
                const nextValue = Number(event.target.value)
                if (Number.isNaN(nextValue)) {
                  return
                }
                setPartySize(Math.max(1, Math.min(20, nextValue)))
              }}
              slotProps={{ htmlInput: { min: 1, max: 20 } }}
              sx={{ width: { xs: '100%', md: 220 } }}
            />
            <TextField
              select
              label="Tsoon"
              value={zoneFilter}
              onChange={(event) => setZoneFilter(event.target.value as 'ALL' | ZoneCode)}
              sx={{ width: { xs: '100%', md: 220 } }}
            >
              <MenuItem value="ALL">Kõik tsoonid</MenuItem>
              {(layout?.zones ?? []).map((zone) => (
                <MenuItem key={zone.code} value={zone.code}>
                  {zone.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            UNAVAILABLE tekib siis, kui laud ei vasta kohustuslikele kriteeriumidele (seltskonna
            suurus või tsoon). Eelistused lisanduvad hiljem soovituste vaates.
          </Typography>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Saaliplaan</Typography>

          {loading ? (
            <Stack alignItems="center" py={4}>
              <CircularProgress size={32} />
            </Stack>
          ) : null}

          {loadError ? <Alert severity="error">{loadError}</Alert> : null}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${GRID_ROWS}, minmax(56px, auto))`,
              gap: 1,
            }}
          >
            {(layout?.tables ?? []).map((table) => {
              const availabilityStatus = tableStatusById[table.tableId] ?? 'UNAVAILABLE'
              const isSelectable = hasAvailabilityData && availabilityStatus === 'AVAILABLE'
              const displayState = getTableDisplayState({
                availabilityStatus,
                selectedTableId,
                tableId: table.tableId,
                recommendedTableIds,
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

              const colIndex =
                Math.round(((table.center.x - minX) / Math.max(maxX - minX, 1)) * (GRID_COLUMNS - 1)) +
                1
              const rowIndex =
                Math.round(((table.center.y - minY) / Math.max(maxY - minY, 1)) * (GRID_ROWS - 1)) + 1

              return (
                <Box
                  key={table.tableId}
                  sx={{
                    gridColumn: `${colIndex} / span 1`,
                    gridRow: `${rowIndex} / span 1`,
                    minWidth: 0,
                  }}
                >
                  <Tooltip title={stateLabel} arrow placement="top">
                    <Box component="span" sx={{ display: 'block' }}>
                      <Box
                        component="button"
                        type="button"
                        disabled={!isSelectable}
                        aria-pressed={selectedTableId === table.tableId}
                        aria-label={`${table.label}. ${stateLabel}.`}
                        onClick={() => {
                          setSelectionNotice(null)
                          setSelectedTableId(table.tableId)
                        }}
                        sx={{
                          appearance: 'none',
                          background: 'none',
                          width: '100%',
                          p: 1.2,
                          borderRadius: 2,
                          borderWidth: 2,
                          cursor: isSelectable ? 'pointer' : 'not-allowed',
                          font: 'inherit',
                          textAlign: 'left',
                          userSelect: 'none',
                          transition: 'transform 120ms ease, box-shadow 120ms ease',
                          '&:hover': {
                            transform: isSelectable ? 'translateY(-1px)' : 'none',
                            boxShadow: isSelectable ? 2 : 'none',
                          },
                          '&:disabled': { opacity: 1 },
                          ...style,
                        }}
                      >
                        <Stack spacing={0.2}>
                          <Typography variant="subtitle2" sx={{ lineHeight: 1.15 }}>
                            {table.label}
                          </Typography>
                          <Typography variant="caption">{table.capacity} kohta</Typography>
                          <Typography variant="caption">{table.zone}</Typography>
                        </Stack>
                      </Box>
                    </Box>
                  </Tooltip>
                </Box>
              )
            })}
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" label="Valitud" color="primary" />
            <Chip size="small" label="Soovitatud" color="warning" />
            <Chip size="small" label="Vaba" sx={{ backgroundColor: 'success.light' }} />
            <Chip size="small" label="Broneeritud" sx={{ backgroundColor: 'grey.300' }} />
            <Chip size="small" label="Ei sobi" sx={{ backgroundColor: 'grey.100' }} />
          </Stack>

          {selectionNotice ? (
            <Alert severity="warning">{selectionNotice}</Alert>
          ) : selectedTableId ? (
            <Alert severity="success">Valisid laua {selectedTableId}.</Alert>
          ) : (
            <Alert severity="info">Vali saaliplaanilt laud.</Alert>
          )}
        </Stack>
      </Paper>
    </Stack>
  )
}
