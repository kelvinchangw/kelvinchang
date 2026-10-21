import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WELCOME_LINE } from "../../lib/terminal";
import { installFakeClock, uninstallFakeClock } from "../../test/fakeClock";
import { stubMatchMedia } from "../../test/matchMedia";
import Shell from "./Shell";

/** 2025-01-18 01:02:03 local: one day, one hour, two minutes and three seconds after NOIR's build day. */
const NOW = new Date(2025, 0, 18, 1, 2, 3);
const NAV_LABELS = ["home/", "projects/", "blog/", "about/"];

/** A stand-in page with a heading to spot, an input to type into and a history-back button. */
function Page({ name }: { name: string }) {
    const navigate = useNavigate();
    return (
        <div>
            <h1>{name} page</h1>
            <input aria-label="Search" />
            <button type="button" onClick={() => navigate(-1)}>
                back
            </button>
        </div>
    );
}

function renderShell(initialPath: string) {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
        <MemoryRouter initialEntries={[initialPath]}>
            <Shell>
                <Routes>
                    <Route path="/" element={<Page name="home" />} />
                    <Route path="/projects" element={<Page name="projects" />} />
                    <Route path="/projects/project-noir" element={<Page name="noir" />} />
                    <Route path="/blog" element={<Page name="blog" />} />
                    <Route path="/blog/001" element={<Page name="post001" />} />
                    <Route path="/about" element={<Page name="about" />} />
                    <Route path="*" element={<Page name="not found" />} />
                </Routes>
            </Shell>
        </MemoryRouter>,
    );
    return { user };
}

const titlePath = () => screen.getByTestId("title-path");
const terminalButton = () => screen.getByRole("button", { name: ">_ terminal" });
const terminalInput = () => screen.getByRole("textbox", { name: "Command" });
const searchInput = () => screen.getByRole("textbox", { name: "Search" });
const navLink = (label: string) =>
    within(screen.getByRole("navigation", { name: "Site" })).getByRole("link", { name: label });

function expectActiveSection(active: string | null) {
    for (const label of NAV_LABELS) {
        if (label === active) expect(navLink(label)).toHaveAttribute("aria-current", "page");
        else expect(navLink(label)).not.toHaveAttribute("aria-current");
    }
}

