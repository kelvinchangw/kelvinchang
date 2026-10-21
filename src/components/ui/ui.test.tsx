import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { BackLink, Chip, DashList, EofMarker, FootNote, Marker, PhosphorImage, Prompt } from "./index";
import ui from "./ui.module.css";

function childrenOf(element: Element): HTMLElement[] {
    return Array.from(element.children) as HTMLElement[];
}

/** Asserts the element's class list is exactly `classes`, read from the same CSS module the kit uses. */
function expectClasses(element: Element | null, ...classes: string[]) {
    expect(element).toHaveClass(classes.join(" "), { exact: true });
}

describe("Prompt", () => {
    it("renders the command line", () => {
        render(<Prompt>$ ls -la ~/projects</Prompt>);
        const prompt = screen.getByText("$ ls -la ~/projects");
        expect(prompt.tagName).toBe("DIV");
        expectClasses(prompt, ui.prompt);
    });

    it("appends a custom class name", () => {
        render(<Prompt className="extra">$ whoami</Prompt>);
        expectClasses(screen.getByText("$ whoami"), ui.prompt, "extra");
    });
});

describe("Chip", () => {
    it("is inverse video by default", () => {
        render(<Chip>ONLINE</Chip>);
        const chip = screen.getByText("ONLINE");
        expect(chip.tagName).toBe("SPAN");
        expectClasses(chip, ui.chipInverse);
    });

    it("renders the inverse variant explicitly", () => {
        render(<Chip variant="inverse">001</Chip>);
        expectClasses(screen.getByText("001"), ui.chipInverse);
    });

    it("renders the outline variant", () => {
        render(<Chip variant="outline">DEV</Chip>);
        expectClasses(screen.getByText("DEV"), ui.chipOutline);
    });

    it("appends a custom class name", () => {
        render(
            <Chip variant="outline" className="extra">
                DEV
            </Chip>,
        );
        expectClasses(screen.getByText("DEV"), ui.chipOutline, "extra");
    });
});

describe("Marker", () => {
    it("renders label, line and count", () => {
        const { container } = render(<Marker left="2025" right="3" />);
        const parts = childrenOf(container.firstElementChild!);
        expect(parts).toHaveLength(3);
        expect(parts[0]).toHaveTextContent("2025");
        expect(parts[1]).toHaveAttribute("aria-hidden", "true");
        expectClasses(parts[1], ui.markerLine);
        expect(parts[2]).toHaveTextContent("3");
    });

    it("renders only the label and the line when right is omitted", () => {
        const { container } = render(<Marker left="in development" />);
        const parts = childrenOf(container.firstElementChild!);
        expect(parts).toHaveLength(2);
        expect(parts[0]).toHaveTextContent("in development");
        expect(parts[1]).toHaveAttribute("aria-hidden", "true");
    });

    it("renders only the line and the right side when left is omitted", () => {
        const { container } = render(<Marker right="entry" />);
        const parts = childrenOf(container.firstElementChild!);
        expect(parts).toHaveLength(2);
        expect(parts[0]).toHaveAttribute("aria-hidden", "true");
        expect(parts[1]).toHaveTextContent("entry");
    });

    it("renders just the line with neither side", () => {
        const { container } = render(<Marker />);
        const parts = childrenOf(container.firstElementChild!);
        expect(parts).toHaveLength(1);
        expect(parts[0]).toHaveAttribute("aria-hidden", "true");
        expect(container.textContent).toBe("");
    });

    it("accepts nodes on either side and a custom class name", () => {
        const { container } = render(<Marker left={<em>2025-01-17</em>} right={<b>build</b>} className="extra" />);
        expectClasses(container.firstElementChild, ui.marker, "extra");
        expect(screen.getByText("2025-01-17").tagName).toBe("EM");
        expect(screen.getByText("build").tagName).toBe("B");
    });
});

