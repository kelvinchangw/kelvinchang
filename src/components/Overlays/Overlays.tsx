import styles from "./Overlays.module.css";

/** Full-viewport CRT overlays: optional scanlines plus the tube vignette. Never intercept input. */
export default function Overlays({ scanlines }: { scanlines: boolean }) {
    return (
        <>
            {scanlines && <div className={styles.scanlines} aria-hidden="true" data-testid="overlay-scanlines" />}
            <div className={styles.vignette} aria-hidden="true" data-testid="overlay-vignette" />
        </>
    );
}
