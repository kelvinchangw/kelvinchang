import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Fonts (self-hosted Fragment Mono, regular + italic)
import "@fontsource/fragment-mono/index.css";
import "@fontsource/fragment-mono/400-italic.css";

// Styles
import "./styles/reset.css";
import "./styles/variables.css";
import "./styles/global.css";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
