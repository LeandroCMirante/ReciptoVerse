import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

console.log("🚀 Main.jsx executing...");

const rootElement = document.getElementById("root");
console.log("🎯 Root element found:", !!rootElement);

if (rootElement) {
  const root = createRoot(rootElement);
  console.log("✅ React root created, rendering App...");

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error("❌ Root element not found!");
}
