import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function matches(): boolean {
    return typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia(QUERY).matches
        : false;
}

/** True when the OS asks for reduced motion; tracks changes live. */
export function usePrefersReducedMotion(): boolean {
    const [reduced, setReduced] = useState(matches);

    useEffect(() => {
        if (typeof window.matchMedia !== "function") return;
        const list = window.matchMedia(QUERY);
        const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
        list.addEventListener("change", onChange);
        return () => list.removeEventListener("change", onChange);
    }, []);

    return reduced;
}
