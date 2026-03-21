import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import type {
  AvailabilityStatus,
  LayoutResponse,
  PlanCode,
  ZoneCode,
} from '../models/layout'
import FloorplanFeatureTile from './FloorplanFeatureTile'
import FloorplanTableTile from './FloorplanTableTile'
import {
  fetchAvailability,
  fetchLayout,
  fetchRecommendations,
} from '../services/reservationApi'
import {
  getLayoutBounds,
} from '../util/floorplan'

const GRID_COLUMNS = 12
const GRID_ROWS = 8
const ALL_ZONES = 'ALL'
const ZONE_ORDER: ZoneCode[] = ['INDOOR', 'PRIVATE', 'TERRACE']

function getDefaultPlan(layout: LayoutResponse) {
  return layout.plans.find((plan) => plan.code === 'INDOOR')?.code ?? layout.plans[0]?.code ?? null
}

export default function LayoutView() {
  const [layout, setLayout] = useState<LayoutResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [hasAvailabilityData, setHasAvailabilityData] = useState(false)
  const [activePlan, setActivePlan] = useState<PlanCode | null>(null)
  const [partySize, setPartySize] = useState(2)
  const [zoneFilter, setZoneFilter] = useState<ZoneCode | typeof ALL_ZONES>(ALL_ZONES)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState('19:00')
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [tableStatusById, setTableStatusById] = useState<Record<string, AvailabilityStatus>>({})
  const [topRecommendedTableId, setTopRecommendedTableId] = useState<string | null>(null)
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
          setActivePlan((currentPlan) => {
            if (currentPlan && payload.plans.some((plan) => plan.code === currentPlan)) {
              return currentPlan
            }
            return getDefaultPlan(payload)
          })
        }
      } catch {
        if (!cancelled) {
          setLayout(null)
          setActivePlan(null)
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
    if (!layout || !activePlan) {
      setHasAvailabilityData(false)
      setTableStatusById({})
      setTopRecommendedTableId(null)
      return
    }

    let cancelled = false

    async function loadStatusAndRecommendations() {
      const plan = activePlan
      if (!plan) {
        return
      }

      setLoading(true)
      setLoadError(null)
      const request = {
        date,
        time,
        partySize,
        plan,
        zone: zoneFilter === ALL_ZONES ? undefined : zoneFilter,
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
        setTopRecommendedTableId(null)
        setLoading(false)
        return
      }

      if (recommendationsResult.status === 'fulfilled') {
        setTopRecommendedTableId(recommendationsResult.value.topRecommendationId)
      } else {
        setLoadError('Soovituse päring ebaõnnestus. Saadavad lauad on siiski nähtavad.')
        setTopRecommendedTableId(null)
      }

      if (!cancelled) {
        setLoading(false)
      }
    }

    loadStatusAndRecommendations()

    return () => {
      cancelled = true
    }
  }, [layout, activePlan, date, time, partySize, zoneFilter])

  const planTables = useMemo(
    () => layout?.tables.filter((table) => table.plan === activePlan) ?? [],
    [layout, activePlan],
  )
  const planFeatures = useMemo(
    () => layout?.features.filter((feature) => feature.plan === activePlan) ?? [],
    [layout, activePlan],
  )
  const activePlanSummary = useMemo(
    () => layout?.plans.find((plan) => plan.code === activePlan) ?? null,
    [layout, activePlan],
  )
  const zoneOptions = useMemo(() => {
    const planZoneCodes = new Set(planTables.map((table) => table.zone))
    return ZONE_ORDER.filter((zoneCode) => planZoneCodes.has(zoneCode))
  }, [planTables])
  const { minX, minY, maxX, maxY } = useMemo(
    () => getLayoutBounds({ tables: planTables, features: planFeatures }),
    [planTables, planFeatures],
  )
  const zoneLabelsByCode = useMemo(
    () => Object.fromEntries((layout?.zones ?? []).map((zone) => [zone.code, zone.label])),
    [layout],
  )

  useEffect(() => {
    if (zoneFilter !== ALL_ZONES && !zoneOptions.includes(zoneFilter)) {
      setZoneFilter(ALL_ZONES)
    }
  }, [zoneFilter, zoneOptions])

  useEffect(() => {
    if (selectedTableId && !planTables.some((table) => table.tableId === selectedTableId)) {
      setSelectedTableId(null)
      setSelectionNotice(null)
    }
  }, [selectedTableId, planTables])

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
              onChange={(event) =>
                setZoneFilter(event.target.value as typeof ALL_ZONES | ZoneCode)
              }
              disabled={!activePlan}
              sx={{ width: { xs: '100%', md: 220 } }}
            >
              <MenuItem value={ALL_ZONES}>Kõik tsoonid</MenuItem>
              {zoneOptions.map((zoneCode) => (
                <MenuItem key={zoneCode} value={zoneCode}>
                  {zoneLabelsByCode[zoneCode] ?? zoneCode}
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

          {layout?.plans.length ? (
            <Stack spacing={1}>
              <Tabs
                value={activePlan ?? getDefaultPlan(layout)}
                onChange={(_event, nextValue: PlanCode) => {
                  const nextZoneIsValid =
                    zoneFilter === ALL_ZONES ||
                    layout.tables.some(
                      (table) => table.plan === nextValue && table.zone === zoneFilter,
                    )
                  if (!nextZoneIsValid) {
                    setZoneFilter(ALL_ZONES)
                  }
                  setSelectionNotice(null)
                  setSelectedTableId(null)
                  setActivePlan(nextValue)
                }}
                variant="scrollable"
                allowScrollButtonsMobile
              >
                {layout.plans.map((plan) => (
                  <Tab key={plan.code} value={plan.code} label={plan.label} />
                ))}
              </Tabs>
              {activePlanSummary ? (
                <Typography variant="body2" color="text.secondary">
                  {activePlanSummary.description}
                </Typography>
              ) : null}
            </Stack>
          ) : null}

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
            {planFeatures.map((feature) => (
              <FloorplanFeatureTile
                key={feature.featureId}
                feature={feature}
                bounds={{ minX, minY, maxX, maxY }}
                venueWidthMeters={layout?.venueWidthMeters ?? 1}
                venueHeightMeters={layout?.venueHeightMeters ?? 1}
                gridColumns={GRID_COLUMNS}
                gridRows={GRID_ROWS}
              />
            ))}

            {planTables.map((table) => {
              const availabilityStatus = tableStatusById[table.tableId] ?? 'UNAVAILABLE'
              return (
                <FloorplanTableTile
                  key={table.tableId}
                  table={table}
                  availabilityStatus={availabilityStatus}
                  bounds={{ minX, minY, maxX, maxY }}
                  venueWidthMeters={layout?.venueWidthMeters ?? 1}
                  venueHeightMeters={layout?.venueHeightMeters ?? 1}
                  gridColumns={GRID_COLUMNS}
                  gridRows={GRID_ROWS}
                  hasAvailabilityData={hasAvailabilityData}
                  isSelected={selectedTableId === table.tableId}
                  isRecommended={topRecommendedTableId === table.tableId}
                  zoneLabel={zoneLabelsByCode[table.zone] ?? table.zone}
                  onSelect={(tableId) => {
                    setSelectionNotice(null)
                    setSelectedTableId(tableId)
                  }}
                />
              )
            })}
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" label="Valitud" color="primary" />
            <Chip size="small" label="Soovitatud" color="warning" />
            <Chip size="small" label="Vaba" sx={{ backgroundColor: 'success.light' }} />
            <Chip size="small" label="Broneeritud" sx={{ backgroundColor: 'grey.300' }} />
            <Chip size="small" label="Ei sobi" sx={{ backgroundColor: 'grey.100' }} />
            <Chip size="small" label="Ala" variant="outlined" />
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
