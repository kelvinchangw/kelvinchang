import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import NotFound from "./NotFound";
import styles from "./NotFound.module.css";

function renderAt(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </MemoryRouter>,
    );
}

describe("NotFound", () => {
    it("renders the cat prompt as the page heading", () => {
        renderAt("/nope");
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("$ cat ~/nope");
    });

    it("cats the missing path and reports the error", () => {
        renderAt("/nope");
        expect(screen.getByText("$ cat ~/nope")).toBeInTheDocument();
        expect(screen.getByText("cat: ~/nope: no such file or directory")).toBeInTheDocument();
    });

    it("links back to the home page", () => {
        renderAt("/nope");
        const back = screen.getByRole("link", { name: "← ~/" });
        expect(back).toHaveAttribute("href", "/");
        expect(screen.getAllByRole("link")).toHaveLength(1);
    });

    it("lets a long unknown path wrap instead of pushing the page sideways", () => {
        renderAt("/this/is/a/very/long/unknown/path/that/would/otherwise/overflow");
        expect(screen.getByRole("heading", { level: 1 })).toHaveClass(styles.file);
        expect(screen.getByText(/no such file or directory/)).toHaveClass(styles.file);
    });

    it("keeps nested paths intact", () => {
        renderAt("/projects/missing");
        expect(screen.getByText("$ cat ~/projects/missing")).toBeInTheDocument();
        expect(screen.getByText("cat: ~/projects/missing: no such file or directory")).toBeInTheDocument();
    });
});
