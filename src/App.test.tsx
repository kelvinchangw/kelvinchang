import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App, { AppRoutes } from "./App";
import useLenis from "./hooks/useLenis";

// App wires up Lenis smooth scrolling, which needs real layout; stub it in jsdom.
const lenis = vi.hoisted(() => ({ raf: vi.fn(), destroy: vi.fn(), scrollTo: vi.fn(), stop: vi.fn(), start: vi.fn() }));

vi.mock("lenis", () => ({
    default: class LenisMock {
        raf = lenis.raf;
        destroy = lenis.destroy;
        scrollTo = lenis.scrollTo;
        stop = lenis.stop;
        start = lenis.start;
    },
}));

function renderAt(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <AppRoutes />
        </MemoryRouter>,
    );
}

/** Mounts the smooth-scroll hook the way App does, without BrowserRouter. */
function LenisHost() {
    useLenis();
    return null;
}

function currentNavLabel() {
    const nav = screen.getByRole("navigation", { name: "Site" });
    return within(nav).queryByRole("link", { current: "page" })?.textContent ?? null;
}

describe("AppRoutes", () => {
    beforeEach(() => {
        vi.mocked(window.scrollTo).mockClear();
        lenis.scrollTo.mockClear();
    });

    it.each([
        ["/", "$ tail -f /var/log/kelvin.log", "~/", "home/"],
        ["/projects", "$ ls -la ~/projects", "~/projects", "projects/"],
        ["/projects/project-noir", "$ cat ~/projects/noir/README.md", "~/projects/noir", "projects/"],
        ["/blog", "$ ls -la ~/blog", "~/blog", "blog/"],
        ["/blog/001", "$ cat ~/blog/001.md", "~/blog/001", "blog/"],
        ["/about", "$ cat ~/about/whoami", "~/about", "about/"],
    ])("renders %s with its page, shell path and active nav section", (path, prompt, shellPath, navLabel) => {
        renderAt(path);
        const main = screen.getByRole("main");
        expect(within(main).getByText(prompt)).toBeInTheDocument();
        expect(within(main).getByRole("heading", { level: 1 })).toBeInTheDocument();
        expect(screen.getByTestId("title-path").textContent).toBe(shellPath);
        expect(currentNavLabel()).toBe(navLabel);
    });

    it("matches paths case-sensitively, so /Projects is a 404 like the shell path logic says", () => {
        renderAt("/Projects");
        const main = screen.getByRole("main");
        expect(within(main).getByText("$ cat ~/Projects")).toBeInTheDocument();
        expect(within(main).getByText("cat: ~/Projects: no such file or directory")).toBeInTheDocument();
        expect(screen.getByTestId("title-path").textContent).toBe("~/Projects");
        expect(currentNavLabel()).toBeNull();
    });

    it.each(["/About", "/BLOG", "/Blog/001", "/projects/Project-Noir"])("keeps %s a 404 as well", (path) => {
        renderAt(path);
        const main = screen.getByRole("main");
        expect(within(main).getByText(`cat: ~${path}: no such file or directory`)).toBeInTheDocument();
        expect(currentNavLabel()).toBeNull();
    });

    it("scrolls through Lenis on navigation once the hook is mounted, not through window.scrollTo", async () => {
        const user = userEvent.setup();
        render(
            <>
                <LenisHost />
                <MemoryRouter initialEntries={["/"]}>
                    <AppRoutes />
                </MemoryRouter>
            </>,
        );
        expect(lenis.scrollTo).not.toHaveBeenCalled();

        await user.click(within(screen.getByRole("navigation", { name: "Site" })).getByRole("link", { name: "blog/" }));

        expect(within(screen.getByRole("main")).getByText("$ ls -la ~/blog")).toBeInTheDocument();
        expect(lenis.scrollTo).toHaveBeenCalledTimes(1);
        expect(lenis.scrollTo).toHaveBeenCalledWith(0, { immediate: true, force: true });
        expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it("renders NotFound for an unknown path", () => {
        renderAt("/nope");
        const main = screen.getByRole("main");
        expect(within(main).getByRole("heading", { level: 1 })).toHaveTextContent("$ cat ~/nope");
        expect(within(main).getByText("cat: ~/nope: no such file or directory")).toBeInTheDocument();
        expect(within(main).getByRole("link", { name: "← ~/" })).toHaveAttribute("href", "/");
        expect(screen.getByTestId("title-path").textContent).toBe("~/nope");
        expect(currentNavLabel()).toBeNull();
    });

    it("treats a trailing slash as the same page", () => {
        renderAt("/projects/");
        expect(within(screen.getByRole("main")).getByText("$ ls -la ~/projects")).toBeInTheDocument();
        expect(screen.getByTestId("title-path").textContent).toBe("~/projects");
        expect(currentNavLabel()).toBe("projects/");
    });

    it("wraps every page in the shell", () => {
        renderAt("/about");
        expect(screen.getByRole("banner")).toHaveTextContent("kelvinchang.xyz");
        expect(screen.getByRole("complementary")).toHaveTextContent("kelvin@noir");
        expect(screen.getByRole("contentinfo")).toHaveTextContent("Kelvin Chang");
        expect(screen.getByRole("button", { name: ">_ terminal" })).toHaveAttribute("aria-expanded", "false");
        expect(screen.queryByTestId("terminal")).not.toBeInTheDocument();
        expect(screen.getByTestId("overlay-vignette")).toBeInTheDocument();
    });
});

describe("App", () => {
    it("mounts without throwing and renders the title bar", () => {
        const { unmount } = render(<App />);

        const banner = screen.getByRole("banner");
        expect(within(banner).getByText("kelvinchang.xyz")).toBeInTheDocument();
        expect(within(banner).getByTestId("title-path").textContent).toBe("~/");
        expect(within(banner).getByRole("button", { name: ">_ terminal" })).toHaveAttribute("aria-expanded", "false");
        expect(within(banner).getByTestId("title-clock")).toHaveTextContent(/^\d{2}:\d{2}:\d{2}$/);
        expect(within(banner).getByTestId("title-uptime")).toHaveTextContent(/^up \d+d \d{2}:\d{2}:\d{2}$/);

        expect(screen.getByRole("main")).toHaveTextContent("$ tail -f /var/log/kelvin.log");
        expect(document.title).toBe("Kelvin Chang");

        unmount();
        expect(lenis.destroy).toHaveBeenCalledTimes(1);
    });
});
