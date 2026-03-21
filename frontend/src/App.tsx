// This setup is authored by me and follows my preferred React patterns

import './App.css'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from './pages/Home'
import ThemeDemo from './pages/ThemeDemo.tsx'
import { restaurantTheme } from './theme.ts'

function App() {
  return (
    <ThemeProvider theme={restaurantTheme}>
      <CssBaseline />
      <ToastContainer position="bottom-right" autoClose={4000} theme="light" />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/theme" element={<ThemeDemo />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
