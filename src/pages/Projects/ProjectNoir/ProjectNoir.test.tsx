import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import ProjectNoir from "./ProjectNoir";

const EM_DASH = "—";

const SPECS = [
    "CPU: Intel i5-12400",
    "CPU Cooler: Noctua NH-D15",
    "MOBO: MSI PRO B660M-A",
    "Memory: TEAMGROUP 2 x 16 GB 3600MHz DDR4",
    "Storage: 1 x WD_BLACK 1 TB M.2 SSD, 3 x Seagate 12 TB HDD",
    "Case: Fractal Design Meshify 2",
    "PSU: EVGA 650 W 80+ Gold",
];

const RUNNING = ["OS: TrueNAS Scale", "Service: NAS storage", "App: Home Assistant"];

function renderNoir() {
    return render(
        <MemoryRouter initialEntries={["/projects/project-noir"]}>
            <ProjectNoir />
        </MemoryRouter>,
    );
}

/** The visible texts of the marker row that contains `label`, e.g. ["2025-01-17", "build"]. */
function markerParts(label: string) {
    const marker = screen.getByText(label).parentElement as HTMLElement;
    return Array.from(marker.children)
        .map((child) => child.textContent ?? "")
        .filter((text) => text.length > 0);
}

describe("ProjectNoir", () => {
    it("shows the cat prompt and a back link to the projects table", () => {
        renderNoir();
        expect(screen.getByText("$ cat ~/projects/noir/README.md")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "← ~/projects" })).toHaveAttribute("href", "/projects");
    });

    it("renders the header image with its caption", () => {
        renderNoir();
        const image = screen.getByRole("img", { name: "Project NOIR" });
        expect(image).toHaveAttribute("src", expect.stringContaining("project-noir-thumbnail"));
        expect(screen.getByText("header · 720×360 · noir.jpg")).toBeInTheDocument();
    });

    it("renders the title block with the ONLINE chip", () => {
        renderNoir();
        expect(screen.getByRole("heading", { level: 1, name: "# Project NOIR" })).toBeInTheDocument();
        expect(screen.getByText("## Home server / NAS")).toBeInTheDocument();
        expect(screen.getByText("ONLINE")).toBeInTheDocument();
    });

    it("marks the build and update dates", () => {
        renderNoir();
        expect(markerParts("2025-01-17")).toEqual(["2025-01-17", "build"]);
        expect(markerParts("2025-05-19")).toEqual(["2025-05-19", "update"]);
    });

    it("links to the pc part picker list in a new tab", () => {
        renderNoir();
        const link = screen.getByRole("link", { name: "pc part picker" });
        expect(link).toHaveAttribute("href", "https://pcpartpicker.com/list/zCjRFZ");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noreferrer");
        expect(link.parentElement).toHaveTextContent(
            "These are the specs of NOIR; you can look at it more in depth on its pc part picker.",
        );
    });

    it("lists all seven parts and the three things running on NOIR", () => {
        renderNoir();
        const lists = screen.getAllByRole("list");
        expect(lists).toHaveLength(2);

        const [specs, running] = lists;
        const specItems = within(specs).getAllByRole("listitem");
        expect(specItems).toHaveLength(7);
        expect(specItems.map((item) => item.lastElementChild?.textContent)).toEqual(SPECS);

        const runningItems = within(running).getAllByRole("listitem");
        expect(runningItems).toHaveLength(3);
        expect(runningItems.map((item) => item.lastElementChild?.textContent)).toEqual(RUNNING);
    });

    it("renders the write-up, the update and the EOF marker", () => {
        renderNoir();
        expect(screen.getByText(/^I started NOIR as a way to store all of my data/)).toBeInTheDocument();
        expect(
            screen.getByText("I did not need a dedicated GPU for what I wanted from NOIR so I opted for integrated Intel CPU graphics."),
        ).toBeInTheDocument();
        expect(screen.getByText("Currently, I have the following running on NOIR.")).toBeInTheDocument();
        expect(screen.getByText(/^I considered Plex for media streaming/)).toBeInTheDocument();
        expect(screen.getByText(/compiling and editing the footage for YouTube/)).toBeInTheDocument();
        expect(screen.getByText("I am putting the video on indefinite pause. LOL.")).toBeInTheDocument();
        expect(screen.getByText("EOF · Kelvin Chang")).toBeInTheDocument();
    });

    it("keeps the update after the build write-up", () => {
        const { container } = renderNoir();
        const paragraphs = Array.from(container.querySelectorAll("p")).map((p) => p.textContent ?? "");
        expect(paragraphs).toHaveLength(11);
        expect(paragraphs[0]).toMatch(/^I started NOIR as a way/);
        expect(paragraphs[paragraphs.length - 1]).toBe("I am putting the video on indefinite pause. LOL.");
    });

    it("renders no em dashes", () => {
        const { container } = renderNoir();
        expect(container.textContent).not.toContain(EM_DASH);
    });
});
