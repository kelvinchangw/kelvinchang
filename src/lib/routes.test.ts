import { describe, expect, it } from "vitest";
import { ROUTE_PATHS, ROUTE_SECTIONS, SHELL_PATHS, type RouteKey } from "../data/site";
import { routeKeyForPathname, sectionForRoute, shellPathFor } from "./routes";

const ROUTE_KEYS = Object.keys(ROUTE_PATHS) as RouteKey[];

/** The six URLs from the design handoff's route table. */
const KNOWN_PATHS: Array<[string, RouteKey]> = [
    ["/", "home"],
    ["/projects", "projects"],
    ["/blog", "blog"],
    ["/about", "about"],
    ["/projects/project-noir", "noir"],
    ["/blog/001", "post001"],
];

describe("routeKeyForPathname", () => {
    it.each(KNOWN_PATHS)("maps %s to %s", (pathname, key) => {
        expect(routeKeyForPathname(pathname)).toBe(key);
    });

    it.each(ROUTE_KEYS)("round-trips every ROUTE_PATHS entry (%s)", (key) => {
        expect(routeKeyForPathname(ROUTE_PATHS[key])).toBe(key);
    });

    it("ignores trailing slashes", () => {
        expect(routeKeyForPathname("/projects/")).toBe("projects");
        expect(routeKeyForPathname("/blog/001/")).toBe("post001");
        expect(routeKeyForPathname("/projects/project-noir/")).toBe("noir");
        expect(routeKeyForPathname("/about///")).toBe("about");
    });

    it("keeps the root as home", () => {
        expect(routeKeyForPathname("/")).toBe("home");
        expect(routeKeyForPathname("//")).toBe("home");
        expect(routeKeyForPathname("")).toBe("home");
    });

    it("resolves unknown paths to null", () => {
        expect(routeKeyForPathname("/nope")).toBeNull();
        expect(routeKeyForPathname("/projects/nope")).toBeNull();
        expect(routeKeyForPathname("/blog/002")).toBeNull();
        expect(routeKeyForPathname("/projects/project-noir/extra")).toBeNull();
    });

    it("does not match partial segments or prefixes", () => {
        expect(routeKeyForPathname("/proj")).toBeNull();
        expect(routeKeyForPathname("/projectsx")).toBeNull();
        expect(routeKeyForPathname("/blog/00")).toBeNull();
    });

    it("does not treat /home as the home page", () => {
        expect(routeKeyForPathname("/home")).toBeNull();
    });

    // The routes in App.tsx are declared caseSensitive so the router agrees with this lookup.
    it("is case-sensitive, like the router", () => {
        expect(routeKeyForPathname("/Projects")).toBeNull();
        expect(routeKeyForPathname("/BLOG/001")).toBeNull();
        expect(routeKeyForPathname("/About/")).toBeNull();
    });
});

describe("sectionForRoute", () => {
    it("returns null for an unknown route", () => {
        expect(sectionForRoute(null)).toBeNull();
    });

    it("maps top-level routes to themselves", () => {
        expect(sectionForRoute("home")).toBe("home");
        expect(sectionForRoute("projects")).toBe("projects");
        expect(sectionForRoute("blog")).toBe("blog");
        expect(sectionForRoute("about")).toBe("about");
    });

    it("maps reading pages to their parent section", () => {
        expect(sectionForRoute("noir")).toBe("projects");
        expect(sectionForRoute("post001")).toBe("blog");
    });

    it.each(ROUTE_KEYS)("agrees with ROUTE_SECTIONS for %s", (key) => {
        expect(sectionForRoute(key)).toBe(ROUTE_SECTIONS[key]);
    });
});

describe("shellPathFor", () => {
    it("shows the ~ path of a known route", () => {
        expect(shellPathFor("home")).toBe("~/");
        expect(shellPathFor("projects")).toBe("~/projects");
        expect(shellPathFor("blog")).toBe("~/blog");
        expect(shellPathFor("about")).toBe("~/about");
        expect(shellPathFor("noir")).toBe("~/projects/noir");
        expect(shellPathFor("post001")).toBe("~/blog/001");
    });

    it.each(ROUTE_KEYS)("agrees with SHELL_PATHS for %s", (key) => {
        expect(shellPathFor(key)).toBe(SHELL_PATHS[key]);
    });

    it("ignores the pathname when the route is known", () => {
        expect(shellPathFor("blog", "/anything/else")).toBe("~/blog");
        expect(shellPathFor("home", "/nope")).toBe("~/");
    });

    it("shows the raw pathname under ~ for an unknown route", () => {
        expect(shellPathFor(null, "/nope")).toBe("~/nope");
        expect(shellPathFor(null, "/deep/er/path")).toBe("~/deep/er/path");
        expect(shellPathFor(null, "/blog/002/")).toBe("~/blog/002/");
    });

    it("defaults the pathname to the root", () => {
        expect(shellPathFor(null)).toBe("~/");
    });

    it.each(KNOWN_PATHS)("resolves %s end to end through routeKeyForPathname", (pathname, key) => {
        expect(shellPathFor(routeKeyForPathname(pathname), pathname)).toBe(SHELL_PATHS[key]);
    });
});
