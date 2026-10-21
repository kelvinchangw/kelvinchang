import { act, renderHook } from "@testing-library/react";
import type { KeyboardEvent } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RouteKey } from "../data/site";
import { MAX_SCROLLBACK, WELCOME_LINE, type TermLine } from "../lib/terminal";
import { useTerminal, type UseTerminalOptions } from "./useTerminal";

const HOME = "~/";

interface KeyInit {
    shift?: boolean;
    composing?: boolean;
    keyCode?: number;
}

/** A KeyboardEvent stand-in: the hook reads `key`, `shiftKey`, `keyCode`, `nativeEvent.isComposing` and calls `preventDefault`. */
function keyEvent(key: string, init: KeyInit = {}) {
    const preventDefault = vi.fn();
    const event = {
        key,
        shiftKey: init.shift ?? false,
        keyCode: init.keyCode ?? 0,
        nativeEvent: { isComposing: init.composing ?? false },
        preventDefault,
    } as unknown as KeyboardEvent<HTMLInputElement>;
    return { event, preventDefault };
}

/** Mounts the hook and wraps its callbacks so every call goes through the latest render. */
function setup(path = HOME) {
    const onNavigate = vi.fn<(route: RouteKey) => void>();
    const hook = renderHook((options: UseTerminalOptions) => useTerminal(options), {
        initialProps: { path, onNavigate },
    });
    const { result } = hook;

    const type = (value: string) => act(() => result.current.onChange(value));
    /** Presses one key and returns its `preventDefault` spy. */
    const press = (key: string, init?: KeyInit) => {
        const { event, preventDefault } = keyEvent(key, init);
        act(() => result.current.onKeyDown(event));
        return preventDefault;
    };
    const run = (command: string) => {
        type(command);
        act(() => result.current.submit());
    };
    const open = () => act(() => result.current.openTerminal());
    const close = () => act(() => result.current.closeTerminal());
    const toggle = () => act(() => result.current.toggleTerminal());

    return { ...hook, onNavigate, type, press, run, open, close, toggle };
}

function last<T>(items: readonly T[]): T | undefined {
    return items[items.length - 1];
}

function welcomeCount(history: readonly TermLine[]): number {
    return history.filter((line) => line.text === WELCOME_LINE.text).length;
}

/** The dim echo line the scrollback shows for a submitted command. */
function echoOf(command: string, path = HOME): TermLine {
    return { text: `kelvin@noir:${path}$ ${command}`, tone: "dim" };
}

const out = (text: string): TermLine => ({ text, tone: "text" });

