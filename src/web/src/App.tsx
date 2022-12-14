import React, { useEffect, useState } from "react";
import { redirect, useNavigate, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, Theme } from "@mui/material/styles";
import blue from "@mui/material/colors/blue";
import "./App.css";
import Layout from "./Pages/Layout";
import SignInPage from "./Pages/SignInPage";
import SignUpPage from "./Pages/SignUpPage";
import HomePage from "./Pages/HomePage";
import Forbidden from "./Pages/Forbidden";
import { AuthProvider } from "./context/AuthProvider";
import RequireAuth from "./components/RequireAuth";
import RequireNoAuth from "./components/RequireNoAuth";

const theme: Theme = createTheme({
    palette: {
        primary: blue,
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route element={<RequireNoAuth />}>
                            <Route path="/signin" element={<SignInPage />} />
                            <Route path="/signup" element={<SignUpPage />} />
                        </Route>
                        <Route path="/forbidden" element={<Forbidden />} />

                        <Route element={<RequireAuth />}>
                            <Route path="/" element={<HomePage />} />
                        </Route>

                        <Route path="*" element={<Navigate to="/" />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
