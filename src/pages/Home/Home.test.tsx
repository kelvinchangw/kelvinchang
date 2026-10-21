import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Home from "./Home";

const EM_DASH = "—";

function renderHome() {
    return render(
        <MemoryRouter>
            <Home />
        </MemoryRouter>,
    );
}

function filterButtons() {
    return within(screen.getByRole("group", { name: "Filter log" })).getAllByRole("button");
}

function pressedFilters() {
    return filterButtons()
        .filter((button) => button.getAttribute("aria-pressed") === "true")
        .map((button) => button.textContent);
}

function rowHrefs() {
    return screen.getAllByTestId("log-row").map((row) => row.getAttribute("href"));
}

/** Label, count and row count of every rendered group, in order. */
function groupSummaries() {
    return screen.getAllByTestId("log-group").map((group) => {
        const marker = group.firstElementChild as HTMLElement;
        const [label, count] = Array.from(marker.children)
            .map((child) => child.textContent ?? "")
            .filter((text) => text.length > 0);
        return { label, count, rows: within(group).getAllByTestId("log-row").length };
    });
}

describe("Home", () => {
    it("renders the log prompt as the page heading", () => {
        renderHome();
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("$ tail -f /var/log/kelvin.log");
    });

    it("shows the tail -f prompt", () => {
        renderHome();
        expect(screen.getByText("$ tail -f /var/log/kelvin.log")).toBeInTheDocument();
    });

    it("renders the four filter buttons with only 'all' pressed by default", () => {
        renderHome();
        const buttons = filterButtons();
        expect(buttons.map((button) => button.textContent)).toEqual(["all", "post", "proj", "noir"]);
        expect(buttons.map((button) => button.getAttribute("aria-pressed"))).toEqual([
            "true",
            "false",
            "false",
            "false",
        ]);
    });

    it("shows both groups with their counts and all six rows by default", () => {
        renderHome();
        expect(groupSummaries()).toEqual([
            { label: "2025", count: "3", rows: 3 },
            { label: "in development", count: "3", rows: 3 },
        ]);
        expect(screen.getAllByTestId("log-row")).toHaveLength(6);
    });

    it("links every row to its page, newest first", () => {
        renderHome();
        const rows = screen.getAllByTestId("log-row");
        expect(rows.every((row) => row.tagName === "A")).toBe(true);
        expect(rowHrefs()).toEqual([
            "/blog/001",
            "/projects/project-noir",
            "/projects/project-noir",
            "/projects",
            "/projects",
            "/projects",
        ]);
    });

    it("renders date, title - subtitle and meta for each row", () => {
        renderHome();
        const [post, update, build, projectA, projectS, projectW] = screen.getAllByTestId("log-row");

        expect(within(post).getByText("2025-12-15")).toBeInTheDocument();
        expect(post).toHaveTextContent("Beginning anew - In search of Heaven");
        expect(within(post).getByText("post · 1 min")).toBeInTheDocument();

        expect(within(update).getByText("2025-05-19")).toBeInTheDocument();
        expect(update).toHaveTextContent("NOIR - build video placed on indefinite pause. LOL.");
        expect(within(update).getByText("update")).toBeInTheDocument();

        expect(within(build).getByText("2025-01-17")).toBeInTheDocument();
        expect(build).toHaveTextContent("NOIR - build complete · i5-12400 · 32 GB · 36 TB raw · TrueNAS Scale");
        expect(within(build).getByText("→ online")).toBeInTheDocument();

        for (const row of [projectA, projectS, projectW]) {
            expect(within(row).getByText("--")).toBeInTheDocument();
            expect(within(row).getByText("dev")).toBeInTheDocument();
        }
        expect(projectA).toHaveTextContent("Project A - [REDACTED]");
        expect(projectS).toHaveTextContent(
            `Project S - "We deemed this to be the fastest and most optimal way of doing things."`,
        );
        expect(projectW).toHaveTextContent(`Project W - "Only white wings may silence its echoes of arrival."`);
    });

    it("shows the entry count and the active filter in the footer", () => {
        renderHome();
        expect(screen.getByText("6 entries · newest first")).toBeInTheDocument();
        expect(screen.getByText("filter: all")).toBeInTheDocument();
    });

    it("filters down to the single post entry", async () => {
        const user = userEvent.setup();
        renderHome();

        await user.click(screen.getByRole("button", { name: "post" }));

        expect(pressedFilters()).toEqual(["post"]);
        expect(rowHrefs()).toEqual(["/blog/001"]);
        expect(groupSummaries()).toEqual([{ label: "2025", count: "1", rows: 1 }]);
        expect(screen.getByText("1 entry · newest first")).toBeInTheDocument();
        expect(screen.getByText("filter: post")).toBeInTheDocument();
    });

    it("shows only the in-development group for the proj filter", async () => {
        const user = userEvent.setup();
        renderHome();

        await user.click(screen.getByRole("button", { name: "proj" }));

        expect(pressedFilters()).toEqual(["proj"]);
        expect(groupSummaries()).toEqual([{ label: "in development", count: "3", rows: 3 }]);
        expect(screen.queryByText("2025")).not.toBeInTheDocument();
        expect(rowHrefs()).toEqual(["/projects", "/projects", "/projects"]);
        expect(screen.getByText("3 entries · newest first")).toBeInTheDocument();
        expect(screen.getByText("filter: proj")).toBeInTheDocument();
    });

    it("shows the two NOIR updates for the noir filter", async () => {
        const user = userEvent.setup();
        renderHome();

        await user.click(screen.getByRole("button", { name: "noir" }));

        expect(pressedFilters()).toEqual(["noir"]);
        expect(rowHrefs()).toEqual(["/projects/project-noir", "/projects/project-noir"]);
        expect(groupSummaries()).toEqual([{ label: "2025", count: "2", rows: 2 }]);
        expect(screen.getByText("2 entries · newest first")).toBeInTheDocument();
        expect(screen.getByText("filter: noir")).toBeInTheDocument();
    });

    it("restores the full log when 'all' is selected again", async () => {
        const user = userEvent.setup();
        renderHome();

        await user.click(screen.getByRole("button", { name: "noir" }));
        await user.click(screen.getByRole("button", { name: "all" }));

        expect(pressedFilters()).toEqual(["all"]);
        expect(screen.getAllByTestId("log-row")).toHaveLength(6);
        expect(groupSummaries()).toHaveLength(2);
        expect(screen.getByText("6 entries · newest first")).toBeInTheDocument();
        expect(screen.getByText("filter: all")).toBeInTheDocument();
    });

    it("omits the music block", () => {
        const { container } = renderHome();
        expect(screen.queryByText(/on-record/)).not.toBeInTheDocument();
        expect(container.textContent).not.toMatch(/music/i);
        expect(screen.getAllByText(/^\$ /)).toHaveLength(1);
    });

    it("renders no em dashes", () => {
        const { container } = renderHome();
        expect(container.textContent).not.toContain(EM_DASH);
    });
});
