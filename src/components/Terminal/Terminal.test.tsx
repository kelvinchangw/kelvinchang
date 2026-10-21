import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RouteKey } from "../../data/site";
import { useTerminal, type TerminalController } from "../../hooks/useTerminal";
import { MAX_SCROLLBACK, WELCOME_LINE, type TermLine } from "../../lib/terminal";
import { installFakeClock, uninstallFakeClock } from "../../test/fakeClock";
import Terminal from "./Terminal";
import styles from "./Terminal.module.css";

/** 2025-01-18 01:02:03 local: one day, one hour, two minutes and three seconds after NOIR's build day. */
const NOW = new Date(2025, 0, 18, 1, 2, 3);

interface HarnessProps {
    path: string;
    onNavigate: (route: RouteKey) => void;
    /** Swapped in for the controller's closeTerminal so the drawer stays mounted after the close button. */
    onClose?: () => void;
}

/** Drives a real useTerminal, opened on mount, the way Shell does. */
function Harness({ path, onNavigate, onClose }: HarnessProps) {
    const terminal = useTerminal({ path, onNavigate });
    const { open, openTerminal } = terminal;

    useEffect(() => {
        openTerminal();
    }, [openTerminal]);

    if (!open) return <p>drawer closed</p>;
    const controller = onClose ? { ...terminal, closeTerminal: onClose } : terminal;
    return <Terminal path={path} terminal={controller} />;
}

function renderTerminal(options: { path?: string; onClose?: () => void } = {}) {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onNavigate = vi.fn<(route: RouteKey) => void>();
    const path = options.path ?? "~/";
    const view = render(<Harness path={path} onNavigate={onNavigate} onClose={options.onClose} />);
    const input = screen.getByRole("textbox", { name: "Command" });
    const scrollback = screen.getByTestId("terminal-scrollback");
    const rerenderAt = (nextPath: string) =>
        view.rerender(<Harness path={nextPath} onNavigate={onNavigate} onClose={options.onClose} />);
    return { user, input, scrollback, onNavigate, rerenderAt };
}

function lineFor(scrollback: HTMLElement, text: string) {
    return within(scrollback).getByText(text);
}

/** Scrollback lines in order: the children of the live region, which excludes the prompt line at the bottom. */
function lineTexts(scrollback: HTMLElement) {
    return Array.from(within(scrollback).getByRole("log").children).map((line) => line.textContent);
}

