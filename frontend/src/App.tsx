

import './App.css'
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from "@mui/material/styles";
// import restaurantTheme from "./theme";

import { useState } from 'react'
import { Route, Routes } from "react-router-dom";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';




function App() {

  return (
     <ThemeProvider theme={restaurantTheme}>
      {/* see https://mui.com/material-ui/react-css-baseline/ */}
      <CssBaseline />
      <ToastContainer position="bottom-right" autoClose={4000} theme="dark" />
      
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App
