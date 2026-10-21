import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { UPTIME_SINCE_MS } from "../../lib/time";
import Rail, { type RailProps } from "./Rail";
import styles from "./Rail.module.css";

/** One day, two hours, three minutes and four seconds after NOIR's build day. */
const NOW_MS = UPTIME_SINCE_MS + (86400 + 2 * 3600 + 3 * 60 + 4) * 1000;
const UPTIME = "1d 02:03:04";

const SECTIONS = ["home", "projects", "blog", "about"] as const;

function renderRail(overrides: Partial<RailProps> = {}) {
    const props: RailProps = { section: "home", nowMs: NOW_MS, crtMotion: true, ...overrides };
    return render(
        <MemoryRouter>
            <Rail {...props} />
        </MemoryRouter>,
    );
}

function navLinks(): HTMLElement[] {
    return within(screen.getByRole("navigation", { name: "Site" })).getAllByRole("link");
}

describe("Rail", () => {
    it("renders the status chip at the body size (no 12px chip rule), as the design does", () => {
        renderRail();
        expect(screen.getByText("ONLINE")).toHaveClass(styles.statusChip);
    });

    it("renders the four prompt lines", () => {
        renderRail();
        for (const prompt of ["$ whoami", "$ ls", "$ status", "$ cat /etc/motd"]) {
            expect(screen.getByText(prompt)).toBeInTheDocument();
        }
    });

    describe("$ whoami", () => {
        it("shows kelvin@noir with the @ in its own span", () => {
            renderRail();
            const at = screen.getByText("@");
            expect(at.tagName).toBe("SPAN");
            expect(at.parentElement).toHaveTextContent(/^kelvin@noir$/);
        });

        it("shows the tagline", () => {
            renderRail();
            expect(screen.getByText("engineer · designer")).toBeInTheDocument();
        });

        it("shows the captioned CRT portrait", () => {
            renderRail();
            const monitor = screen.getByRole("img", { name: "Portrait of Kelvin on a CRT monitor" });
            expect(within(monitor).getByText("kelvin · pfp.png")).toBeInTheDocument();
            const layer = monitor.querySelector<HTMLElement>("[style]");
            expect(layer?.style.backgroundImage).toContain("pfp.png");
        });

        it("passes crtMotion on to the monitor", () => {
            renderRail({ crtMotion: true });
            const monitor = screen.getByTestId("crt-monitor");
            expect(monitor).toHaveAttribute("data-motion", "on");
            expect(within(monitor).getAllByTestId("crt-shutter")).toHaveLength(2);
        });

        it("passes crtMotion off to the monitor", () => {
            renderRail({ crtMotion: false });
            const monitor = screen.getByTestId("crt-monitor");
            expect(monitor).toHaveAttribute("data-motion", "off");
            expect(within(monitor).queryAllByTestId("crt-shutter")).toHaveLength(0);
        });
    });

    describe("$ ls", () => {
        it("links the four sections in order", () => {
            renderRail();
            expect(navLinks().map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
                ["home/", "/"],
                ["projects/", "/projects"],
                ["blog/", "/blog"],
                ["about/", "/about"],
            ]);
        });

        it.each(SECTIONS)("marks only %s/ as the current page", (section) => {
            renderRail({ section });
            const current = within(screen.getByRole("navigation", { name: "Site" })).getAllByRole("link", {
                current: "page",
            });
            expect(current).toHaveLength(1);
            expect(current[0]).toHaveTextContent(`${section}/`);
            for (const link of navLinks()) {
                if (link !== current[0]) expect(link).not.toHaveAttribute("aria-current");
            }
        });

        it("marks nothing when the page is outside the nav", () => {
            renderRail({ section: null });
            for (const link of navLinks()) {
                expect(link).not.toHaveAttribute("aria-current");
            }
        });
    });

    describe("$ status", () => {
        it("lists the status keys in order", () => {
            renderRail();
            expect(screen.getAllByRole("term").map((term) => term.textContent)).toEqual([
                "NOIR",
                "uptime",
                "os",
                "services",
                "storage",
                "projects",
                "entries",
            ]);
        });

        it("lists the status values in order", () => {
            renderRail();
            expect(screen.getAllByRole("definition").map((value) => value.textContent)).toEqual([
                "ONLINE",
                UPTIME,
                "TrueNAS Scale",
                "NAS · Home Assistant",
                "1×1TB NVMe · 3×12TB HDD",
                "1 online · 3 in dev",
                "1",
            ]);
        });

        it("formats the uptime from nowMs", () => {
            const { rerender } = renderRail();
            expect(screen.getByTestId("rail-uptime")).toHaveTextContent(UPTIME);
            rerender(
                <MemoryRouter>
                    <Rail section="home" nowMs={NOW_MS + 61_000} crtMotion />
                </MemoryRouter>,
            );
            expect(screen.getByTestId("rail-uptime")).toHaveTextContent("1d 02:04:05");
        });

        it("never shows a negative uptime", () => {
            renderRail({ nowMs: UPTIME_SINCE_MS - 5_000 });
            expect(screen.getByTestId("rail-uptime")).toHaveTextContent("0d 00:00:00");
        });
    });

    describe("$ cat /etc/motd", () => {
        it("prints the message of the day", () => {
            renderRail();
            expect(screen.getByText("All roads lead to me.")).toBeInTheDocument();
        });
    });

    it("is identical regardless of the section", () => {
        const { unmount } = renderRail({ section: "about" });
        const aboutText = screen.getByRole("complementary").textContent;
        unmount();
        renderRail({ section: null });
        expect(screen.getByRole("complementary").textContent).toBe(aboutText);
    });
});