describe("Shell", () => {
    beforeEach(() => installFakeClock(NOW));
    afterEach(uninstallFakeClock);

    describe("frame", () => {
        it.each([
            ["/", "~/", "home/"],
            ["/projects", "~/projects", "projects/"],
            ["/projects/", "~/projects", "projects/"],
            ["/projects/project-noir", "~/projects/noir", "projects/"],
            ["/blog", "~/blog", "blog/"],
            ["/blog/001", "~/blog/001", "blog/"],
            ["/about", "~/about", "about/"],
        ])("on %s the title bar shows %s and the rail lights up %s", (url, path, active) => {
            renderShell(url);

            expect(screen.getByText("kelvinchang.xyz")).toBeInTheDocument();
            expect(titlePath().textContent).toBe(path);
            expectActiveSection(active);
        });

        it("shows the raw pathname under ~ with no active section for an unknown route", () => {
            renderShell("/nope");

            expect(titlePath().textContent).toBe("~/nope");
            expect(screen.getByRole("heading", { name: "not found page" })).toBeInTheDocument();
            expectActiveSection(null);
        });

        it("renders the page inside main, with the footer and the aria-hidden overlays", () => {
            renderShell("/blog");

            expect(within(screen.getByRole("main")).getByRole("heading", { name: "blog page" })).toBeInTheDocument();
            expect(screen.getByRole("contentinfo")).toBeInTheDocument();
            expect(screen.getByTestId("overlay-scanlines")).toHaveAttribute("aria-hidden", "true");
            expect(screen.getByTestId("overlay-vignette")).toHaveAttribute("aria-hidden", "true");
            expect(screen.queryByTestId("terminal")).toBeNull();
        });

        it("drives the clock and the rail uptime from one ticking clock", () => {
            renderShell("/");

            expect(screen.getByTestId("title-clock")).toHaveTextContent("01:02:03");
            expect(screen.getByTestId("rail-uptime")).toHaveTextContent("1d 01:02:03");

            act(() => {
                vi.advanceTimersByTime(1000);
            });

            expect(screen.getByTestId("title-clock")).toHaveTextContent("01:02:04");
            expect(screen.getByTestId("rail-uptime")).toHaveTextContent("1d 01:02:04");
        });

        it("leaves the browser's restored scroll position alone on the initial load", () => {
            vi.mocked(window.scrollTo).mockClear();
            renderShell("/about");
            expect(window.scrollTo).not.toHaveBeenCalled();
        });
    });

    describe("keyboard shortcuts", () => {
        it("opens the drawer on / and focuses the command input", async () => {
            const { user } = renderShell("/");
            expect(screen.queryByTestId("terminal")).toBeNull();

            await user.keyboard("/");

            expect(screen.getByTestId("terminal")).toBeInTheDocument();
            expect(terminalInput()).toHaveFocus();
            expect(terminalInput()).toHaveValue("");
            expect(screen.getByText(WELCOME_LINE.text)).toBeInTheDocument();
            expect(terminalButton()).toHaveAttribute("aria-expanded", "true");
        });

        it("opens the drawer on the backtick key", async () => {
            const { user } = renderShell("/");

            await user.keyboard("`");

            expect(screen.getByTestId("terminal")).toBeInTheDocument();
            expect(terminalInput()).toHaveFocus();
        });

        it("does not open while an input is focused; the key is typed instead", async () => {
            const { user } = renderShell("/");
            await user.click(searchInput());

            await user.keyboard("/`");

            expect(screen.queryByTestId("terminal")).toBeNull();
            expect(searchInput()).toHaveValue("/`");
        });

        it("ignores / with a modifier held", async () => {
            const { user } = renderShell("/");

            await user.keyboard("{Control>}/{/Control}");
            await user.keyboard("{Meta>}/{/Meta}");
            await user.keyboard("{Alt>}/{/Alt}");

            expect(screen.queryByTestId("terminal")).toBeNull();
        });

        it("closes on Escape and blurs the focused input", async () => {
            const { user } = renderShell("/");
            await user.keyboard("/");
            await user.click(searchInput());
            expect(searchInput()).toHaveFocus();

            await user.keyboard("{Escape}");

            expect(screen.queryByTestId("terminal")).toBeNull();
            expect(searchInput()).not.toHaveFocus();
            expect(terminalButton()).toHaveFocus();
            expect(terminalButton()).toHaveAttribute("aria-expanded", "false");
        });

        it("closes on Escape from the command input itself", async () => {
            const { user } = renderShell("/");
            await user.keyboard("/");
            expect(terminalInput()).toHaveFocus();

            await user.keyboard("{Escape}");

            expect(screen.queryByTestId("terminal")).toBeNull();
            expect(terminalButton()).toHaveFocus();
        });

        it.each([
            ["isComposing", { key: "Escape", isComposing: true }],
            ["keyCode 229", { key: "Escape", keyCode: 229 }],
        ])("ignores Escape delivered during IME composition (%s)", async (_label, init) => {
            const { user } = renderShell("/");
            await user.keyboard("/");

            fireEvent.keyDown(terminalInput(), init);

            expect(screen.getByTestId("terminal")).toBeInTheDocument();
            expect(terminalInput()).toHaveFocus();
        });

        it("leaves focus on an element outside the drawer when Escape closes it", async () => {
            const { user } = renderShell("/");
            await user.keyboard("/");
            act(() => navLink("blog/").focus());

            await user.keyboard("{Escape}");

            expect(screen.queryByTestId("terminal")).toBeNull();
            expect(navLink("blog/")).toHaveFocus();
        });

        it("leaves focus alone on Escape while the drawer is closed", async () => {
            const { user } = renderShell("/");
            await user.click(searchInput());

            await user.keyboard("{Escape}");

            expect(searchInput()).toHaveFocus();
            expect(screen.queryByTestId("terminal")).toBeNull();
        });
    });

    describe("title-bar button", () => {
        it("toggles the drawer and reports it through aria-expanded", async () => {
            const { user } = renderShell("/projects");
            const button = terminalButton();
            expect(button).toHaveAttribute("aria-expanded", "false");
            expect(button).toHaveAttribute("aria-controls", "terminal-drawer");

            await user.click(button);

            expect(button).toHaveAttribute("aria-expanded", "true");
            const terminal = screen.getByTestId("terminal");
            expect(terminal).toHaveAttribute("id", "terminal-drawer");
            expect(within(terminal).getByText("kelvin@noir:~/projects")).toBeInTheDocument();
            expect(terminalInput()).toHaveFocus();

            await user.click(button);

            expect(button).toHaveAttribute("aria-expanded", "false");
            expect(screen.queryByTestId("terminal")).toBeNull();
        });
    });

    describe("commands", () => {
        it("cd navigates the page behind the drawer, updates the path and scrolls to top", async () => {
            const { user } = renderShell("/");
            vi.mocked(window.scrollTo).mockClear();
            await user.keyboard("/");

            await user.keyboard("cd blog{Enter}");

            expect(titlePath().textContent).toBe("~/blog");
            expect(screen.getByRole("heading", { name: "blog page" })).toBeInTheDocument();
            expect(screen.queryByRole("heading", { name: "home page" })).toBeNull();
            expectActiveSection("blog/");
            expect(window.scrollTo).toHaveBeenCalledTimes(1);
            expect(window.scrollTo).toHaveBeenCalledWith(0, 0);

            const terminal = screen.getByTestId("terminal");
            expect(within(terminal).getByText("kelvin@noir:~/blog")).toBeInTheDocument();
            expect(screen.getByLabelText("kelvin@noir:~/blog$")).toBe(terminalInput());
            expect(within(terminal).getByText("kelvin@noir:~/$ cd blog")).toBeInTheDocument();
            expect(within(terminal).getByText("~/blog")).toBeInTheDocument();
            expect(terminalInput()).toHaveFocus();
        });

        it("open reaches reading pages, which light up their parent section", async () => {
            const { user } = renderShell("/about");
            await user.keyboard("/");

            await user.keyboard("open noir{Enter}");

            expect(titlePath().textContent).toBe("~/projects/noir");
            expect(screen.getByRole("heading", { name: "noir page" })).toBeInTheDocument();
            expectActiveSection("projects/");
        });

        it("cd to an unknown target prints an error and stays put", async () => {
            const { user } = renderShell("/about");
            vi.mocked(window.scrollTo).mockClear();
            await user.keyboard("/");

            await user.keyboard("cd nowhere{Enter}");

            expect(titlePath().textContent).toBe("~/about");
            expect(screen.getByRole("heading", { name: "about page" })).toBeInTheDocument();
            expect(screen.getByText("cd: no such file or directory: nowhere")).toBeInTheDocument();
            expect(window.scrollTo).not.toHaveBeenCalled();
        });

        it("exit closes the drawer", async () => {
            const { user } = renderShell("/");
            await user.keyboard("/");

            await user.keyboard("exit{Enter}");

            expect(screen.queryByTestId("terminal")).toBeNull();
            expect(terminalButton()).toHaveAttribute("aria-expanded", "false");
            expect(terminalButton()).toHaveFocus();
        });

        it("keeps the scrollback across close and reopen, with the welcome line printed once", async () => {
            const { user } = renderShell("/");
            await user.keyboard("/");
            await user.keyboard("echo still here{Enter}");

            await user.keyboard("{Escape}");
            expect(screen.queryByTestId("terminal")).toBeNull();
            await user.keyboard("/");

            const terminal = screen.getByTestId("terminal");
            expect(within(terminal).getByText("kelvin@noir:~/$ echo still here")).toBeInTheDocument();
            expect(within(terminal).getByText("still here")).toBeInTheDocument();
            expect(within(terminal).getAllByText(WELCOME_LINE.text)).toHaveLength(1);
            const log = within(screen.getByTestId("terminal-scrollback")).getByRole("log");
            expect(log.firstElementChild).toHaveTextContent(WELCOME_LINE.text);
            expect(terminalInput()).toHaveFocus();
        });

        it("scrolls to the top every time cd targets the route already on screen", async () => {
            const { user } = renderShell("/projects/project-noir");
            await user.keyboard("/");
            await user.keyboard("cd noir{Enter}");
            vi.mocked(window.scrollTo).mockClear();

            await user.keyboard("cd noir{Enter}");

            expect(titlePath().textContent).toBe("~/projects/noir");
            expect(window.scrollTo).toHaveBeenCalledTimes(1);
            expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        });
    });

    describe("navigation", () => {
        it("scrolls to the top every time the active rail link is clicked", async () => {
            const { user } = renderShell("/projects");
            await user.click(navLink("projects/"));
            vi.mocked(window.scrollTo).mockClear();

            await user.click(navLink("projects/"));

            expect(titlePath().textContent).toBe("~/projects");
            expect(window.scrollTo).toHaveBeenCalledTimes(1);
            expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        });

        it("leaves the scroll position to the browser on back and forward", async () => {
            const { user } = renderShell("/");
            await user.click(navLink("blog/"));
            expect(screen.getByRole("heading", { name: "blog page" })).toBeInTheDocument();
            vi.mocked(window.scrollTo).mockClear();

            await user.click(screen.getByRole("button", { name: "back" }));

            expect(screen.getByRole("heading", { name: "home page" })).toBeInTheDocument();
            expect(titlePath().textContent).toBe("~/");
            expect(window.scrollTo).not.toHaveBeenCalled();
        });

        it("scrolls to the top once when a rail link changes the page", async () => {
            const { user } = renderShell("/");
            vi.mocked(window.scrollTo).mockClear();

            await user.click(navLink("blog/"));

            expect(screen.getByRole("heading", { name: "blog page" })).toBeInTheDocument();
            expect(window.scrollTo).toHaveBeenCalledTimes(1);
        });
    });

    describe("focus after closing", () => {
        it("returns focus to the title-bar toggle when the close button is clicked", async () => {
            const { user } = renderShell("/");
            await user.keyboard("/");

            await user.click(screen.getByRole("button", { name: "esc close ×" }));

            expect(screen.queryByTestId("terminal")).toBeNull();
            expect(terminalButton()).toHaveFocus();
        });

        it("returns focus to the toggle when the close button is activated with Enter, without reopening", async () => {
            const { user } = renderShell("/");
            await user.keyboard("/");
            await user.keyboard("{Shift>}{Tab}{/Shift}");
            expect(screen.getByRole("button", { name: "esc close ×" })).toHaveFocus();

            await user.keyboard("{Enter}");

            expect(screen.queryByTestId("terminal")).toBeNull();
            expect(terminalButton()).toHaveFocus();
            expect(terminalButton()).toHaveAttribute("aria-expanded", "false");
        });

        it("keeps focus on the toggle when the toggle itself closes the drawer", async () => {
            const { user } = renderShell("/");
            await user.click(terminalButton());
            expect(terminalInput()).toHaveFocus();

            await user.click(terminalButton());

            expect(screen.queryByTestId("terminal")).toBeNull();
            expect(terminalButton()).toHaveFocus();
        });
    });

    describe("CRT motion", () => {
        it("animates the portrait by default", () => {
            renderShell("/");

            expect(screen.getByTestId("crt-monitor")).toHaveAttribute("data-motion", "on");
            expect(screen.getAllByTestId("crt-shutter")).toHaveLength(2);
        });

        it("turns the portrait animation off under prefers-reduced-motion", () => {
            stubMatchMedia(true);
            renderShell("/");

            expect(screen.getByTestId("crt-monitor")).toHaveAttribute("data-motion", "off");
            expect(screen.queryAllByTestId("crt-shutter")).toHaveLength(0);
        });

        it("follows live changes to the media query", () => {
            const { listeners, fire } = stubMatchMedia(false);
            renderShell("/");
            expect(screen.getByTestId("crt-monitor")).toHaveAttribute("data-motion", "on");
            expect(listeners.size).toBeGreaterThan(0);

            fire(true);

            expect(screen.getByTestId("crt-monitor")).toHaveAttribute("data-motion", "off");
        });
    });
});
