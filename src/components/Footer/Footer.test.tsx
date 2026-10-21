import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Footer from "./Footer";

const PROFILES: ReadonlyArray<readonly [string, string]> = [
    ["linkedin", "https://www.linkedin.com/in/kelvinchangw/"],
    ["github", "https://github.com/kelvinchangw"],
    ["youtube", "https://www.youtube.com/@kelvin-ai"],
];

describe("Footer", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("is the page contentinfo", () => {
        render(<Footer year={2025} />);
        expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });

    it("links the email address as mailto in the same tab", () => {
        render(<Footer year={2025} />);
        const link = screen.getByRole("link", { name: "kelvinchangw@gmail.com" });
        expect(link).toHaveAttribute("href", "mailto:kelvinchangw@gmail.com");
        expect(link).not.toHaveAttribute("target");
    });

    it.each(PROFILES)("opens %s in a new tab without a referrer", (name, href) => {
        render(<Footer year={2025} />);
        const link = screen.getByRole("link", { name });
        expect(link).toHaveAttribute("href", href);
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noreferrer");
    });

    it("renders exactly the four links, email first", () => {
        render(<Footer year={2025} />);
        expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual([
            "kelvinchangw@gmail.com",
            "linkedin",
            "github",
            "youtube",
        ]);
    });

    it("prints the copyright line with the given year", () => {
        render(<Footer year={2025} />);
        expect(screen.getByRole("contentinfo")).toHaveTextContent("© 2025 Kelvin Chang · built with 💜");
    });

    it("defaults the year to the current one", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2031, 5, 15, 12, 0, 0));
        render(<Footer />);
        expect(screen.getByRole("contentinfo")).toHaveTextContent("© 2031 Kelvin Chang · built with 💜");
    });

    it("prefers an explicit year over the current one", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2031, 5, 15, 12, 0, 0));
        render(<Footer year={2025} />);
        expect(screen.getByRole("contentinfo")).toHaveTextContent("© 2025 Kelvin Chang");
        expect(screen.getByRole("contentinfo")).not.toHaveTextContent("2031");
    });
});
