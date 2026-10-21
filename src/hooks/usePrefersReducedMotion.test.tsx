import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { REDUCED_MOTION_QUERY as QUERY, stubMatchMedia } from "../test/matchMedia";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

describe("usePrefersReducedMotion", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("returns false when matchMedia is unavailable", () => {
        vi.stubGlobal("matchMedia", undefined);

        const { result, unmount } = renderHook(() => usePrefersReducedMotion());

        expect(result.current).toBe(false);
        expect(() => unmount()).not.toThrow();
    });

    it("reads the OS preference on mount", () => {
        const { matchMedia } = stubMatchMedia(true);

        const { result } = renderHook(() => usePrefersReducedMotion());

        expect(result.current).toBe(true);
        expect(matchMedia).toHaveBeenCalledWith(QUERY);
        expect(matchMedia.mock.calls.every(([query]) => query === QUERY)).toBe(true);
    });

    it("starts false when the preference is off", () => {
        stubMatchMedia(false);

        const { result } = renderHook(() => usePrefersReducedMotion());

        expect(result.current).toBe(false);
    });

    it("subscribes to change events and tracks them live", () => {
        const { list, fire } = stubMatchMedia(false);
        const { result } = renderHook(() => usePrefersReducedMotion());

        expect(list.addEventListener).toHaveBeenCalledTimes(1);
        expect(list.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));

        fire(true);
        expect(result.current).toBe(true);

        fire(false);
        expect(result.current).toBe(false);

        fire(true);
        expect(result.current).toBe(true);
    });

    it("removes its listener on unmount", () => {
        const { list, listeners, fire } = stubMatchMedia(false);
        const { result, unmount } = renderHook(() => usePrefersReducedMotion());
        const [, listener] = list.addEventListener.mock.calls[0];

        unmount();

        expect(list.removeEventListener).toHaveBeenCalledTimes(1);
        expect(list.removeEventListener).toHaveBeenCalledWith("change", listener);
        expect(listeners.size).toBe(0);

        fire(true);
        expect(result.current).toBe(false);
    });
});
