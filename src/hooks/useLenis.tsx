import Lenis from "lenis";
import { useEffect } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

let instance: Lenis | null = null;

/**
 * Stops any in-flight animation and resyncs Lenis to the real scroll offset. Lenis keeps reset() private, so go
 * through the public stop()/start() pair, which both call it.
 */
function settle(lenis: Lenis): void {
    lenis.stop();
    lenis.start();
}

/**
 * Jumps to the top of the page. Goes through Lenis while it owns the window scroll, so an in-flight smooth-scroll
 * animation cannot write the old offset back on its next frame; falls back to the native call when Lenis is not
 * mounted (reduced motion, or before the hook's effect has run).
 */
export function scrollToTop(): void {
    if (instance) {
        // A wheel flick towards the top leaves targetScroll already at 0, and scrollTo() returns early for an unchanged
        // target, so settle first; the immediate jump then always runs.
        settle(instance);
        instance.scrollTo(0, { immediate: true, force: true });
    } else {
        window.scrollTo(0, 0);
    }
}

export default function useLenis() {
    const reducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        // Native scrolling when the OS asks for reduced motion; scrollToTop() then takes its window.scrollTo branch.
        if (reducedMotion) return;

        const lenis = new Lenis({
            duration: 0.8,
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            touchMultiplier: 2,
        });
        instance = lenis;

        // Back/forward: the browser restores the entry's offset, which an animation still in flight would otherwise
        // overwrite on its next frame.
        const onPopState = () => settle(lenis);
        window.addEventListener("popstate", onPopState);

        let frame = requestAnimationFrame(function raf(time: number) {
            lenis.raf(time);
            frame = requestAnimationFrame(raf);
        });

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("popstate", onPopState);
            if (instance === lenis) instance = null;
            lenis.destroy();
        };
    }, [reducedMotion]);
}
