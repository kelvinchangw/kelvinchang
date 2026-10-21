import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Blog from "./Blog";

const EM_DASH = "—";

function renderBlog() {
    return render(
        <MemoryRouter>
            <Blog />
        </MemoryRouter>,
    );
}

describe("Blog", () => {
    it("renders the listing prompt as the page heading and the preview prompt as a subheading", () => {
        renderBlog();
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("$ ls -la ~/blog");
        expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("$ head -n 3 ~/blog/001.md");
    });

    it("shows the ls prompt and the column headers", () => {
        renderBlog();
        expect(screen.getByText("$ ls -la ~/blog")).toBeInTheDocument();
        for (const header of ["ID", "DATE", "TITLE", "LENGTH"]) {
            expect(screen.getByText(header)).toBeInTheDocument();
        }
    });

    it("lists the single post as a link to its page", () => {
        renderBlog();
        const rows = screen.getAllByTestId("post-row");
        expect(rows).toHaveLength(1);

        const [row] = rows;
        expect(row.tagName).toBe("A");
        expect(row).toHaveAttribute("href", "/blog/001");
        expect(within(row).getByText("001")).toBeInTheDocument();
        expect(within(row).getByText("2025-12-15")).toBeInTheDocument();
        expect(row).toHaveTextContent("Beginning anew - In search of Heaven");
        expect(within(row).getByText("1 min")).toBeInTheDocument();
        expect(screen.getAllByRole("link")).toHaveLength(1);
    });

    it("shows the entry count in the footer", () => {
        renderBlog();
        expect(screen.getByText("1 entry · newest first")).toBeInTheDocument();
    });

    it("previews the newest post with head -n 3", () => {
        renderBlog();
        expect(screen.getByText("$ head -n 3 ~/blog/001.md")).toBeInTheDocument();
        expect(screen.getByText("# Beginning anew")).toBeInTheDocument();
        expect(screen.getByText("## In search of Heaven")).toBeInTheDocument();
        expect(screen.getByText("I am exactly where I should be.")).toBeInTheDocument();
    });

    it("renders no em dashes", () => {
        const { container } = renderBlog();
        expect(container.textContent).not.toContain(EM_DASH);
    });
});
