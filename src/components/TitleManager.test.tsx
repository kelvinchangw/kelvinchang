import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import TitleManager from "./TitleManager";

function renderAt(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <TitleManager />
        </MemoryRouter>,
    );
}

function GoTo({ to }: { to: string }) {
    const navigate = useNavigate();
    return (
        <button type="button" onClick={() => navigate(to)}>
            go to {to}
        </button>
    );
}

describe("TitleManager", () => {
    beforeEach(() => {
        document.title = "";
    });

    it.each([
        ["/", "Kelvin Chang"],
        ["/projects", "Projects"],
        ["/blog", "Blog"],
        ["/about", "About"],
    ])("titles %s as %s", (path, title) => {
        renderAt(path);
        expect(document.title).toBe(title);
    });

    it.each(["/projects/project-noir", "/blog/001", "/about/anything", "/nope", "/Projects"])(
        "falls back to Kelvin Chang for %s",
        (path) => {
            renderAt(path);
            expect(document.title).toBe("Kelvin Chang");
        },
    );

    it("renders nothing", () => {
        const { container } = renderAt("/projects");
        expect(container).toBeEmptyDOMElement();
    });

    it("retitles the document on navigation", async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter initialEntries={["/"]}>
                <TitleManager />
                <GoTo to="/about" />
                <GoTo to="/nope" />
            </MemoryRouter>,
        );
        expect(document.title).toBe("Kelvin Chang");
        await user.click(screen.getByRole("button", { name: "go to /about" }));
        expect(document.title).toBe("About");
        await user.click(screen.getByRole("button", { name: "go to /nope" }));
        expect(document.title).toBe("Kelvin Chang");
    });

    it.each([
        ["/projects/", "Projects"],
        ["/blog/", "Blog"],
        ["/about/", "About"],
        ["/projects//", "Projects"],
    ])("titles the trailing-slash %s as %s, matching the router and the shell path", (path, title) => {
        renderAt(path);
        expect(document.title).toBe(title);
    });
});
