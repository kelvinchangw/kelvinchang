import { cleanup } from "@testing-library/react";
import { vi } from "vitest";

/**
 * Freezes the clock at `now` with vitest's fake timers, for component tests that drive user-event.
 *
 * RTL's asyncWrapper drains with setTimeout(0) and only advances *jest* fake timers; under vitest's
 * fake clock that drain never fires and every user-event call hangs. Exposing vitest's clock as `jest`
 * points the drain at it. Call from beforeEach, pair with `uninstallFakeClock` in afterEach and build
 * the user with `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`.
 */
export function installFakeClock(now: Date): void {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    vi.stubGlobal("jest", { advanceTimersByTime: vi.advanceTimersByTime });
}

/** Unmounts before restoring real timers so effect cleanups clear the same fake timers they armed. */
export function uninstallFakeClock(): void {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
}
