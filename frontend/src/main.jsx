import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Renderizo la aplicación dentro del nodo 'root' del HTML
ReactDOM.createRoot(document.getElementById("root")).render(
  // Uso StrictMode para detectar problemas potenciales durante el desarrollo
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
