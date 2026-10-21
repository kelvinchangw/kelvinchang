import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CrtMonitor from "./CrtMonitor";
import styles from "./CrtMonitor.module.css";

const SRC = "/assets/pfp.png";
const LABEL = "Portrait of Kelvin on a CRT monitor";
const SRC_URL = /^url\(["']?\/assets\/pfp\.png["']?\)$/;

/** The five layers that paint the portrait are the only ones carrying an inline style. */
function imageLayers(monitor: HTMLElement): HTMLElement[] {
    return Array.from(monitor.querySelectorAll<HTMLElement>("[style]"));
}

describe("CrtMonitor", () => {
    it("is exposed as an image with a descriptive label", () => {
        render(<CrtMonitor src={SRC} />);
        expect(screen.getByRole("img", { name: LABEL })).toBe(screen.getByTestId("crt-monitor"));
    });

    it("paints the portrait on exactly five layers", () => {
        render(<CrtMonitor src={SRC} />);
        const layers = imageLayers(screen.getByTestId("crt-monitor"));
        expect(layers).toHaveLength(5);
        for (const layer of layers) {
            expect(layer.style.backgroundImage).toMatch(SRC_URL);
        }
    });

    it("uses whatever src it is given", () => {
        render(<CrtMonitor src="/elsewhere/zero.png" />);
        const layers = imageLayers(screen.getByTestId("crt-monitor"));
        expect(layers).toHaveLength(5);
        for (const layer of layers) {
            expect(layer.style.backgroundImage).toContain("/elsewhere/zero.png");
        }
    });

    it("renders the caption when one is given", () => {
        render(<CrtMonitor src={SRC} caption="kelvin · pfp.png" />);
        expect(within(screen.getByTestId("crt-monitor")).getByText("kelvin · pfp.png")).toBeInTheDocument();
    });

    it("renders no text without a caption", () => {
        render(<CrtMonitor src={SRC} />);
        expect(screen.getByTestId("crt-monitor").textContent).toBe("");
    });

    describe("with motion on (the default)", () => {
        it("reports motion on and plays the power-on shutters", () => {
            render(<CrtMonitor src={SRC} />);
            const monitor = screen.getByTestId("crt-monitor");
            expect(monitor).toHaveAttribute("data-motion", "on");
            expect(within(monitor).getAllByTestId("crt-shutter")).toHaveLength(2);
        });

        it("does not freeze the tube", () => {
            render(<CrtMonitor src={SRC} motion />);
            expect(screen.getByTestId("crt-monitor")).not.toHaveClass(styles.still);
        });

        it("adds the three power-on layers (two shutters and the flash line) to the ten tube layers", () => {
            render(<CrtMonitor src={SRC} />);
            expect(screen.getByTestId("crt-monitor").childElementCount).toBe(13);
        });
    });

    describe("with motion off", () => {
        it("reports motion off and renders no shutters", () => {
            render(<CrtMonitor src={SRC} motion={false} />);
            const monitor = screen.getByTestId("crt-monitor");
            expect(monitor).toHaveAttribute("data-motion", "off");
            expect(within(monitor).queryAllByTestId("crt-shutter")).toHaveLength(0);
        });

        it("freezes the tube with the still class", () => {
            render(<CrtMonitor src={SRC} motion={false} />);
            expect(screen.getByTestId("crt-monitor")).toHaveClass(styles.still);
        });

        it("keeps the ten tube layers and the portrait", () => {
            render(<CrtMonitor src={SRC} motion={false} />);
            const monitor = screen.getByTestId("crt-monitor");
            expect(monitor.childElementCount).toBe(10);
            expect(imageLayers(monitor)).toHaveLength(5);
        });

        it("still renders the caption", () => {
            render(<CrtMonitor src={SRC} motion={false} caption="kelvin · pfp.png" />);
            expect(screen.getByText("kelvin · pfp.png")).toBeInTheDocument();
        });
    });

    it("appends a custom class name", () => {
        render(<CrtMonitor src={SRC} className="rail-monitor" />);
        expect(screen.getByTestId("crt-monitor")).toHaveClass("rail-monitor");
    });

    it("is a memoized component", () => {
        const exported = CrtMonitor as unknown as { $$typeof: symbol; type: unknown };
        expect(exported.$$typeof).toBe(Symbol.for("react.memo"));
        expect(typeof exported.type).toBe("function");
    });
});
