import {
  Alert,
  Box,
  Button,
  Chip,
  Drawer,
  Stack,
  Typography,
} from '@mui/material'
import type { DrawerProps } from '@mui/material'
import type { AvailabilitySlot } from '../models/layout'

interface AvailabilitySlotsDrawerProps {
  open: boolean
  anchor: DrawerProps['anchor']
  onClose: () => void
  loading: boolean
  error: string | null
  slots: AvailabilitySlot[]
  selectedTime: string
  planLabel: string | null
  date: string
  partySize: number
  accessibleRequired: boolean
  onSelectTime: (time: string) => void
}

export default function AvailabilitySlotsDrawer({
  open,
  anchor,
  onClose,
  loading,
  error,
  slots,
  selectedTime,
  planLabel,
  date,
  partySize,
  accessibleRequired,
  onSelectTime,
}: AvailabilitySlotsDrawerProps) {
  return (
    <Drawer
      open={open}
      anchor={anchor}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: anchor === 'right' ? { xs: '100%', sm: 380 } : '100%',
            maxHeight: anchor === 'bottom' ? '70vh' : '100vh',
            p: 2.5,
          },
        },
      }}
    >
      <Stack spacing={2}>
        <Stack spacing={0.8}>
          <Typography variant="h6">Vabad ajad</Typography>
          <Typography variant="body2" color="text.secondary">
            {planLabel ?? 'Valitud ala'} • {date} • {partySize} inimest
          </Typography>
          {accessibleRequired ? (
            <Chip size="small" variant="outlined" label="Ligipääsetavus vajalik" />
          ) : null}
        </Stack>

        {loading ? (
          <Typography variant="body2" color="text.secondary">
            Otsin lähimaid sobivaid kellaaegu...
          </Typography>
        ) : null}

        {error ? <Alert severity="warning">{error}</Alert> : null}

        {!loading && !error && slots.length === 0 ? (
          <Alert severity="info">
            Praeguste tingimustega ei leitud läheduses ühtegi sobivat vaba aega.
          </Alert>
        ) : null}

        {!loading && !error ? (
          <Stack spacing={1}>
            {slots.map((slot) => {
              const isSelected = slot.time === selectedTime
              return (
                <Box
                  key={slot.time}
                  sx={{
                    border: 1,
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    p: 1.4,
                    backgroundColor: isSelected ? 'action.selected' : 'background.paper',
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                  >
                    <Stack spacing={0.4}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {slot.time}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {slot.availableTableCount} sobivat lauda
                      </Typography>
                      {slot.topRecommendationId ? (
                        <Typography variant="body2" color="text.secondary">
                          Parim laud: {slot.topRecommendationId}
                        </Typography>
                      ) : null}
                    </Stack>

                    <Button
                      variant={isSelected ? 'contained' : 'outlined'}
                      onClick={() => onSelectTime(slot.time)}
                    >
                      Vali aeg
                    </Button>
                  </Stack>
                </Box>
              )
            })}
          </Stack>
        ) : null}
      </Stack>
    </Drawer>
  )
}