describe("useTerminal", () => {
    describe("drawer state", () => {
        it("starts closed with an empty scrollback and a blank prompt", () => {
            const { result } = setup();

            expect(result.current.open).toBe(false);
            expect(result.current.history).toEqual([]);
            expect(result.current.cmd).toBe("");
        });

        it("prints the welcome line on first open", () => {
            const { result, open } = setup();

            open();

            expect(result.current.open).toBe(true);
            expect(result.current.history).toEqual([WELCOME_LINE]);
            expect(result.current.history[0].tone).toBe("dim");
            // User rule: no em dash; the design's " — " became ":".
            expect(result.current.history[0].text).toMatch(/^kelvinchang\.xyz shell: type help/);
        });

        it("keeps the scrollback and prints the welcome only once across close and reopen", () => {
            const { result, open, close, run } = setup();

            open();
            run("echo hi");
            close();

            expect(result.current.open).toBe(false);
            expect(result.current.history).toHaveLength(3);

            open();
            open();

            expect(result.current.open).toBe(true);
            expect(result.current.history).toEqual([WELCOME_LINE, echoOf("echo hi"), out("hi")]);
            expect(welcomeCount(result.current.history)).toBe(1);
        });

        it("toggles between open and closed", () => {
            const { result, toggle } = setup();

            toggle();
            expect(result.current.open).toBe(true);
            expect(result.current.history).toEqual([WELCOME_LINE]);

            toggle();
            expect(result.current.open).toBe(false);

            toggle();
            expect(result.current.open).toBe(true);
            expect(welcomeCount(result.current.history)).toBe(1);
        });

        it("closing an already closed drawer is a no-op", () => {
            const { result, close } = setup();

            close();

            expect(result.current.open).toBe(false);
            expect(result.current.history).toEqual([]);
        });
    });

    describe("submit", () => {
        it("ignores an empty prompt", () => {
            const { result, open, press } = setup();
            open();

            act(() => result.current.submit());

            expect(result.current.history).toEqual([WELCOME_LINE]);
            expect(result.current.cmd).toBe("");
            // Nothing was recorded for recall either.
            press("ArrowUp");
            expect(result.current.cmd).toBe("");
        });

        it("leaves a whitespace-only prompt untouched", () => {
            const { result, open, run, press } = setup();
            open();

            run("   ");

            expect(result.current.history).toEqual([WELCOME_LINE]);
            expect(result.current.cmd).toBe("   ");
            press("ArrowUp");
            expect(result.current.cmd).toBe("   ");
        });

        it("echoes the command, appends its output, clears the prompt and records it", () => {
            const { result, open, run, press } = setup();
            open();

            run("echo hi");

            expect(result.current.cmd).toBe("");
            expect(result.current.history).toEqual([WELCOME_LINE, echoOf("echo hi"), out("hi")]);

            const preventDefault = press("ArrowUp");
            expect(preventDefault).toHaveBeenCalledTimes(1);
            expect(result.current.cmd).toBe("echo hi");
        });

        it("records the trimmed command for recall", () => {
            const { result, open, run, press } = setup();
            open();

            run("  echo   spaced  ");

            expect(result.current.history.slice(1)).toEqual([echoOf("echo   spaced"), out("spaced")]);
            press("ArrowUp");
            expect(result.current.cmd).toBe("echo   spaced");
        });

        it("appends multi-line output in order", () => {
            const { result, open, run } = setup();
            open();

            run("ls");
            run("foo");

            expect(result.current.history.slice(1)).toEqual([
                echoOf("ls"),
                out("home/  projects/  blog/  about/"),
                echoOf("foo"),
                { text: "command not found: foo · try help", tone: "dim" },
            ]);
        });

        it("uses the current path for the prompt echo and follows prop updates", () => {
            const { result, open, run, rerender, onNavigate } = setup("~/projects");
            open();

            run("pwd");
            expect(result.current.history.slice(1)).toEqual([echoOf("pwd", "~/projects"), out("~/projects")]);

            rerender({ path: "~/blog", onNavigate });
            run("pwd");
            expect(result.current.history.slice(3)).toEqual([echoOf("pwd", "~/blog"), out("~/blog")]);
        });

        it("clear empties the scrollback but keeps command recall", () => {
            const { result, open, run, press } = setup();
            open();
            run("echo one");

            run("clear");

            expect(result.current.open).toBe(true);
            expect(result.current.history).toEqual([]);
            expect(result.current.cmd).toBe("");

            press("ArrowUp");
            expect(result.current.cmd).toBe("clear");
            press("ArrowUp");
            expect(result.current.cmd).toBe("echo one");
        });

        it("prints the welcome again when reopened after clear", () => {
            // Same as the design: the welcome is printed whenever the drawer opens onto an empty scrollback.
            const { result, open, close, run } = setup();
            open();
            run("clear");
            close();

            open();

            expect(result.current.history).toEqual([WELCOME_LINE]);
        });

        it("exit closes the drawer, keeps the scrollback and records the command", () => {
            const { result, open, run, press } = setup();
            open();
            run("echo one");

            run("exit");

            expect(result.current.open).toBe(false);
            expect(result.current.cmd).toBe("");
            expect(result.current.history).toEqual([WELCOME_LINE, echoOf("echo one"), out("one")]);

            open();
            expect(result.current.history).toHaveLength(3);
            press("ArrowUp");
            expect(result.current.cmd).toBe("exit");
        });

        it("matches command names case-insensitively", () => {
            const { result, open, run } = setup();
            open();
            run("echo one");

            run("CLEAR");
            expect(result.current.history).toEqual([]);

            run("Exit");
            expect(result.current.open).toBe(false);
        });
    });

    describe("navigation", () => {
        it("cd navigates and prints the new path", () => {
            const { result, open, run, onNavigate } = setup();
            open();

            run("cd projects");

            expect(onNavigate).toHaveBeenCalledTimes(1);
            expect(onNavigate).toHaveBeenCalledWith("projects");
            expect(result.current.history.slice(1)).toEqual([
                echoOf("cd projects"),
                { text: "~/projects", tone: "dim" },
            ]);
        });

        it("open accepts shell-style arguments", () => {
            const { result, open, run, onNavigate } = setup();
            open();

            run("open ~/blog/");
            expect(onNavigate).toHaveBeenLastCalledWith("blog");

            run("cd 001.md");
            expect(onNavigate).toHaveBeenLastCalledWith("post001");
            expect(last(result.current.history)).toEqual({ text: "~/blog/001", tone: "dim" });

            run("cd");
            expect(onNavigate).toHaveBeenLastCalledWith("home");
            expect(last(result.current.history)).toEqual({ text: "~/", tone: "dim" });

            expect(onNavigate).toHaveBeenCalledTimes(3);
        });

        it("does not navigate for unknown targets or non-navigation commands", () => {
            const { result, open, run, onNavigate } = setup();
            open();

            run("cd nowhere");
            run("echo hi");
            run("ls projects");

            expect(onNavigate).not.toHaveBeenCalled();
            expect(result.current.history[2]).toEqual({
                text: "cd: no such file or directory: nowhere",
                tone: "dim",
            });
        });
    });

    describe("onKeyDown", () => {
        it("Enter submits the prompt", () => {
            const { result, open, type, press } = setup();
            open();

            type("echo enter");
            press("Enter");

            expect(result.current.cmd).toBe("");
            expect(result.current.history.slice(1)).toEqual([echoOf("echo enter"), out("enter")]);
        });

        it("Enter on an empty prompt does nothing", () => {
            const { result, open, press } = setup();
            open();

            press("Enter");

            expect(result.current.history).toEqual([WELCOME_LINE]);
        });

        it("ArrowUp and ArrowDown walk the command history and keep the caret put", () => {
            const { result, open, run, press } = setup();
            open();
            run("echo one");
            run("echo two");
            run("echo three");

            expect(press("ArrowUp")).toHaveBeenCalledTimes(1);
            expect(result.current.cmd).toBe("echo three");
            press("ArrowUp");
            expect(result.current.cmd).toBe("echo two");
            press("ArrowUp");
            expect(result.current.cmd).toBe("echo one");
            // Clamps at the oldest entry.
            expect(press("ArrowUp")).toHaveBeenCalledTimes(1);
            expect(result.current.cmd).toBe("echo one");

            expect(press("ArrowDown")).toHaveBeenCalledTimes(1);
            expect(result.current.cmd).toBe("echo two");
            press("ArrowDown");
            expect(result.current.cmd).toBe("echo three");
            // Past the newest entry returns to a fresh prompt and stays there.
            press("ArrowDown");
            expect(result.current.cmd).toBe("");
            expect(press("ArrowDown")).toHaveBeenCalledTimes(1);
            expect(result.current.cmd).toBe("");
        });

        it("ignores history keys when nothing has been run", () => {
            const { result, open, type, press } = setup();
            open();
            type("draft");

            expect(press("ArrowUp")).toHaveBeenCalledTimes(1);
            expect(result.current.cmd).toBe("draft");
            expect(press("ArrowDown")).toHaveBeenCalledTimes(1);
            expect(result.current.cmd).toBe("draft");
        });

        it("ArrowDown at a fresh prompt leaves typed text alone", () => {
            const { result, open, run, type, press } = setup();
            open();
            run("echo one");
            type("draft");

            press("ArrowDown");

            expect(result.current.cmd).toBe("draft");
        });

        it("editing the prompt resets recall to the newest entry", () => {
            const { result, open, run, type, press } = setup();
            open();
            run("echo one");
            run("echo two");
            press("ArrowUp");
            press("ArrowUp");
            expect(result.current.cmd).toBe("echo one");

            type("echo draft");
            expect(result.current.cmd).toBe("echo draft");

            press("ArrowUp");
            expect(result.current.cmd).toBe("echo two");
        });

        it("submitting a recalled command resets recall and records the rerun", () => {
            const { result, open, run, press } = setup();
            open();
            run("echo one");
            run("echo two");
            press("ArrowUp");
            press("ArrowUp");
            expect(result.current.cmd).toBe("echo one");

            press("Enter");

            expect(last(result.current.history)).toEqual(out("one"));
            press("ArrowUp");
            expect(result.current.cmd).toBe("echo one");
            press("ArrowUp");
            expect(result.current.cmd).toBe("echo two");
            press("ArrowUp");
            expect(result.current.cmd).toBe("echo one");
        });

        it("Tab completes a partial command name", () => {
            const { result, open, type, press } = setup();
            open();

            type("hel");
            expect(press("Tab")).toHaveBeenCalledTimes(1);
            expect(result.current.cmd).toBe("help ");

            type("NEO");
            press("Tab");
            expect(result.current.cmd).toBe("neofetch ");
        });

        it("Tab leaves the prompt alone when nothing completes", () => {
            const { result, open, type, press } = setup();
            open();

            for (const value of ["", "zzz", "echo hi", "help "]) {
                type(value);
                expect(press("Tab")).toHaveBeenCalledTimes(1);
                expect(result.current.cmd).toBe(value);
            }
        });

        it("Shift+Tab is left to the browser so focus can leave the input", () => {
            const { result, open, type, press } = setup();
            open();
            type("hel");

            expect(press("Tab", { shift: true })).not.toHaveBeenCalled();
            expect(result.current.cmd).toBe("hel");
        });

        it("ignores keys delivered during IME composition", () => {
            const { result, open, type, press } = setup();
            open();
            type("こんにちは");

            expect(press("Enter", { composing: true })).not.toHaveBeenCalled();
            expect(result.current.cmd).toBe("こんにちは");
            expect(result.current.history).toEqual([WELCOME_LINE]);

            expect(press("ArrowUp", { composing: true })).not.toHaveBeenCalled();
            expect(press("Tab", { composing: true })).not.toHaveBeenCalled();
            expect(result.current.cmd).toBe("こんにちは");
        });

        it("ignores keys that only carry the legacy IME keyCode 229", () => {
            const { result, open, type, press } = setup();
            open();
            type("exit");

            expect(press("Enter", { keyCode: 229 })).not.toHaveBeenCalled();
            expect(result.current.open).toBe(true);
            expect(result.current.cmd).toBe("exit");
        });

        it("cancels Enter's default so the keypress cannot reach whatever is focused after the drawer closes", () => {
            const { result, open, type, press } = setup();
            open();
            type("exit");

            expect(press("Enter")).toHaveBeenCalledTimes(1);
            expect(result.current.open).toBe(false);
        });

        it("ignores other keys", () => {
            const { result, open, type, press } = setup();
            open();
            type("echo hi");

            expect(press("a")).not.toHaveBeenCalled();
            expect(press("Escape")).not.toHaveBeenCalled();

            expect(result.current.cmd).toBe("echo hi");
            expect(result.current.history).toEqual([WELCOME_LINE]);
        });
    });

    describe("scrollback", () => {
        it("keeps only the newest 300 lines", () => {
            const { result, open, run } = setup();
            open();

            // 1 welcome + 200 × (echo + output) = 401 lines before the cap.
            for (let i = 1; i <= 200; i += 1) run(`echo ${i}`);

            const { history } = result.current;
            expect(history).toHaveLength(300);
            expect(welcomeCount(history)).toBe(0);
            expect(history[0]).toEqual(echoOf("echo 51"));
            expect(last(history)).toEqual(out("200"));
        });
    });

    describe("clock", () => {
        afterEach(() => {
            vi.useRealTimers();
        });

        it("passes the time at submit, not at mount, to commands", () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 9, 20, 13, 45, 7));
            const { result, open, run } = setup();
            open();

            run("date");
            expect(last(result.current.history)).toEqual(out("2026-10-20 13:45:07"));

            vi.setSystemTime(new Date(2026, 9, 21, 0, 0, 0));
            run("date");
            expect(last(result.current.history)).toEqual(out("2026-10-21 00:00:00"));
        });
    });
    describe("scrollback keys", () => {
        it("starts at 0 and stays put while the scrollback is below the cap", () => {
            const { result, open, run } = setup();
            open();
            expect(result.current.firstKey).toBe(0);

            run("echo hi");
            expect(result.current.history).toHaveLength(3);
            expect(result.current.firstKey).toBe(0);
        });

        it("advances by every line the cap drops from the head", () => {
            const { result, open, run } = setup();
            open();

            for (let n = 0; n < 150; n += 1) run(`echo ${n}`);
            expect(result.current.history).toHaveLength(MAX_SCROLLBACK);
            expect(result.current.firstKey).toBe(1);
            expect(result.current.history[0]).toEqual(echoOf("echo 0"));

            run("echo 150");
            expect(result.current.history).toHaveLength(MAX_SCROLLBACK);
            expect(result.current.firstKey).toBe(3);
            expect(result.current.history[0]).toEqual(echoOf("echo 1"));
        });

        it("skips past cleared lines so keys never repeat", () => {
            const { result, open, run } = setup();
            open();
            run("echo hi");

            run("clear");

            expect(result.current.history).toEqual([]);
            expect(result.current.firstKey).toBe(3);
        });
    });
});
