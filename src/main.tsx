import { StrictMode } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";

// Styles (fonts.css declares the self-hosted Fragment Mono faces)
import "./styles/fonts.css";
import "./styles/reset.css";
import "./styles/variables.css";
import "./styles/global.css";

import App from "./App.tsx";
import { waitForFonts } from "./lib/fonts";

/** The faces every page paints straight away (the rail's motd is italic); index.html preloads both. */
const FIRST_PAINT_FONTS = ["14px \"Fragment Mono\"", "italic 14px \"Fragment Mono\""];
/**
 * Longest the first render waits for them. Past this the page renders anyway and `font-display: block` keeps the text
 * invisible until the faces land, but only until 3 s after the request below (about 1 s more); a face slower than that
 * shows in the fallback font and swaps in.
 */
const FONT_WAIT_MS = 2000;

const root = createRoot(document.getElementById("root")!);

// Render once the typed look is ready (or the wait gives up), so the page does not flash the fallback font and swap.
// flushSync commits in this task: a plain render() lands in a later one, after the load event, and Chrome then applies
// a reloaded page's saved scroll offset to the still-empty root and leaves it at the top.
waitForFonts(FIRST_PAINT_FONTS, FONT_WAIT_MS).then(() => {
    flushSync(() => {
        root.render(
            <StrictMode>
                <App />
            </StrictMode>,
        );
    });
});