describe("Terminal", () => {
    beforeEach(() => installFakeClock(NOW));
    afterEach(uninstallFakeClock);

    describe("rendering", () => {
        it("renders the header, the key hints and the prompt label wired to the input", () => {
            const { input } = renderTerminal({ path: "~/projects" });
            const drawer = screen.getByRole("region", { name: "Terminal" });

            expect(drawer).toHaveAttribute("id", "terminal-drawer");
            expect(screen.getByTestId("terminal")).toBe(drawer);
            expect(within(drawer).getByText("terminal")).toBeInTheDocument();
            expect(within(drawer).getByText("kelvin@noir:~/projects")).toBeInTheDocument();
            expect(within(drawer).getByText("↑↓ history")).toBeInTheDocument();
            expect(within(drawer).getByText("tab complete")).toBeInTheDocument();
            expect(within(drawer).getByRole("button", { name: "esc close ×" })).toBeInTheDocument();
            expect(screen.getByLabelText("kelvin@noir:~/projects$")).toBe(input);
            expect(input).toHaveAttribute("id", "terminal-input");
            expect(input).toHaveValue("");
        });

        it("follows the path of the page behind the drawer", () => {
            const { rerenderAt } = renderTerminal({ path: "~/" });
            expect(screen.getByText("kelvin@noir:~/")).toBeInTheDocument();
            expect(screen.getByLabelText("kelvin@noir:~/$")).toBeInTheDocument();

            rerenderAt("~/blog/001");

            expect(screen.getByText("kelvin@noir:~/blog/001")).toBeInTheDocument();
            expect(screen.getByLabelText("kelvin@noir:~/blog/001$")).toBeInTheDocument();
            expect(screen.queryByText("kelvin@noir:~/")).toBeNull();
        });

        it("prints the welcome line once, dimmed, when opened", () => {
            const { scrollback } = renderTerminal();
            const welcome = within(scrollback).getAllByText(WELCOME_LINE.text);

            expect(welcome).toHaveLength(1);
            expect(welcome[0]).toHaveClass(styles.line, styles.dim);
            expect(lineTexts(scrollback)).toEqual([WELCOME_LINE.text]);
        });
    });

    describe("scrollback keys", () => {
        const line = (n: number): TermLine => ({ text: `line ${n}`, tone: "text" });
        const controllerWith = (history: TermLine[], firstKey: number): TerminalController => ({
            open: true,
            history,
            firstKey,
            cmd: "",
            openTerminal: vi.fn(),
            closeTerminal: vi.fn(),
            toggleTerminal: vi.fn(),
            submit: vi.fn(),
            onChange: vi.fn(),
            onKeyDown: vi.fn(),
        });

        it("keeps the surviving rows' nodes when the cap drops lines from the head, so only new lines are additions", () => {
            const full = Array.from({ length: MAX_SCROLLBACK }, (_, n) => line(n));
            const view = render(<Terminal path="~/" terminal={controllerWith(full, 0)} />);
            const log = within(screen.getByTestId("terminal-scrollback")).getByRole("log");
            const survivorBefore = log.children[2];
            const lastBefore = log.children[MAX_SCROLLBACK - 1];

            const shifted = [...full.slice(2), line(MAX_SCROLLBACK), line(MAX_SCROLLBACK + 1)];
            view.rerender(<Terminal path="~/" terminal={controllerWith(shifted, 2)} />);

            expect(log.children).toHaveLength(MAX_SCROLLBACK);
            expect(log.children[0]).toBe(survivorBefore);
            expect(log.children[0]).toHaveTextContent("line 2");
            expect(log.children[MAX_SCROLLBACK - 3]).toBe(lastBefore);
            expect(log.children[MAX_SCROLLBACK - 1]).toHaveTextContent(`line ${MAX_SCROLLBACK + 1}`);
        });
    });

    describe("live region", () => {
        it("announces output politely and keeps the prompt row outside the region", async () => {
            const { user, input, scrollback } = renderTerminal();
            const log = within(scrollback).getByRole("log", { name: "Terminal output" });
            expect(log).toHaveAttribute("aria-live", "polite");
            expect(log.contains(input)).toBe(false);

            await user.keyboard("pwd{Enter}");

            expect(within(log).getByText("kelvin@noir:~/$ pwd")).toBeInTheDocument();
            expect(within(log).getByText("~/")).toBeInTheDocument();
            expect(within(log).queryByRole("textbox")).toBeNull();
        });
    });

    describe("focus", () => {
        it("focuses the command input on mount", () => {
            const { input } = renderTerminal();
            expect(input).toHaveFocus();
        });

        it("re-applies focus on the deferred retries after the first paint", () => {
            const { input } = renderTerminal();
            input.blur();
            expect(input).not.toHaveFocus();

            vi.advanceTimersByTime(80);

            expect(input).toHaveFocus();
        });

        it("clicking anywhere in the panel focuses the input", async () => {
            const { user, input } = renderTerminal();
            input.blur();
            expect(document.body).toHaveFocus();

            await user.click(screen.getByText("↑↓ history"));
            act(() => vi.advanceTimersByTime(0));

            expect(input).toHaveFocus();
        });

        it("does not steal a text selection made in the scrollback", async () => {
            const { user, input, scrollback } = renderTerminal();
            vi.advanceTimersByTime(80);
            input.blur();
            expect(document.body).toHaveFocus();
            vi.spyOn(window, "getSelection").mockReturnValue({ toString: () => "kelvin@noir" } as unknown as Selection);

            await user.click(lineFor(scrollback, WELCOME_LINE.text));
            act(() => vi.advanceTimersByTime(0));

            expect(document.body).toHaveFocus();
            expect(input).not.toHaveFocus();
        });

        it("refocuses after a click that collapses a stale selection, which the browser only does after the click", async () => {
            const { user, input, scrollback } = renderTerminal();
            vi.advanceTimersByTime(80);
            input.blur();
            let selected = "kelvin@noir";
            vi.spyOn(window, "getSelection").mockImplementation(() => ({ toString: () => selected }) as unknown as Selection);
            // The browser collapses a selection that was clicked inside only after the click has bubbled; a document
            // listener runs after React's root listener and stands in for that, so a synchronous check would still
            // see the stale text.
            document.addEventListener(
                "click",
                () => {
                    selected = "";
                },
                { once: true },
            );

            await user.click(lineFor(scrollback, WELCOME_LINE.text));
            act(() => vi.advanceTimersByTime(0));

            expect(input).toHaveFocus();
        });

        it("the close button calls closeTerminal without refocusing the input", async () => {
            const onClose = vi.fn();
            const { user, input } = renderTerminal({ onClose });
            const close = screen.getByRole("button", { name: "esc close ×" });

            await user.click(close);

            expect(onClose).toHaveBeenCalledTimes(1);
            expect(input).not.toHaveFocus();
            expect(close).toHaveFocus();
        });
    });

    describe("running commands", () => {
        it("echoes the command dimmed, prints its output and clears the input", async () => {
            const { user, input, scrollback } = renderTerminal({ path: "~/about" });

            await user.keyboard("echo hello world{Enter}");

            expect(lineFor(scrollback, "kelvin@noir:~/about$ echo hello world")).toHaveClass(styles.line, styles.dim);
            expect(lineFor(scrollback, "hello world")).toHaveClass(styles.line, styles.text);
            expect(lineTexts(scrollback)).toEqual([
                WELCOME_LINE.text,
                "kelvin@noir:~/about$ echo hello world",
                "hello world",
            ]);
            expect(input).toHaveValue("");
            expect(input).toHaveFocus();
        });

        it("uses the bright tone for emphasised output", async () => {
            const { user, scrollback } = renderTerminal();

            await user.keyboard("neofetch{Enter}");

            expect(lineFor(scrollback, "kelvin@noir")).toHaveClass(styles.line, styles.bright);
            expect(lineFor(scrollback, "-----------")).toHaveClass(styles.line, styles.dim);
            expect(lineFor(scrollback, "Theme: violet phosphor")).toHaveClass(styles.line, styles.text);
        });

        it("appends to the scrollback across commands", async () => {
            const { user, scrollback } = renderTerminal({ path: "~/projects" });

            await user.keyboard("pwd{Enter}");
            await user.keyboard("whoami{Enter}");

            expect(lineTexts(scrollback)).toEqual([
                WELCOME_LINE.text,
                "kelvin@noir:~/projects$ pwd",
                "~/projects",
                "kelvin@noir:~/projects$ whoami",
                "kelvin chang · engineer · designer",
            ]);
        });

        it("ignores blank input and reports unknown commands dimmed", async () => {
            const { user, input, scrollback } = renderTerminal();

            await user.keyboard("{Enter}");
            await user.keyboard("   {Enter}");
            expect(lineTexts(scrollback)).toEqual([WELCOME_LINE.text]);

            await user.clear(input);
            await user.keyboard("frobnicate now{Enter}");

            expect(lineFor(scrollback, "command not found: frobnicate · try help")).toHaveClass(styles.dim);
        });

        it("prints the date from the clock", async () => {
            const { user, scrollback } = renderTerminal();

            await user.keyboard("date{Enter}");

            expect(lineFor(scrollback, "2025-01-18 01:02:03")).toHaveClass(styles.text);
        });

        it("cd hands the target route to onNavigate and prints the new path", async () => {
            const { user, scrollback, onNavigate } = renderTerminal();

            await user.keyboard("cd blog{Enter}");

            expect(onNavigate).toHaveBeenCalledTimes(1);
            expect(onNavigate).toHaveBeenCalledWith("blog");
            expect(lineFor(scrollback, "~/blog")).toHaveClass(styles.dim);
        });

        it("cd to an unknown target prints an error and does not navigate", async () => {
            const { user, scrollback, onNavigate } = renderTerminal();

            await user.keyboard("cd nowhere{Enter}");

            expect(onNavigate).not.toHaveBeenCalled();
            expect(lineFor(scrollback, "cd: no such file or directory: nowhere")).toHaveClass(styles.dim);
        });

        it("clear empties the scrollback and exit closes the drawer", async () => {
            const { user, scrollback } = renderTerminal();

            await user.keyboard("pwd{Enter}");
            expect(lineTexts(scrollback)).toHaveLength(3);

            await user.keyboard("clear{Enter}");
            expect(lineTexts(scrollback)).toEqual([]);
            expect(screen.queryByText(WELCOME_LINE.text)).toBeNull();
            expect(screen.getByRole("textbox", { name: "Command" })).toHaveFocus();

            await user.keyboard("exit{Enter}");
            expect(screen.queryByTestId("terminal")).toBeNull();
            expect(screen.getByText("drawer closed")).toBeInTheDocument();
        });
    });

    describe("Tab completion", () => {
        it("completes a partial command name and keeps focus in the input", async () => {
            const { user, input } = renderTerminal();

            await user.keyboard("hel");
            await user.keyboard("{Tab}");

            expect(input).toHaveValue("help ");
            expect(input).toHaveFocus();
        });

        it("matches case-insensitively", async () => {
            const { user, input } = renderTerminal();

            await user.keyboard("NEO{Tab}");

            expect(input).toHaveValue("neofetch ");
        });

        it("leaves input with an argument or without a match untouched", async () => {
            const { user, input } = renderTerminal();

            await user.keyboard("ls ~{Tab}");
            expect(input).toHaveValue("ls ~");

            await user.clear(input);
            await user.keyboard("zz{Tab}");
            expect(input).toHaveValue("zz");
            expect(input).toHaveFocus();
        });
    });

    describe("command history", () => {
        it("ArrowUp and ArrowDown walk the submitted commands", async () => {
            const { user, input } = renderTerminal();
            await user.keyboard("pwd{Enter}help{Enter}");
            expect(input).toHaveValue("");

            await user.keyboard("{ArrowUp}");
            expect(input).toHaveValue("help");
            await user.keyboard("{ArrowUp}");
            expect(input).toHaveValue("pwd");
            await user.keyboard("{ArrowUp}");
            expect(input).toHaveValue("pwd");

            await user.keyboard("{ArrowDown}");
            expect(input).toHaveValue("help");
            await user.keyboard("{ArrowDown}");
            expect(input).toHaveValue("");
            await user.keyboard("{ArrowDown}");
            expect(input).toHaveValue("");
        });

        it("editing a recalled command resets the recall position", async () => {
            const { user, input } = renderTerminal();
            await user.keyboard("pwd{Enter}help{Enter}");

            await user.keyboard("{ArrowUp}");
            expect(input).toHaveValue("help");
            await user.keyboard(" ls");
            expect(input).toHaveValue("help ls");

            await user.keyboard("{ArrowUp}");
            expect(input).toHaveValue("help");
        });

        it("does nothing with an empty history", async () => {
            const { user, input } = renderTerminal();

            await user.keyboard("dra");
            await user.keyboard("{ArrowUp}{ArrowDown}");

            expect(input).toHaveValue("dra");
        });

        it("records clear and exit too", async () => {
            const { user, input } = renderTerminal();

            await user.keyboard("clear{Enter}");
            await user.keyboard("{ArrowUp}");

            expect(input).toHaveValue("clear");
        });
    });

    describe("scrollback", () => {
        it("scrolls to the bottom when new lines arrive", async () => {
            const { user, scrollback } = renderTerminal();
            const setScrollTop = vi.fn();
            Object.defineProperty(scrollback, "scrollHeight", { configurable: true, get: () => 640 });
            Object.defineProperty(scrollback, "scrollTop", { configurable: true, get: () => 0, set: setScrollTop });

            await user.keyboard("pwd{Enter}");

            expect(setScrollTop).toHaveBeenCalledWith(640);
        });

        it("does not scroll while only the input changes", async () => {
            const { user, scrollback } = renderTerminal();
            const setScrollTop = vi.fn();
            Object.defineProperty(scrollback, "scrollHeight", { configurable: true, get: () => 640 });
            Object.defineProperty(scrollback, "scrollTop", { configurable: true, get: () => 0, set: setScrollTop });

            await user.keyboard("pwd");

            expect(setScrollTop).not.toHaveBeenCalled();
        });
    });
});
