import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ui from "../../components/ui/ui.module.css";
import About from "./About";

const EM_DASH = "—";

const WHOAMI = [
    "Hi, my name is Kelvin.",
    "I do programming and other creative works.",
    "Most of my interests revolve around the topics of artificial intelligence, design, metaverse, philosophy, anime, music, and finance.",
];

const HISTORY = [
    "I am a software engineer with self-taught experience and a Computer Science degree with a focus on Graphic Design.",
    "I started coding by building Minecraft plugins and mods as a kid. Now, I work on personal projects that combine engineering and design.",
    "I am especially interested in spatial computing and human-ai interaction. Cybernetics and bionics are cool too.",
    "When I am not coding, I play tennis (competitive) or pickleball (socially). I also perform and produce under the name Voidborne.",
    "I love hotpot, lamb skewers, and DnB. Mmmmmmmmm.",
];

/** The paragraphs of the block that contains `firstLine`, in order. */
function paragraphsAround(firstLine: string) {
    const block = screen.getByText(firstLine).parentElement as HTMLElement;
    return Array.from(block.querySelectorAll("p"));
}

describe("About", () => {
    it("renders the whoami prompt as the page heading and the history prompt as a subheading", () => {
        render(<About />);
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("$ cat ~/about/whoami");
        expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("$ cat ~/about/history");
    });

    it("prints whoami as three lines with the first one bright", () => {
        render(<About />);
        expect(screen.getByText("$ cat ~/about/whoami")).toBeInTheDocument();

        const lines = paragraphsAround(WHOAMI[0]);
        expect(lines.map((line) => line.textContent)).toEqual(WHOAMI);
        expect(lines[0]).toHaveClass(ui.bright, { exact: true });
        expect(lines[1]).not.toHaveAttribute("class");
        expect(lines[2]).not.toHaveAttribute("class");
    });

    it("prints history as five paragraphs", () => {
        render(<About />);
        expect(screen.getByText("$ cat ~/about/history")).toBeInTheDocument();

        const lines = paragraphsAround(HISTORY[0]);
        expect(lines.map((line) => line.textContent)).toEqual(HISTORY);
    });

    it("omits the music section", () => {
        const { container } = render(<About />);
        const text = container.textContent ?? "";
        expect(text).not.toMatch(/vbplay/i);
        expect(text).not.toMatch(/track/i);
        expect(text).not.toContain("on-record");
        expect(text).not.toContain("~/music");
        expect(screen.getAllByText(/^\$ /).map((prompt) => prompt.textContent)).toEqual([
            "$ cat ~/about/whoami",
            "$ cat ~/about/history",
        ]);
        expect(container.querySelectorAll("img")).toHaveLength(0);
    });

    it("renders no em dashes", () => {
        const { container } = render(<About />);
        expect(container.textContent).not.toContain(EM_DASH);
    });
});
