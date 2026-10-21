import type { Ref } from "react";
import { SITE } from "../../data/site";
import { formatClock } from "../../lib/time";
import styles from "./TitleBar.module.css";

export interface TitleBarProps {
    /** Shell path of the current page, e.g. `~/projects`. */
    path: string;
    nowMs: number;
    terminalOpen: boolean;
    onToggleTerminal: () => void;
    /** The toggle button, so the shell can hand focus back to it when the drawer closes. */
    toggleRef?: Ref<HTMLButtonElement>;
}

export default function TitleBar({ path, nowMs, terminalOpen, onToggleTerminal, toggleRef }: TitleBarProps) {
    return (
        <header className={styles.bar}>
            <div className={styles.inner}>
                <div className={styles.left}>
                    <span className={styles.host}>{SITE.host}</span>
                    <span className={styles.path} data-testid="title-path">
                        {path}
                    </span>
                </div>
                <div className={styles.right}>
                    <button
                        ref={toggleRef}
                        type="button"
                        className={styles.termButton}
                        onClick={onToggleTerminal}
                        aria-expanded={terminalOpen}
                        aria-controls="terminal-drawer"
                    >
                        <span>&gt;_ terminal</span>
                        <span className={styles.termKey} aria-hidden="true">
                            /
                        </span>
                    </button>
                    <span className={styles.clock} data-testid="title-clock">
                        {formatClock(new Date(nowMs))}
                    </span>
                </div>
            </div>
        </header>
    );
}
