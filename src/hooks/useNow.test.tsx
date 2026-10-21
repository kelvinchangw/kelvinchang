import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNow } from "./useNow";

const T0 = new Date(2026, 9, 20, 12, 0, 0).getTime();

function advance(ms: number) {
    act(() => {
        vi.advanceTimersByTime(ms);
    });
}

describe("useNow", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(T0);
    });

    afterEach(() => {
        // Restore spies before uninstalling the fake timers; the reverse order would put the fake
        // clearInterval back on the global after the real one had been restored.
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it("returns the current time in milliseconds", () => {
        const { result } = renderHook(() => useNow());

        expect(typeof result.current).toBe("number");
        expect(result.current).toBe(T0);
    });

    it("re-renders once per second by default", () => {
        const { result } = renderHook(() => useNow());

        advance(999);
        expect(result.current).toBe(T0);

        advance(1);
        expect(result.current).toBe(T0 + 1000);

        advance(3000);
        expect(result.current).toBe(T0 + 4000);
    });

    it("reads the clock fresh on each tick", () => {
        const { result } = renderHook(() => useNow());
        const later = new Date(2027, 0, 1, 0, 0, 0).getTime();

        vi.setSystemTime(later);
        // A system time change alone does not re-render; the next tick picks it up.
        expect(result.current).toBe(T0);

        advance(1000);
        expect(result.current).toBe(later + 1000);
    });

    it("honours a custom interval", () => {
        const { result } = renderHook(() => useNow(250));

        advance(249);
        expect(result.current).toBe(T0);

        advance(1);
        expect(result.current).toBe(T0 + 250);
    });

    it("re-arms the interval when the cadence changes", () => {
        const clearSpy = vi.spyOn(window, "clearInterval");
        const { result, rerender } = renderHook(({ ms }) => useNow(ms), { initialProps: { ms: 1000 } });
        expect(vi.getTimerCount()).toBe(1);

        rerender({ ms: 100 });

        expect(clearSpy).toHaveBeenCalledTimes(1);
        expect(vi.getTimerCount()).toBe(1);
        advance(100);
        expect(result.current).toBe(T0 + 100);
    });

    it("clears the interval on unmount", () => {
        const clearSpy = vi.spyOn(window, "clearInterval");
        const { result, unmount } = renderHook(() => useNow());
        expect(vi.getTimerCount()).toBe(1);

        unmount();

        expect(clearSpy).toHaveBeenCalledTimes(1);
        expect(vi.getTimerCount()).toBe(0);

        const frozen = result.current;
        advance(5000);
        expect(result.current).toBe(frozen);
    });
});
