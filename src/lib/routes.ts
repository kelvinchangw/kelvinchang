import { ROUTE_PATHS, ROUTE_SECTIONS, SHELL_PATHS, type RouteKey, type Section } from "../data/site";

const ROUTE_KEYS = Object.keys(ROUTE_PATHS) as RouteKey[];

/** Maps a browser pathname to a route key. Unknown paths resolve to `null`. */
export function routeKeyForPathname(pathname: string): RouteKey | null {
    const clean = pathname.replace(/\/+$/, "") || "/";
    return ROUTE_KEYS.find((key) => ROUTE_PATHS[key] === clean) ?? null;
}

export function sectionForRoute(route: RouteKey | null): Section | null {
    return route ? ROUTE_SECTIONS[route] : null;
}

/** The `~/...` path shown for a route; unknown routes show the raw pathname under `~`. */
export function shellPathFor(route: RouteKey | null, pathname = "/"): string {
    if (route) return SHELL_PATHS[route];
    return `~${pathname}`;
}
