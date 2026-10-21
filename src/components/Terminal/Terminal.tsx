import { useCallback, useEffect, useRef } from "react";
import { SITE } from "../../data/site";
import type { TerminalController } from "../../hooks/useTerminal";
import { cx } from "../../lib/cx";
import styles from "./Terminal.module.css";

export interface TerminalProps {
    /** Shell path of the page behind the drawer, e.g. `~/projects`. */
    path: string;
    terminal: TerminalController;
}

/** The command-line drawer. Rendered only while open; state lives in `useTerminal`. */
export default function Terminal({ path, terminal }: TerminalProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { history, firstKey, cmd, onChange, onKeyDown, closeTerminal } = terminal;

    const focusInput = useCallback(() => {
        const input = inputRef.current;
        if (!input || document.activeElement === input) return;
        input.focus({ preventScroll: true });
        const end = input.value.length;
        try {
            input.setSelectionRange(end, end);
        } catch {
            // Some input types reject selection ranges; focus alone is enough.
        }
    }, []);

    const onPanelClick = useCallback(() => {
        // A drag-select or double-click in the scrollback also ends in a click; refocusing would move the document
        // selection into the input and drop the highlight before it can be copied. Decide once the browser has
        // finished the gesture: a click inside an existing selection only collapses it after the click event.
        window.setTimeout(() => {
            if (!window.getSelection()?.toString()) focusInput();
        }, 0);
    }, [focusInput]);

    // Focus on open. The retries cover the drawer's first paint and the Lenis scroll frame.
    useEffect(() => {
        focusInput();
        const frame = typeof requestAnimationFrame === "function" ? requestAnimationFrame(focusInput) : 0;
        const timer = window.setTimeout(focusInput, 80);
        return () => {
            if (frame) cancelAnimationFrame(frame);
            window.clearTimeout(timer);
        };
    }, [focusInput]);

    // Keep the newest output in view.
    useEffect(() => {
        const scroller = scrollRef.current;
        if (scroller) scroller.scrollTop = scroller.scrollHeight;
    }, [history]);

    const prompt = `${SITE.promptUser}:${path}`;

    return (
        <section
            id="terminal-drawer"
            className={styles.panel}
            onClick={onPanelClick}
            aria-label="Terminal"
            data-testid="terminal"
            data-lenis-prevent
        >
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <span className={styles.title}>terminal</span>
                    <span>{prompt}</span>
                </div>
                <div className={styles.headerRight}>
                    <span className={styles.hint}>↑↓ history</span>
                    <span className={styles.hint}>tab complete</span>
                    <button
                        type="button"
                        className={styles.close}
                        onClick={(event) => {
                            event.stopPropagation();
                            closeTerminal();
                        }}
                    >
                        esc close ×
                    </button>
                </div>
            </header>
            <div className={styles.scrollback} ref={scrollRef} data-testid="terminal-scrollback">
                <div role="log" aria-live="polite" aria-label="Terminal output">
                    {history.map((line, index) => (
                        <div key={firstKey + index} className={cx(styles.line, styles[line.tone])}>
                            {line.text}
                        </div>
                    ))}
                </div>
                <div className={styles.promptLine}>
                    <label htmlFor="terminal-input" className={styles.prompt}>
                        {prompt}$
                    </label>
                    <input
                        id="terminal-input"
                        ref={inputRef}
                        className={styles.input}
                        type="text"
                        value={cmd}
                        onChange={(event) => onChange(event.target.value)}
                        onKeyDown={onKeyDown}
                        spellCheck={false}
                        autoComplete="off"
                        autoCapitalize="off"
                        autoCorrect="off"
                        aria-label="Command"
                    />
                </div>
            </div>
        </section>
    );
}
