import React, { useEffect, useState } from "react";
import { redirect, useNavigate, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, Theme } from "@mui/material/styles";
import blue from "@mui/material/colors/blue";
import "./App.css";
import Layout from "./Pages/Layout";
import SignInPage from "./Pages/Identity/SignInPage";
import SignUpPage from "./Pages/Identity/SignUpPage";
import MainPageLayout from "./Pages/MainPageLayout";
import Forbidden from "./Pages/Forbidden";
import { AuthProvider } from "./context/AuthProvider";
import RequireAuth from "./components/RequireAuth";
import RequireNoAuth from "./components/RequireNoAuth";
import Profile from "./Pages/Profile/Profile";
import Messages from "./Pages/Messages/Messages";
import Home from "./Pages/Home";
import Settings from "./Pages/Settings/Settings";
import { SnackbarProvider } from "notistack";
import { Provider } from "react-redux";
import store from "./redux/store";
import Admin from "./Pages/Admin/Admin";
import { Roles } from "./misc/roles";

const theme: Theme = createTheme({
    palette: {
        primary: blue,
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <SnackbarProvider>
                <AuthProvider>
                    <Provider store={store}>
                        <Routes>
                            <Route path="/" element={<Layout />}>
                                <Route element={<RequireNoAuth />}>
                                    <Route path="/signin" element={<SignInPage />} />
                                    <Route path="/signup" element={<SignUpPage />} />
                                </Route>

                                <Route element={<RequireAuth />}>
                                    <Route path="/" element={<MainPageLayout />}>
                                        <Route index element={<Home />} />
                                        <Route path="/messages/*" element={<Messages />} />
                                        <Route path="/profile" element={<Profile />} />
                                        <Route path="/settings" element={<Settings />} />
                                    </Route>
                                </Route>

                                <Route element={<RequireAuth allowedRoles={[Roles.ADMIN]} />}>
                                    <Route path="/admin" element={<MainPageLayout />}>
                                        <Route index element={<Admin />} />
                                    </Route>
                                </Route>

                                <Route path="/forbidden" element={<Forbidden />} />
                                <Route path="*" element={<Navigate to="/" />} />
                            </Route>
                        </Routes>
                    </Provider>
                </AuthProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
}

export default App;
