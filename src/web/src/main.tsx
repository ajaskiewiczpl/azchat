import CssBaseline from "@mui/material/CssBaseline";
import React from "react";
import ReactDOM from "react-dom/client";
import { Route, Routes, unstable_HistoryRouter as HistoryRouter, BrowserRouter } from "react-router-dom";
import App from "./App";
import customHistory from "./context/customHistory";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <>
        <React.StrictMode>
            <CssBaseline />
            <HistoryRouter history={customHistory}>
                <Routes>
                    <Route path="/*" element={<App />} />
                </Routes>
            </HistoryRouter>
        </React.StrictMode>
    </>
);
