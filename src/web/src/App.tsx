import React, { useEffect, useState } from "react";
import logo from './logo.svg';
import './App.css';
import { ApiClient } from "./api/ApiClient";

function App() {

  const [healthCheckResponse, setHealthCheckResponse] = useState(false);

  useEffect(() => {
    async function healthCheck() {
      try {
        let api = new ApiClient();
        let response = await api.health.getApiHealthCheck();
        setHealthCheckResponse(response);
      } catch (error: any) {
        console.error(error);
      }
    }

    healthCheck();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          {healthCheckResponse ? "It works!" : "Error :("}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >

        </a>
      </header>
    </div>
  );
}

export default App;
