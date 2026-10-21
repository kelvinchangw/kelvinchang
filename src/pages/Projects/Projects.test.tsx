import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Projects from "./Projects";

const EM_DASH = "—";

function renderProjects() {
    return render(
        <MemoryRouter>
            <Projects />
        </MemoryRouter>,
    );
}

describe("Projects", () => {
    it("renders the listing prompt as the page heading", () => {
        renderProjects();
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("$ ls -la ~/projects");
    });

    it("shows the ls prompt and the column headers", () => {
        renderProjects();
        expect(screen.getByText("$ ls -la ~/projects")).toBeInTheDocument();
        for (const header of ["STATE", "SINCE", "NAME", "DESCRIPTION"]) {
            expect(screen.getByText(header)).toBeInTheDocument();
        }
    });

    it("lists the four projects in order", () => {
        renderProjects();
        const rows = screen.getAllByTestId("project-row");
        expect(rows).toHaveLength(4);
        expect(rows.map((row) => within(row).getByText(/^[A-Z]+\/$/).textContent)).toEqual([
            "NOIR/",
            "A/",
            "S/",
            "W/",
        ]);
    });

    it("links only NOIR to its page", () => {
        renderProjects();
        const [noir, ...dev] = screen.getAllByTestId("project-row");
        expect(noir.tagName).toBe("A");
        expect(noir).toHaveAttribute("href", "/projects/project-noir");
        expect(dev.map((row) => row.tagName)).toEqual(["DIV", "DIV", "DIV"]);
        expect(screen.getAllByRole("link")).toHaveLength(1);
    });

    it("shows an ONLINE chip for NOIR and DEV chips for the rest", () => {
        renderProjects();
        const [noir, ...dev] = screen.getAllByTestId("project-row");
        expect(within(noir).getByText("ONLINE")).toBeInTheDocument();
        expect(within(noir).queryByText("DEV")).not.toBeInTheDocument();
        for (const row of dev) {
            expect(within(row).getByText("DEV")).toBeInTheDocument();
            expect(within(row).queryByText("ONLINE")).not.toBeInTheDocument();
        }
        expect(screen.getAllByText("ONLINE")).toHaveLength(1);
        expect(screen.getAllByText("DEV")).toHaveLength(3);
    });

    it("shows the build date for NOIR and the -- placeholder for projects in development", () => {
        renderProjects();
        const [noir, ...dev] = screen.getAllByTestId("project-row");
        expect(within(noir).getByText("2025-01-17")).toBeInTheDocument();
        for (const row of dev) {
            expect(within(row).getByText("--")).toBeInTheDocument();
        }
        expect(screen.getAllByText("--")).toHaveLength(3);
    });

    it("renders the descriptions with their quotes", () => {
        renderProjects();
        const [noir, projectA, projectS, projectW] = screen.getAllByTestId("project-row");
        expect(noir).toHaveTextContent(
            `Home server / NAS - "From distance eternal come black wings o'er the land. Feathers fall, bringing ruin."`,
        );
        expect(projectA).toHaveTextContent("[REDACTED]");
        expect(projectA.textContent).not.toContain(`"`);
        expect(projectS).toHaveTextContent(
            `[REDACTED] - "We deemed this to be the fastest and most optimal way of doing things."`,
        );
        expect(projectW).toHaveTextContent(`[REDACTED] - "Only white wings may silence its echoes of arrival."`);
    });

    it("sums the projects in the footer", () => {
        renderProjects();
        expect(screen.getByText("4 projects · 1 online · 3 in development")).toBeInTheDocument();
    });

    it("renders no em dashes", () => {
        const { container } = renderProjects();
        expect(container.textContent).not.toContain(EM_DASH);
    });
});
