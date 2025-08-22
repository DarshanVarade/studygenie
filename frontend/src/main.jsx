import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
// --- SWAP THESE TWO LINES ---
import "./index.css"; // Import this first
import "./App.css"; // Import this second
// --------------------------

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