describe("EofMarker", () => {
    it("wraps the label between two hidden lines", () => {
        const { container } = render(<EofMarker>EOF · Kelvin Chang</EofMarker>);
        const parts = childrenOf(container.firstElementChild!);
        expect(parts).toHaveLength(3);
        expect(parts[0]).toHaveAttribute("aria-hidden", "true");
        expectClasses(parts[0], ui.markerLine);
        expect(parts[1]).toHaveTextContent("EOF · Kelvin Chang");
        expect(parts[1]).not.toHaveAttribute("aria-hidden");
        expect(parts[2]).toHaveAttribute("aria-hidden", "true");
        expectClasses(parts[2], ui.markerLine);
    });

    it("shares the marker class and appends a custom one", () => {
        const { container } = render(<EofMarker className="extra">EOF</EofMarker>);
        expectClasses(container.firstElementChild, ui.marker, "extra");
    });
});

describe("PhosphorImage", () => {
    it("renders the image with its alt text inside a figure", () => {
        render(<PhosphorImage src="/img/noir.jpg" alt="NOIR, the home server" />);
        const img = screen.getByRole("img", { name: "NOIR, the home server" });
        expect(img).toHaveAttribute("src", "/img/noir.jpg");
        expect(screen.getByRole("figure")).toContainElement(img);
    });

    it("hides the phosphor tint from assistive tech", () => {
        render(<PhosphorImage src="/img/noir.jpg" alt="NOIR" />);
        const tint = screen.getByRole("figure").querySelector("div[aria-hidden='true']");
        expect(tint).not.toBeNull();
        expectClasses(tint, ui.phosphorTint);
    });

    it("renders the caption when given", () => {
        render(<PhosphorImage src="/img/noir.jpg" alt="NOIR" caption="header · 720×360 · noir.jpg" />);
        const caption = screen.getByText("header · 720×360 · noir.jpg");
        expect(caption.tagName).toBe("FIGCAPTION");
        expect(screen.getByRole("figure")).toContainElement(caption);
    });

    it("renders no caption by default", () => {
        render(<PhosphorImage src="/img/noir.jpg" alt="NOIR" />);
        expect(screen.getByRole("figure").querySelector("figcaption")).toBeNull();
    });

    it("appends a custom class name", () => {
        render(<PhosphorImage src="/img/noir.jpg" alt="NOIR" className="extra" />);
        expectClasses(screen.getByRole("figure"), ui.phosphor, "extra");
    });
});

describe("BackLink", () => {
    it("links back to the given route", () => {
        render(
            <MemoryRouter>
                <BackLink to="/projects">← ~/projects</BackLink>
            </MemoryRouter>,
        );
        const link = screen.getByRole("link", { name: "← ~/projects" });
        expect(link).toHaveAttribute("href", "/projects");
        expectClasses(link, ui.backLink);
    });
});

describe("FootNote", () => {
    it("renders the note", () => {
        render(<FootNote>4 projects · 1 online · 3 in development</FootNote>);
        const note = screen.getByText("4 projects · 1 online · 3 in development");
        expectClasses(note, ui.footNote);
    });

    it("appends a custom class name", () => {
        render(<FootNote className="extra">1 entry · newest first</FootNote>);
        expectClasses(screen.getByText("1 entry · newest first"), ui.footNote, "extra");
    });
});

describe("DashList", () => {
    const ITEMS = ["OS: TrueNAS Scale", "Service: NAS storage", "App: Home Assistant"] as const;

    it("renders one list item per entry in order", () => {
        render(<DashList items={ITEMS} />);
        const items = within(screen.getByRole("list")).getAllByRole("listitem");
        expect(items).toHaveLength(3);
        items.forEach((item, index) => {
            expect(within(item).getByText(ITEMS[index])).toBeInTheDocument();
        });
    });

    it("prefixes each item with a hidden dash", () => {
        render(<DashList items={ITEMS} />);
        for (const item of screen.getAllByRole("listitem")) {
            const [dash, text] = childrenOf(item);
            expect(dash).toHaveTextContent("-");
            expect(dash).toHaveAttribute("aria-hidden", "true");
            expectClasses(dash, ui.listDash);
            expect(text).not.toHaveAttribute("aria-hidden");
        }
    });

    it("renders an empty list for no items", () => {
        render(<DashList items={[]} />);
        expect(screen.getByRole("list")).toBeEmptyDOMElement();
    });

    it("appends a custom class name", () => {
        render(<DashList items={["one"]} className="extra" />);
        expectClasses(screen.getByRole("list"), ui.list, "extra");
    });
});
