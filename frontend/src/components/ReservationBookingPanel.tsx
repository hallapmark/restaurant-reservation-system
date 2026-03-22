import { Alert, Button, Stack, TextField, Typography } from '@mui/material'

interface ReservationBookingPanelProps {
  tableLabel: string
  tableId: string
  date: string
  time: string
  partySize: number
  customerName: string
  error: string | null
  submitting: boolean
  onCustomerNameChange: (value: string) => void
  onSubmit: () => void
}

export default function ReservationBookingPanel({
  tableLabel,
  tableId,
  date,
  time,
  partySize,
  customerName,
  error,
  submitting,
  onCustomerNameChange,
  onSubmit,
}: ReservationBookingPanelProps) {
  return (
    <Stack
      spacing={1.5}
      sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}
    >
      <Stack spacing={0.4}>
        <Typography variant="h6">Kinnita broneering</Typography>
        <Typography variant="body2" color="text.secondary">
          {tableLabel} ({tableId}) • {date} • {time} • {partySize} inimest
        </Typography>
      </Stack>

      <TextField
        label="Sinu nimi"
        value={customerName}
        onChange={(event) => onCustomerNameChange(event.target.value)}
        size="small"
        autoComplete="name"
      />

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Button
        variant="contained"
        onClick={onSubmit}
        disabled={submitting || customerName.trim() === ''}
        sx={{ alignSelf: 'flex-start' }}
      >
        {submitting ? 'Kinnitan...' : 'Kinnita broneering'}
      </Button>
    </Stack>
  )
}
