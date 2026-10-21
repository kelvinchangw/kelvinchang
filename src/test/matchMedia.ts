import { act } from "@testing-library/react";
import { vi } from "vitest";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type ChangeListener = (event: MediaQueryListEvent) => void;

/**
 * Stubs `window.matchMedia` (jsdom has none) with one controllable media query list.
 * Undone by `vi.unstubAllGlobals()`.
 */
export function stubMatchMedia(initial: boolean) {
    const listeners = new Set<ChangeListener>();
    const list = {
        matches: initial,
        media: REDUCED_MOTION_QUERY,
        onchange: null,
        addEventListener: vi.fn((type: string, listener: ChangeListener) => {
            if (type === "change") listeners.add(listener);
        }),
        removeEventListener: vi.fn((type: string, listener: ChangeListener) => {
            if (type === "change") listeners.delete(listener);
        }),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(() => true),
    };
    const matchMedia = vi.fn<(query: string) => typeof list>(() => list);
    vi.stubGlobal("matchMedia", matchMedia);

    /** Flips the OS preference and dispatches the "change" event to every subscriber. */
    const fire = (matches: boolean) => {
        list.matches = matches;
        const event = { matches, media: REDUCED_MOTION_QUERY } as MediaQueryListEvent;
        act(() => {
            listeners.forEach((listener) => listener(event));
        });
    };

    return { matchMedia, list, listeners, fire };
}
