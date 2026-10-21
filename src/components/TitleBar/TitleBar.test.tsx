import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TitleBar, { type TitleBarProps } from "./TitleBar";

/** Local 2025-01-18 02:03:04. */
const NOW_MS = new Date(2025, 0, 18, 2, 3, 4).getTime();

function renderBar(overrides: Partial<TitleBarProps> = {}) {
    const props: TitleBarProps = {
        path: "~/projects",
        nowMs: NOW_MS,
        terminalOpen: false,
        onToggleTerminal: vi.fn(),
        ...overrides,
    };
    render(<TitleBar {...props} />);
    return props;
}

function terminalButton(): HTMLElement {
    return screen.getByRole("button", { name: ">_ terminal" });
}

describe("TitleBar", () => {
    it("is the page banner", () => {
        renderBar();
        expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("shows the host", () => {
        renderBar();
        expect(screen.getByText("kelvinchang.xyz")).toBeInTheDocument();
    });

    it("shows the current shell path", () => {
        renderBar({ path: "~/blog/001" });
        expect(screen.getByTestId("title-path")).toHaveTextContent("~/blog/001");
    });

    it("leaves the uptime to the rail", () => {
        renderBar();
        expect(screen.queryByTestId("title-uptime")).not.toBeInTheDocument();
        expect(screen.queryByText(/^up \d/)).not.toBeInTheDocument();
    });

    it("shows the local clock for nowMs", () => {
        renderBar();
        expect(screen.getByTestId("title-clock")).toHaveTextContent("02:03:04");
    });

    it("re-renders the clock when nowMs changes", () => {
        renderBar({ nowMs: new Date(2025, 0, 18, 23, 59, 59).getTime() });
        expect(screen.getByTestId("title-clock")).toHaveTextContent("23:59:59");
    });

    describe("terminal button", () => {
        it("hides the keyboard hint from assistive tech", () => {
            renderBar();
            const hint = screen.getByText("/");
            expect(hint).toHaveAttribute("aria-hidden", "true");
            expect(terminalButton()).toContainElement(hint);
        });

        it("controls the terminal drawer", () => {
            renderBar();
            expect(terminalButton()).toHaveAttribute("aria-controls", "terminal-drawer");
            expect(terminalButton()).toHaveAttribute("type", "button");
        });

        it("is collapsed while the terminal is closed", () => {
            renderBar({ terminalOpen: false });
            expect(terminalButton()).toHaveAttribute("aria-expanded", "false");
        });

        it("is expanded while the terminal is open", () => {
            renderBar({ terminalOpen: true });
            expect(terminalButton()).toHaveAttribute("aria-expanded", "true");
        });

        it("toggles the terminal on click", async () => {
            const user = userEvent.setup();
            const { onToggleTerminal } = renderBar();
            expect(onToggleTerminal).not.toHaveBeenCalled();
            await user.click(terminalButton());
            expect(onToggleTerminal).toHaveBeenCalledTimes(1);
            await user.click(terminalButton());
            expect(onToggleTerminal).toHaveBeenCalledTimes(2);
        });
    });
});
