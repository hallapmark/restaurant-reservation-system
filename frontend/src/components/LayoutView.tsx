import {
  Alert,
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
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
  Recommendation,
  RecommendationPreference,
} from '../models/layout'
import FloorplanFeatureTile from './FloorplanFeatureTile'
import FloorplanTableTile from './FloorplanTableTile'
import RecommendationSummaryPanel from './RecommendationSummaryPanel'
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
const RECOMMENDATION_PREFERENCE_OPTIONS: Array<{
  value: RecommendationPreference
  label: string
}> = [
  { value: 'PRIVACY', label: 'Privaatsus' },
  { value: 'WINDOW', label: 'Akna all' },
  { value: 'NEAR_PLAY_AREA', label: 'Mängunurga lähedal' },
]

function getDefaultPlan(layout: LayoutResponse) {
  return layout.plans.find((plan) => plan.code === 'INDOOR')?.code ?? layout.plans[0]?.code ?? null
}

function getAllowedPreferencesForPlan(plan: PlanCode | null): RecommendationPreference[] {
  if (plan === 'TERRACE') {
    return ['PRIVACY']
  }

  return ['PRIVACY', 'WINDOW', 'NEAR_PLAY_AREA']
}

export default function LayoutView() {
  const [layout, setLayout] = useState<LayoutResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [recommendationError, setRecommendationError] = useState<string | null>(null)
  const [hasAvailabilityData, setHasAvailabilityData] = useState(false)
  const [activePlan, setActivePlan] = useState<PlanCode | null>(null)
  const [partySize, setPartySize] = useState(2)
  const [accessibleRequired, setAccessibleRequired] = useState(false)
  const [selectedPreferences, setSelectedPreferences] = useState<RecommendationPreference[]>([])
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState('19:00')
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [tableStatusById, setTableStatusById] = useState<Record<string, AvailabilityStatus>>({})
  const [topRecommendedTableId, setTopRecommendedTableId] = useState<string | null>(null)
  const [topRecommendation, setTopRecommendation] = useState<Recommendation | null>(null)
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null)
  const allowedPreferences = useMemo(
    () => getAllowedPreferencesForPlan(activePlan),
    [activePlan],
  )
  const visiblePreferenceOptions = useMemo(
    () =>
      RECOMMENDATION_PREFERENCE_OPTIONS.filter((option) =>
        allowedPreferences.includes(option.value),
      ),
    [allowedPreferences],
  )
  const activeRecommendationPreferences = useMemo(
    () =>
      selectedPreferences.filter((preference) => allowedPreferences.includes(preference)),
    [selectedPreferences, allowedPreferences],
  )

  useEffect(() => {
    let cancelled = false

    async function loadLayout() {
      setLoading(true)
      setLoadError(null)
      setRecommendationError(null)

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
          setTopRecommendation(null)
          setTopRecommendedTableId(null)
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
      setTopRecommendation(null)
      setRecommendationError(null)
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
      setRecommendationError(null)
      const request = {
        date,
        time,
        partySize,
        plan,
        accessibleRequired,
      }

      const [availabilityResult, recommendationsResult] = await Promise.allSettled([
        fetchAvailability(request),
        fetchRecommendations({ ...request, preferences: activeRecommendationPreferences }),
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
        setTopRecommendation(null)
        setRecommendationError(null)
        setLoading(false)
        return
      }

      if (recommendationsResult.status === 'fulfilled') {
        const nextTopRecommendationId = recommendationsResult.value.topRecommendationId
        setTopRecommendedTableId(nextTopRecommendationId)
        setTopRecommendation(
          nextTopRecommendationId == null
            ? null
            : recommendationsResult.value.recommendations.find(
                (recommendation) => recommendation.tableId === nextTopRecommendationId,
              ) ?? null,
        )
      } else {
        setRecommendationError('Soovituse päring ebaõnnestus. Saadavad lauad on siiski nähtavad.')
        setTopRecommendedTableId(null)
        setTopRecommendation(null)
      }

      if (!cancelled) {
        setLoading(false)
      }
    }

    loadStatusAndRecommendations()

    return () => {
      cancelled = true
    }
  }, [
    layout,
    activePlan,
    date,
    time,
    partySize,
    accessibleRequired,
    selectedPreferences,
    activeRecommendationPreferences,
  ])

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
  const { minX, minY, maxX, maxY } = useMemo(
    () => getLayoutBounds({ tables: planTables, features: planFeatures }),
    [planTables, planFeatures],
  )
  const zoneLabelsByCode = useMemo(
    () => Object.fromEntries((layout?.zones ?? []).map((zone) => [zone.code, zone.label])),
    [layout],
  )
  const topRecommendationTable = useMemo(
    () =>
      topRecommendedTableId == null
        ? null
        : planTables.find((table) => table.tableId === topRecommendedTableId) ?? null,
    [planTables, topRecommendedTableId],
  )

  function getUnavailableReasonLines(table: LayoutResponse['tables'][number]) {
    if (!hasAvailabilityData || tableStatusById[table.tableId] !== 'UNAVAILABLE') {
      return []
    }

    const reasonLines: string[] = []

    if (table.capacity < partySize) {
      reasonLines.push('Ei mahuta valitud seltskonda.')
    }

    if (accessibleRequired && !table.accessible) {
      reasonLines.push('Ei ole ligipääsetav.')
    }

    return reasonLines.length > 0 ? reasonLines : ['Ei sobi valitud tingimustega.']
  }

  function togglePreference(preference: RecommendationPreference) {
    setSelectedPreferences((currentPreferences) =>
      currentPreferences.includes(preference)
        ? currentPreferences.filter((currentPreference) => currentPreference !== preference)
        : [...currentPreferences, preference],
    )
  }

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
            <Stack spacing={0.8} sx={{ minWidth: { xs: '100%', md: 220 } }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Asukoht
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {(layout?.plans ?? []).map((plan) => {
                  const isSelected = activePlan === plan.code
                  return (
                    <Chip
                      key={plan.code}
                      label={plan.label}
                      clickable
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'filled' : 'outlined'}
                      onClick={() => {
                        setSelectionNotice(null)
                        setSelectedTableId(null)
                        setActivePlan(plan.code)
                      }}
                    />
                  )
                })}
              </Stack>
            </Stack>
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
          </Stack>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={accessibleRequired}
                  onChange={(event) => setAccessibleRequired(event.target.checked)}
                />
              }
              label="Ligipääsetavus vajalik"
            />
            <Typography variant="body2" color="text.secondary">
              Ligipääsetavuse nõue piirab sobivaid laudu kohe. Eelistused mõjutavad ainult
              soovituste järjestust.
            </Typography>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle2">Eelistused</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {visiblePreferenceOptions.map((option) => {
                const isSelected = selectedPreferences.includes(option.value)
                return (
                  <Chip
                    key={option.value}
                    label={option.label}
                    clickable
                    color={isSelected ? 'warning' : 'default'}
                    variant={isSelected ? 'filled' : 'outlined'}
                    onClick={() => togglePreference(option.value)}
                  />
                )
              })}
            </Stack>
            {activePlan === 'TERRACE' ? (
              <Typography variant="body2" color="text.secondary">
                Terrassil arvestatakse soovituste puhul ainult privaatsuse eelistust.
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </Paper>

      {layout ? (
        <Paper sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Parim soovitus</Typography>
            {loading ? (
              <Stack alignItems="center" py={2}>
                <CircularProgress size={28} />
              </Stack>
            ) : (
              <RecommendationSummaryPanel
                hasAvailabilityData={hasAvailabilityData}
                recommendationError={recommendationError}
                topRecommendation={topRecommendation}
                topRecommendationTable={topRecommendationTable}
                zoneLabel={
                  topRecommendationTable == null
                    ? null
                    : (zoneLabelsByCode[topRecommendationTable.zone] ?? topRecommendationTable.zone)
                }
              />
            )}
          </Stack>
        </Paper>
      ) : null}

      <Paper sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Saaliplaan</Typography>

          {layout?.plans.length ? (
            <Stack spacing={1}>
              <Tabs
                value={activePlan ?? getDefaultPlan(layout)}
                onChange={(_event, nextValue: PlanCode) => {
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
                  stateDetailLines={getUnavailableReasonLines(table)}
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
