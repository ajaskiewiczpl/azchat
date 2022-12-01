import React, { useEffect, useState } from "react";
import { redirect, useNavigate, Route, Routes, BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import blue from '@mui/material/colors/blue';
import logo from './logo.svg';
import './App.css';
import { ApiClient } from "./api/ApiClient";
import SignInPage from "./Pages/SignInPage";
import SignUpPage from "./Pages/SignUpPage";
import HomePage from "./Pages/HomePage";

const theme = createTheme({
  palette: {
    primary: blue
  }
});

function App() {

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;
