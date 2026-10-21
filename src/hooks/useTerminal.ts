import { useCallback, useState, type KeyboardEvent } from "react";
import type { RouteKey } from "../data/site";
import {
    appendScrollback,
    completeCommand,
    recallHistory,
    runCommand,
    WELCOME_LINE,
    type TermLine,
} from "../lib/terminal";

export interface UseTerminalOptions {
    /** Shell path of the page behind the drawer, e.g. `~/projects`. */
    path: string;
    onNavigate: (route: RouteKey) => void;
}

export interface TerminalController {
    open: boolean;
    history: TermLine[];
    /** Render key of `history[0]`; keys stay stable while the cap drops lines from the head. */
    firstKey: number;
    cmd: string;
    openTerminal: () => void;
    closeTerminal: () => void;
    toggleTerminal: () => void;
    submit: () => void;
    onChange: (value: string) => void;
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

interface Scrollback {
    lines: TermLine[];
    /** Monotonic key of `lines[0]`, advanced by every line dropped from the head. */
    firstKey: number;
}

const EMPTY_SCROLLBACK: Scrollback = { lines: [], firstKey: 0 };

/** State for the terminal drawer. Scrollback survives closing and reopening the drawer. */
export function useTerminal({ path, onNavigate }: UseTerminalOptions): TerminalController {
    const [open, setOpen] = useState(false);
    const [scrollback, setScrollback] = useState<Scrollback>(EMPTY_SCROLLBACK);
    const { lines: history, firstKey } = scrollback;
    const [cmd, setCmd] = useState("");
    const [cmdHistory, setCmdHistory] = useState<string[]>([]);
    const [histIdx, setHistIdx] = useState(-1);

    const openTerminal = useCallback(() => {
        setOpen(true);
        setScrollback((current) => (current.lines.length ? current : { ...current, lines: [WELCOME_LINE] }));
    }, []);

    const closeTerminal = useCallback(() => setOpen(false), []);

    const toggleTerminal = useCallback(() => {
        if (open) closeTerminal();
        else openTerminal();
    }, [open, openTerminal, closeTerminal]);

    const submit = useCallback(() => {
        const result = runCommand(cmd, { path, now: new Date() });
        if (!result) return;

        setCmdHistory((entries) => [...entries, cmd.trim()]);
        setHistIdx(-1);
        setCmd("");

        if (result.clear) {
            setScrollback((current) => ({ lines: [], firstKey: current.firstKey + current.lines.length }));
            return;
        }
        if (result.exit) {
            setOpen(false);
            return;
        }
        setScrollback((current) => {
            const lines = appendScrollback(current.lines, result.lines);
            const dropped = current.lines.length + result.lines.length - lines.length;
            return { lines, firstKey: current.firstKey + dropped };
        });
        if (result.navigate) onNavigate(result.navigate);
    }, [cmd, path, onNavigate]);

    const onChange = useCallback((value: string) => {
        setCmd(value);
        setHistIdx(-1);
    }, []);

    const onKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            // Keys delivered while an IME is composing belong to the composition, not to the shell.
            if (event.nativeEvent.isComposing || event.keyCode === 229) return;
            if (event.key === "Enter") {
                // Cancelling the keydown also cancels its keypress, so Enter on `exit` cannot activate whatever
                // receives focus once the drawer unmounts.
                event.preventDefault();
                submit();
            } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                event.preventDefault();
                const step = recallHistory(cmdHistory, histIdx, event.key === "ArrowUp" ? "up" : "down");
                if (step) {
                    setHistIdx(step.histIdx);
                    setCmd(step.cmd);
                }
            } else if (event.key === "Tab" && !event.shiftKey) {
                // Shift+Tab stays free so keyboard users can leave the input for the close button.
                event.preventDefault();
                const completed = completeCommand(cmd);
                if (completed) setCmd(completed);
            }
        },
        [submit, cmdHistory, histIdx, cmd],
    );

    return {
        open,
        history,
        firstKey,
        cmd,
        openTerminal,
        closeTerminal,
        toggleTerminal,
        submit,
        onChange,
        onKeyDown,
    };
}
