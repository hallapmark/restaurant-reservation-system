import {
  Alert,
  Chip,
  Stack,
  Typography,
} from '@mui/material'
import type { LayoutTable, Recommendation } from '../models/layout'

interface RecommendationSummaryPanelProps {
  hasAvailabilityData: boolean
  recommendationError: string | null
  topRecommendation: Recommendation | null
  topRecommendationTable: LayoutTable | null
  zoneLabel: string | null
}

export default function RecommendationSummaryPanel({
  hasAvailabilityData,
  recommendationError,
  topRecommendation,
  topRecommendationTable,
  zoneLabel,
}: RecommendationSummaryPanelProps) {
  if (recommendationError) {
    return <Alert severity="warning">{recommendationError}</Alert>
  }

  if (!hasAvailabilityData) {
    return (
      <Alert severity="info">
        Soovitus kuvatakse siis, kui saadavuse info on edukalt laaditud.
      </Alert>
    )
  }

  if (!topRecommendation || !topRecommendationTable) {
    return (
      <Alert severity="info">
        Praeguste tingimustega ei leitud ühtegi sobivat soovitust.
      </Alert>
    )
  }

  return (
    <Stack spacing={1.2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {topRecommendationTable.label}
        </Typography>
        {zoneLabel ? <Chip size="small" variant="outlined" label={zoneLabel} /> : null}
      </Stack>

      <Typography variant="body2" color="text.secondary">
        Parim laud vastavalt valitud tingimustele ja eelistustele.
      </Typography>

      <Stack spacing={0.6}>
        {topRecommendation.reasons.slice(0, 3).map((reason) => (
          <Typography key={reason} variant="body2">
            • {reason}
          </Typography>
        ))}
      </Stack>
    </Stack>
  )
}
