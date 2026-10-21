import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Overlays from "./Overlays";

describe("Overlays", () => {
    it("always renders the tube vignette", () => {
        render(<Overlays scanlines={false} />);
        expect(screen.getByTestId("overlay-vignette")).toBeInTheDocument();
    });

    it("renders the scanlines when enabled", () => {
        render(<Overlays scanlines />);
        expect(screen.getByTestId("overlay-scanlines")).toBeInTheDocument();
        expect(screen.getByTestId("overlay-vignette")).toBeInTheDocument();
    });

    it("omits the scanlines when disabled", () => {
        render(<Overlays scanlines={false} />);
        expect(screen.queryByTestId("overlay-scanlines")).not.toBeInTheDocument();
    });

    it("hides both overlays from assistive tech", () => {
        render(<Overlays scanlines />);
        expect(screen.getByTestId("overlay-scanlines")).toHaveAttribute("aria-hidden", "true");
        expect(screen.getByTestId("overlay-vignette")).toHaveAttribute("aria-hidden", "true");
    });

    it("renders nothing readable", () => {
        const { container } = render(<Overlays scanlines />);
        expect(container.textContent).toBe("");
        expect(container.childElementCount).toBe(2);
    });

    it("follows the prop when it changes", () => {
        const { rerender } = render(<Overlays scanlines />);
        expect(screen.getByTestId("overlay-scanlines")).toBeInTheDocument();
        rerender(<Overlays scanlines={false} />);
        expect(screen.queryByTestId("overlay-scanlines")).not.toBeInTheDocument();
        expect(screen.getByTestId("overlay-vignette")).toBeInTheDocument();
    });
});
