// This theme is AI generated

import { createTheme } from '@mui/material/styles'

export const restaurantTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#B43A2F',
      light: '#D86A60',
      dark: '#8C2A22',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#5F4038',
      light: '#8A675E',
      dark: '#3F2924',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#C97C2E',
    },
    success: {
      main: '#3F7D4E',
    },
    background: {
      default: '#F7F3EF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2A1E1A',
      secondary: '#6B5A53',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Manrope", "Avenir Next", "Segoe UI", sans-serif',
    h1: {
      fontFamily: '"Bitter", "Georgia", serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Bitter", "Georgia", serif',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Bitter", "Georgia", serif',
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 999,
          paddingInline: 18,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
})
