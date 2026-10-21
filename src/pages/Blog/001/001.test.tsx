import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { Post } from "../../../data/site";
import Post001 from "./001";

const EM_DASH = "—";

function renderPost() {
    return render(
        <MemoryRouter initialEntries={["/blog/001"]}>
            <Post001 />
        </MemoryRouter>,
    );
}

/** The visible texts of the marker row that contains `label`, e.g. ["2025-12-15", "entry"]. */
function markerParts(label: string) {
    const marker = screen.getByText(label).parentElement as HTMLElement;
    return Array.from(marker.children)
        .map((child) => child.textContent ?? "")
        .filter((text) => text.length > 0);
}

describe("Post001", () => {
    it("shows the cat prompt and a back link to the blog", () => {
        renderPost();
        expect(screen.getByText("$ cat ~/blog/001.md")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "← ~/blog" })).toHaveAttribute("href", "/blog");
        expect(screen.getAllByRole("link")).toHaveLength(1);
    });

    it("renders the header image with its caption", () => {
        renderPost();
        const image = screen.getByRole("img", { name: "Beginning anew" });
        expect(image).toHaveAttribute("src", expect.stringContaining("post-001-thumbnail"));
        expect(screen.getByText("header · 720×360 · 001.jpg")).toBeInTheDocument();
    });

    it("renders the title block with the 001 chip", () => {
        renderPost();
        expect(screen.getByRole("heading", { level: 1, name: "# Beginning anew" })).toBeInTheDocument();
        expect(screen.getByText("## In search of Heaven")).toBeInTheDocument();
        expect(screen.getByText("001")).toBeInTheDocument();
    });

    it("marks the entry date", () => {
        renderPost();
        expect(markerParts("2025-12-15")).toEqual(["2025-12-15", "entry"]);
    });

    it("renders the body and the EOF marker", () => {
        const { container } = renderPost();
        const paragraphs = Array.from(container.querySelectorAll("p")).map((p) => p.textContent);
        expect(paragraphs).toEqual(["I am exactly where I should be."]);
        expect(screen.getByText("EOF · Kelvin Chang")).toBeInTheDocument();
    });

    it("renders no em dashes", () => {
        const { container } = renderPost();
        expect(container.textContent).not.toContain(EM_DASH);
    });

    it("finds its post by id, not by position in POSTS", async () => {
        vi.resetModules();
        vi.doMock("../../../data/site", async (importOriginal) => {
            const actual = await importOriginal<typeof import("../../../data/site")>();
            const newer: Post = { ...actual.POSTS[0], id: "002", date: "2026-10-01", title: "Newer", sub: "post" };
            return { ...actual, POSTS: [newer, ...actual.POSTS] };
        });
        try {
            const { default: Post001WithNewerPost } = await import("./001");
            render(
                <MemoryRouter initialEntries={["/blog/001"]}>
                    <Post001WithNewerPost />
                </MemoryRouter>,
            );
            expect(screen.getByRole("heading", { level: 1, name: "# Beginning anew" })).toBeInTheDocument();
            expect(screen.queryByText("# Newer")).not.toBeInTheDocument();
        } finally {
            vi.doUnmock("../../../data/site");
            vi.resetModules();
        }
    });
});
