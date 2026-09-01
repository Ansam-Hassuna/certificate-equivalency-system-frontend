import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./styles/tokens.css";
import "./styles/themes.css";
import "./pages/workflow/workflow.css";
import "./styles/globals.css";
import "./components/ui/ui.css";
import "./styles/app.css";
import "./styles/modern-system.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element with id="root" was not found.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
