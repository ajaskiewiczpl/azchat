import React from "react";
import ReactDOM from "react-dom/client";
import { redirect, useNavigate, Route, Routes, unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import App from "./App";
import customHistory from "./context/customHistory";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <HistoryRouter history={customHistory}>
            <Routes>
                <Route path="/*" element={<App />} />
            </Routes>
        </HistoryRouter>
    </React.StrictMode>
);
