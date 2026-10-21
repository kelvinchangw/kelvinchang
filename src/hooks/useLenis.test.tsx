import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stubMatchMedia } from "../test/matchMedia";
import useLenis, { scrollToTop } from "./useLenis";

const lenis = vi.hoisted(() => ({
    raf: vi.fn(),
    destroy: vi.fn(),
    scrollTo: vi.fn(),
    stop: vi.fn(),
    start: vi.fn(),
    constructed: vi.fn(),
}));

vi.mock("lenis", () => ({
    default: class LenisMock {
        raf = lenis.raf;
        destroy = lenis.destroy;
        scrollTo = lenis.scrollTo;
        stop = lenis.stop;
        start = lenis.start;
        constructor(options: unknown) {
            lenis.constructed(options);
        }
    },
}));

function Probe() {
    useLenis();
    return null;
}

/** The order of every Lenis call made so far, for asserting the settle-then-jump sequence. */
function callOrder() {
    return [lenis.stop, lenis.start, lenis.scrollTo]
        .flatMap((fn, index) => fn.mock.invocationCallOrder.map((order) => [order, ["stop", "start", "scrollTo"][index]]))
        .sort((a, b) => (a[0] as number) - (b[0] as number))
        .map(([, name]) => name);
}

describe("useLenis", () => {
    beforeEach(() => {
        for (const fn of Object.values(lenis)) fn.mockClear();
        vi.mocked(window.scrollTo).mockClear();
        vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
        vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("drives Lenis from a frame loop and cancels the pending frame on unmount", () => {
        const frames: FrameRequestCallback[] = [];
        let nextId = 1;
        const request = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
            frames.push(callback);
            return nextId++;
        });
        const cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

        const { unmount } = render(<Probe />);
        expect(lenis.constructed).toHaveBeenCalledWith(expect.objectContaining({ smoothWheel: true, duration: 0.8 }));
        expect(request).toHaveBeenCalledTimes(1);

        frames[0](16);
        expect(lenis.raf).toHaveBeenCalledWith(16);
        expect(request).toHaveBeenCalledTimes(2);

        unmount();
        expect(cancel).toHaveBeenCalledWith(2);
        expect(lenis.destroy).toHaveBeenCalledTimes(1);
        expect(request).toHaveBeenCalledTimes(2);
    });

    it("scrollToTop settles Lenis and jumps through it while mounted, and falls back to window.scrollTo otherwise", () => {
        scrollToTop();
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        expect(lenis.scrollTo).not.toHaveBeenCalled();

        const { unmount } = render(<Probe />);
        scrollToTop();
        expect(callOrder()).toEqual(["stop", "start", "scrollTo"]);
        expect(lenis.scrollTo).toHaveBeenCalledWith(0, { immediate: true, force: true });
        expect(window.scrollTo).toHaveBeenCalledTimes(1);

        unmount();
        scrollToTop();
        expect(lenis.scrollTo).toHaveBeenCalledTimes(1);
        expect(window.scrollTo).toHaveBeenCalledTimes(2);
    });

    it("settles Lenis on popstate so the browser's restored offset wins, and stops listening on unmount", () => {
        const { unmount } = render(<Probe />);

        window.dispatchEvent(new PopStateEvent("popstate"));
        expect(lenis.stop).toHaveBeenCalledTimes(1);
        expect(lenis.start).toHaveBeenCalledTimes(1);
        expect(lenis.scrollTo).not.toHaveBeenCalled();

        unmount();
        window.dispatchEvent(new PopStateEvent("popstate"));
        expect(lenis.stop).toHaveBeenCalledTimes(1);
    });

    it("leaves scrolling native under prefers-reduced-motion", () => {
        stubMatchMedia(true);

        render(<Probe />);
        expect(lenis.constructed).not.toHaveBeenCalled();

        scrollToTop();
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        expect(lenis.scrollTo).not.toHaveBeenCalled();
    });

    it("switches between Lenis and native scrolling when the preference changes", () => {
        const { fire } = stubMatchMedia(false);
        render(<Probe />);
        expect(lenis.constructed).toHaveBeenCalledTimes(1);

        fire(true);
        expect(lenis.destroy).toHaveBeenCalledTimes(1);
        scrollToTop();
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);

        fire(false);
        expect(lenis.constructed).toHaveBeenCalledTimes(2);
        scrollToTop();
        expect(lenis.scrollTo).toHaveBeenCalledTimes(1);
    });
});
