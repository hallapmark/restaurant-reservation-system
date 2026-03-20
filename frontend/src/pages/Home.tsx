import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

function Home() {
  const theme = useTheme()

  const paletteSwatches = [
    { label: 'Primary', color: theme.palette.primary.main },
    { label: 'Secondary', color: theme.palette.secondary.main },
    { label: 'Warning', color: theme.palette.warning.main },
    { label: 'Success', color: theme.palette.success.main },
    { label: 'Background', color: theme.palette.background.default },
  ]

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 4, md: 8 },
        background:
          'radial-gradient(circle at 5% 0%, rgba(180, 58, 47, 0.14), transparent 35%), radial-gradient(circle at 95% 10%, rgba(95, 64, 56, 0.12), transparent 30%)',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Paper sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2}>
              <Chip
                label="Nutikas Restorani Reserveerimissusteem"
                color="secondary"
                sx={{ width: 'fit-content' }}
              />
              <Typography variant="h2" component="h1">
                Home Theme Demo
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Warm red tones keep the visual style food-centric while remaining clean and practical
                for booking workflows.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button variant="contained" color="primary">
                  New Reservation
                </Button>
                <Button variant="outlined" color="secondary">
                  Check Availability
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Grid container spacing={2}>
            {paletteSwatches.map((swatch) => (
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={swatch.label}>
                <Card variant="outlined">
                  <CardContent>
                    <Box
                      sx={{
                        height: 72,
                        borderRadius: 2,
                        mb: 1.5,
                        backgroundColor: swatch.color,
                        border: '1px solid rgba(0,0,0,0.08)',
                      }}
                    />
                    <Typography variant="subtitle2">{swatch.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {swatch.color.toUpperCase()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Paper sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h3" gutterBottom>
              Demo text
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.2}>
              <Typography color="text.secondary">Excellent, the tables have turned</Typography>
              <Typography color="text.secondary">Ich werde in Restaurant gehen</Typography>
              <Typography color="text.secondary">Je suis une gourmande</Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  )
}

export default Home
