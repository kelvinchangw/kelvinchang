/**
 * Resolves once every face in `fonts` (CSS font shorthands such as `14px "Fragment Mono"`) has loaded, or as soon as
 * one of them fails, or after `timeoutMs`, whichever comes first. Resolves at once where the CSS Font Loading API is
 * missing. Holding the first render on it means text does not paint in a fallback font and then swap, as long as the
 * faces load within `timeoutMs`.
 *
 * A shorthand matches no face while the stylesheet declaring it is still loading, and WebKit runs module scripts before
 * pending stylesheets. So when a shorthand matches nothing, the wait lets every stylesheet still loading finish, then
 * asks once more.
 */
export function waitForFonts(fonts: readonly string[], timeoutMs: number): Promise<void> {
    const fontSet: FontFaceSet | undefined = document.fonts;
    if (!fontSet || typeof fontSet.load !== "function") return Promise.resolve();
    return new Promise((resolve) => {
        const timer = window.setTimeout(resolve, timeoutMs);
        const settle = () => {
            window.clearTimeout(timer);
            resolve();
        };
        const loadAll = () => Promise.all(fonts.map((font) => fontSet.load(font)));
        const unmatched = (matches: FontFace[][]) => matches.some((faces) => faces.length === 0);
        // Never reject: a render held back by a font that cannot be checked is worse than any flash.
        try {
            loadAll()
                .then((matches) => (unmatched(matches) ? stylesheetsLoaded().then(loadAll) : null))
                .then(settle, settle);
        } catch {
            settle();
        }
    });
}

/** Resolves once every `<link rel="stylesheet">` that has no sheet yet has loaded or failed. */
function stylesheetsLoaded(): Promise<unknown[]> {
    const links = Array.from(document.querySelectorAll<HTMLLinkElement>("link[rel~=stylesheet]"));
    const pending = links.filter((link) => !link.sheet);
    return Promise.all(
        pending.map(
            (link) =>
                new Promise((done) => {
                    link.addEventListener("load", done, { once: true });
                    link.addEventListener("error", done, { once: true });
                }),
        ),
    );
}
