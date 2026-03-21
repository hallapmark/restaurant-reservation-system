import { Box, Chip, Container, Paper, Stack, Typography } from '@mui/material'
import LayoutView from '../components/LayoutView'

// This page is AI-generated, verified and trimmed by me

function Home() {
  return (
    <Box
      sx={{
        py: { xs: 4, md: 8 },
        background:
          'radial-gradient(circle at 5% 0%, rgba(180, 58, 47, 0.14), transparent 35%), radial-gradient(circle at 95% 10%, rgba(95, 64, 56, 0.12), transparent 30%)',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Paper sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={1.8}>
              <Chip label="Nutikas Restorani Reserveerimissüsteem" color="secondary" sx={{ width: 'fit-content' }} />
              <Typography variant="h3" component="h1"> 
                { /* Interesting feature of mui - lets us set the dom html tag as h1 for SEO etc
                while controlling the visual style with the variant.*/}
                Tere tulemast! Broneeri laud.
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Leia sobiv laud oma seltskonnale, filtreeri tulemusi ja vali soovitus otse
                saaliplaanilt.
              </Typography>
            </Stack>
          </Paper>

          <LayoutView />
        </Stack>
      </Container>
    </Box>
  )
}

export default Home
