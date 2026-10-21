import { describe, expect, it } from "vitest";
import { UPTIME_SINCE_LABEL } from "../lib/time";
import * as site from "./site";
import {
    CD_TARGETS,
    CONTACT,
    HISTORY_LINES,
    LOG,
    LOG_FILTERS,
    LOG_GROUP_ORDER,
    MOTD,
    NAV,
    NEOFETCH_STATIC,
    NO_DATE,
    NOIR,
    POSTS,
    PROJECTS,
    RAIL,
    ROUTE_PATHS,
    ROUTE_SECTIONS,
    SEP,
    SHELL_PATHS,
    SITE,
    STATUS_STATIC,
    TERMINAL_DIRS,
    TERMINAL_FILES,
    WHOAMI_LINES,
    type RouteKey,
    type Section,
} from "./site";

const ROUTE_KEYS = Object.keys(ROUTE_PATHS) as RouteKey[];
const SECTIONS: readonly Section[] = ["home", "projects", "blog", "about"];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const EM_DASH = "—";

const sorted = (values: readonly string[]) => [...values].sort();
const unique = (values: readonly string[]) => new Set(values).size === values.length;

/** Every string nested anywhere inside `value`, tagged with its path so failures are readable. */
function collectStrings(value: unknown, path: string, out: Array<[string, string]> = []): Array<[string, string]> {
    if (typeof value === "string") {
        out.push([path, value]);
    } else if (Array.isArray(value)) {
        value.forEach((item, index) => collectStrings(item, `${path}[${index}]`, out));
    } else if (value && typeof value === "object") {
        for (const [key, item] of Object.entries(value)) collectStrings(item, `${path}.${key}`, out);
    }
    return out;
}

describe("route tables", () => {
    it("ROUTE_PATHS, SHELL_PATHS and ROUTE_SECTIONS share one key set", () => {
        expect(sorted(Object.keys(SHELL_PATHS))).toEqual(sorted(ROUTE_KEYS));
        expect(sorted(Object.keys(ROUTE_SECTIONS))).toEqual(sorted(ROUTE_KEYS));
    });

    it("route paths are unique absolute paths without trailing slashes", () => {
        const paths = Object.values(ROUTE_PATHS);
        expect(unique(paths)).toBe(true);
        for (const path of paths) {
            expect(path.startsWith("/")).toBe(true);
            if (path !== "/") expect(path.endsWith("/")).toBe(false);
        }
    });

    it("shell paths are unique and live under ~", () => {
        const paths = Object.values(SHELL_PATHS);
        expect(unique(paths)).toBe(true);
        expect(SHELL_PATHS.home).toBe("~/");
        for (const [key, path] of Object.entries(SHELL_PATHS)) {
            expect(path.startsWith("~/")).toBe(true);
            if (key !== "home") expect(path.endsWith("/")).toBe(false);
        }
    });

    it("every section is a top-level route that maps to itself", () => {
        for (const section of Object.values(ROUTE_SECTIONS)) {
            expect(SECTIONS).toContain(section);
            expect(ROUTE_SECTIONS[section]).toBe(section);
        }
    });

    it("reading pages are nested under their parent section in both path tables", () => {
        const readingPages = ROUTE_KEYS.filter((key) => ROUTE_SECTIONS[key] !== key);
        expect(sorted(readingPages)).toEqual(["noir", "post001"]);
        for (const key of readingPages) {
            const parent = ROUTE_SECTIONS[key];
            expect(ROUTE_PATHS[key].startsWith(`${ROUTE_PATHS[parent]}/`)).toBe(true);
            expect(SHELL_PATHS[key].startsWith(`${SHELL_PATHS[parent]}/`)).toBe(true);
        }
    });
});

describe("NAV", () => {
    it("lists the four sections in design order", () => {
        expect(NAV.map((item) => item.section)).toEqual(["home", "projects", "blog", "about"]);
    });

    it("labels each section with a trailing slash", () => {
        for (const item of NAV) expect(item.label).toBe(`${item.section}/`);
    });

    it("only points at valid sections", () => {
        for (const item of NAV) {
            expect(SECTIONS).toContain(item.section);
            expect(ROUTE_KEYS).toContain(item.section);
        }
    });
});

describe("LOG", () => {
    it("every entry belongs to a known group, filter and route", () => {
        for (const entry of LOG) {
            expect(LOG_GROUP_ORDER).toContain(entry.group);
            expect(LOG_FILTERS).toContain(entry.type);
            expect(ROUTE_KEYS).toContain(entry.route);
        }
    });

    it("the 2025 group is newest first with ISO dates", () => {
        const dates = LOG.filter((entry) => entry.group === "2025").map((entry) => entry.date);
        expect(dates.length).toBeGreaterThan(0);
        for (const date of dates) {
            expect(date).toMatch(ISO_DATE);
            expect(date.startsWith("2025-")).toBe(true);
        }
        for (let i = 1; i < dates.length; i += 1) expect(dates[i - 1] >= dates[i]).toBe(true);
    });

    it("in-development entries use NO_DATE, and only they do", () => {
        const dev = LOG.filter((entry) => entry.group === "in development");
        expect(dev.length).toBeGreaterThan(0);
        for (const entry of LOG) {
            expect(entry.date === NO_DATE).toBe(entry.group === "in development");
        }
        for (const entry of dev) {
            expect(entry.type).toBe("proj");
            expect(entry.meta).toBe("dev");
            expect(entry.route).toBe("projects");
        }
    });

    it("LOG_FILTERS starts with 'all' and every other filter matches at least one entry", () => {
        expect(LOG_FILTERS[0]).toBe("all");
        expect(unique(LOG_FILTERS)).toBe(true);
        for (const filter of LOG_FILTERS.slice(1)) {
            expect(LOG.some((entry) => entry.type === filter)).toBe(true);
        }
    });

    it("LOG_GROUP_ORDER lists each group once and every group is used", () => {
        expect(unique(LOG_GROUP_ORDER)).toBe(true);
        for (const label of LOG_GROUP_ORDER) {
            expect(LOG.some((entry) => entry.group === label)).toBe(true);
        }
    });

    it("post entries mirror POSTS", () => {
        const postEntries = LOG.filter((entry) => entry.type === "post");
        expect(postEntries).toHaveLength(POSTS.length);
        for (const entry of postEntries) {
            const post = POSTS.find((candidate) => candidate.route === entry.route);
            expect(post).toBeDefined();
            expect(entry.title).toBe(post?.title);
            expect(entry.sub).toBe(post?.sub);
            expect(entry.date).toBe(post?.date);
            expect(entry.meta).toContain(post?.length);
        }
    });

    it("NOIR entries carry the build and update dates", () => {
        const noirDates = LOG.filter((entry) => entry.type === "noir").map((entry) => entry.date);
        expect(noirDates).toContain(NOIR.buildDate);
        expect(noirDates).toContain(NOIR.updateDate);
    });
});

describe("PROJECTS", () => {
    it("has exactly one online project, NOIR, with its build date and a page", () => {
        const online = PROJECTS.filter((project) => project.state === "online");
        expect(online).toHaveLength(1);
        expect(online[0].name).toBe("NOIR");
        expect(online[0].since).toBe(NOIR.buildDate);
        expect(online[0].route).toBe("noir");
    });

    it("dev projects use NO_DATE and are not links", () => {
        const dev = PROJECTS.filter((project) => project.state === "dev");
        expect(dev.length).toBeGreaterThan(0);
        for (const project of dev) {
            expect(project.since).toBe(NO_DATE);
            expect(project.route).toBeUndefined();
        }
    });

    it("every project route exists and names are unique", () => {
        for (const project of PROJECTS) {
            if (project.route !== undefined) expect(ROUTE_KEYS).toContain(project.route);
        }
        expect(unique(PROJECTS.map((project) => project.name))).toBe(true);
    });
});

describe("POSTS", () => {
    it("every post routes to a page whose paths end with its id", () => {
        for (const post of POSTS) {
            expect(ROUTE_KEYS).toContain(post.route);
            expect(ROUTE_PATHS[post.route].endsWith(`/${post.id}`)).toBe(true);
            expect(SHELL_PATHS[post.route].endsWith(`/${post.id}`)).toBe(true);
        }
    });

    it("has ISO dates, newest first, and non-empty bodies", () => {
        for (const post of POSTS) {
            expect(post.date).toMatch(ISO_DATE);
            expect(post.body.length).toBeGreaterThan(0);
            for (const paragraph of post.body) expect(paragraph.trim()).not.toBe("");
        }
        for (let i = 1; i < POSTS.length; i += 1) expect(POSTS[i - 1].date >= POSTS[i].date).toBe(true);
    });
});

describe("STATUS_STATIC", () => {
    it("has the five rail keys in design order", () => {
        expect(STATUS_STATIC.map(([key]) => key)).toEqual(["os", "services", "storage", "projects", "entries"]);
    });

    it("carries the rail copy from the design", () => {
        expect(STATUS_STATIC).toEqual([
            ["os", "TrueNAS Scale"],
            ["services", "NAS · Home Assistant"],
            ["storage", "1×1TB NVMe · 3×12TB HDD"],
            ["projects", "1 online · 3 in dev"],
            ["entries", "1"],
        ]);
    });

    it("project tally agrees with PROJECTS", () => {
        const online = PROJECTS.filter((project) => project.state === "online").length;
        const dev = PROJECTS.filter((project) => project.state === "dev").length;
        const row = STATUS_STATIC.find(([key]) => key === "projects");
        expect(row?.[1]).toBe(`${online} online · ${dev} in dev`);
    });

    it("entry count agrees with POSTS", () => {
        const row = STATUS_STATIC.find(([key]) => key === "entries");
        expect(row?.[1]).toBe(String(POSTS.length));
    });
});

describe("CONTACT", () => {
    it("every link is an https URL", () => {
        const links = Object.entries(CONTACT).filter(([key]) => key !== "email");
        expect(links.length).toBeGreaterThan(0);
        for (const [, value] of links) {
            expect(value.startsWith("https://")).toBe(true);
            expect(new URL(value).protocol).toBe("https:");
        }
    });

    it("email is a plain address, not a URL", () => {
        expect(CONTACT.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        expect(CONTACT.email.startsWith("mailto:")).toBe(false);
    });

    it("points at the expected hosts", () => {
        expect(new URL(CONTACT.linkedin).hostname.endsWith("linkedin.com")).toBe(true);
        expect(new URL(CONTACT.linkedin).pathname.startsWith("/in/")).toBe(true);
        expect(new URL(CONTACT.github).hostname).toBe("github.com");
        expect(new URL(CONTACT.youtube).hostname.endsWith("youtube.com")).toBe(true);
    });
});

describe("terminal tables", () => {
    it("TERMINAL_FILES exposes motd, whoami, history, noir and 001", () => {
        expect(sorted(Object.keys(TERMINAL_FILES))).toEqual(sorted(["motd", "whoami", "history", "noir", "001"]));
    });

    it("TERMINAL_DIRS exposes ~, projects, blog and about", () => {
        expect(sorted(Object.keys(TERMINAL_DIRS))).toEqual(sorted(["~", "projects", "blog", "about"]));
    });

    it("has no music file, directory or cd target", () => {
        expect(Object.keys(TERMINAL_FILES)).not.toContain("music");
        expect(Object.keys(TERMINAL_DIRS)).not.toContain("music");
        expect(Object.keys(CD_TARGETS)).not.toContain("music");
        for (const [path, text] of collectStrings(TERMINAL_DIRS, "TERMINAL_DIRS")) {
            expect(text.includes("music"), `${path} mentions music`).toBe(false);
        }
    });

    it("keys are lowercase so normalized arguments can reach them", () => {
        const keys = [...Object.keys(TERMINAL_FILES), ...Object.keys(TERMINAL_DIRS), ...Object.keys(CD_TARGETS)];
        for (const key of keys) expect(key).toBe(key.toLowerCase());
    });

    it("every file and directory is a non-empty list of non-empty lines", () => {
        for (const lines of [...Object.values(TERMINAL_FILES), ...Object.values(TERMINAL_DIRS)]) {
            expect(lines.length).toBeGreaterThan(0);
            for (const line of lines) expect(line.trim()).not.toBe("");
        }
    });

    it("motd, whoami and history files are the rail and about copy", () => {
        expect(TERMINAL_FILES.motd).toEqual(MOTD);
        expect(TERMINAL_FILES.whoami).toEqual(WHOAMI_LINES);
        expect(TERMINAL_FILES.history).toEqual(HISTORY_LINES);
    });

    it("each post file is the post rendered as markdown", () => {
        for (const post of POSTS) {
            expect(TERMINAL_FILES[post.id]).toEqual([`# ${post.title}`, `## ${post.sub}`, ...post.body]);
        }
    });

    it("the noir file leads with the NOIR title and state and includes the intro", () => {
        const [heading] = TERMINAL_FILES.noir;
        expect(heading.startsWith(`# ${NOIR.title}`)).toBe(true);
        expect(heading).toContain(`[${NOIR.state}]`);
        expect(TERMINAL_FILES.noir).toContain(NOIR.intro);
    });

    it("the ~ listing names every nav section", () => {
        const listing = TERMINAL_DIRS["~"].join(" ");
        for (const item of NAV) expect(listing).toContain(item.label);
    });

    it("the projects listing has one line per project with its name and state", () => {
        const lines = TERMINAL_DIRS.projects;
        expect(lines).toHaveLength(PROJECTS.length);
        PROJECTS.forEach((project, index) => {
            expect(lines[index].startsWith(`${project.name}/`)).toBe(true);
            expect(lines[index]).toContain(`[${project.state.toUpperCase()}]`);
        });
    });

    it("the blog listing has one line per post", () => {
        const lines = TERMINAL_DIRS.blog;
        expect(lines).toHaveLength(POSTS.length);
        POSTS.forEach((post, index) => {
            expect(lines[index].startsWith(post.id)).toBe(true);
            expect(lines[index]).toContain(post.date);
            expect(lines[index]).toContain(`${post.title}${SEP}${post.sub}`);
        });
    });

    it("the about listing only names files the terminal can cat", () => {
        const names = TERMINAL_DIRS.about.join(" ").split(/\s+/).filter(Boolean);
        expect(names).toEqual(["whoami", "history"]);
        for (const name of names) expect(Object.keys(TERMINAL_FILES)).toContain(name);
    });
});

describe("CD_TARGETS", () => {
    it("every target is a known route", () => {
        for (const target of Object.values(CD_TARGETS)) expect(ROUTE_KEYS).toContain(target);
    });

    it("every route is reachable with cd", () => {
        const targets = Object.values(CD_TARGETS);
        for (const key of ROUTE_KEYS) expect(targets).toContain(key);
    });

    it("accepts the arguments listed by help", () => {
        expect(CD_TARGETS[""]).toBe("home");
        expect(CD_TARGETS[".."]).toBe("home");
        expect(CD_TARGETS.home).toBe("home");
        expect(CD_TARGETS.projects).toBe("projects");
        expect(CD_TARGETS.blog).toBe("blog");
        expect(CD_TARGETS.about).toBe("about");
        expect(CD_TARGETS.noir).toBe("noir");
        expect(CD_TARGETS["001"]).toBe("post001");
    });

    it("maps every project name to its page or the projects table", () => {
        for (const project of PROJECTS) {
            expect(CD_TARGETS[project.name.toLowerCase()]).toBe(project.route ?? "projects");
        }
    });

    it("maps every post id to its page", () => {
        for (const post of POSTS) expect(CD_TARGETS[post.id]).toBe(post.route);
    });
});

describe("copy", () => {
    it("SEP and NO_DATE avoid em dashes", () => {
        expect(SEP).toBe(" - ");
        expect(NO_DATE).toBe("--");
    });

    it("no exported string contains an em dash", () => {
        const strings = collectStrings(site, "site");
        // Guard against the walker silently seeing nothing.
        expect(strings.length).toBeGreaterThan(50);
        expect(strings.map(([path]) => path)).toContain("site.NOIR.intro");
        expect(strings.map(([path]) => path)).toContain("site.LOG[0].title");

        const offenders = strings.filter(([, text]) => text.includes(EM_DASH)).map(([path]) => path);
        expect(offenders).toEqual([]);
    });

    it("rail copy matches the design HTML", () => {
        expect(RAIL.tagline).toBe("engineer · designer");
        expect(RAIL.portraitCaption).toBe("kelvin · pfp.png");
        expect(MOTD).toEqual(["All roads lead to me."]);
    });

    it("site identity", () => {
        expect(SITE.host).toBe("kelvinchang.xyz");
        expect(SITE.promptUser).toBe("kelvin@noir");
        expect(SITE.owner).toBe("Kelvin Chang");
    });

    it("about copy has three whoami lines and five history paragraphs", () => {
        expect(WHOAMI_LINES).toHaveLength(3);
        expect(WHOAMI_LINES[0]).toBe("Hi, my name is Kelvin.");
        expect(HISTORY_LINES).toHaveLength(5);
        for (const line of [...WHOAMI_LINES, ...HISTORY_LINES]) expect(line.trim()).not.toBe("");
    });

    it("NOIR dates line up with the uptime origin", () => {
        expect(NOIR.buildDate).toBe(UPTIME_SINCE_LABEL);
        expect(NOIR.buildDate).toMatch(ISO_DATE);
        expect(NOIR.updateDate).toMatch(ISO_DATE);
        expect(NOIR.updateDate > NOIR.buildDate).toBe(true);
        expect(NOIR.state).toBe("ONLINE");
        expect(NOIR.partsUrl.startsWith("https://")).toBe(true);
    });

    it("NEOFETCH_STATIC lists the design's five rows in order", () => {
        expect(NEOFETCH_STATIC).toEqual([
            ["OS:", "TrueNAS Scale"],
            ["Host:", "Fractal Design Meshify 2"],
            ["CPU:", "Intel i5-12400"],
            ["Memory:", "32 GB DDR4 3600"],
            ["Storage:", "1 TB NVMe + 3 × 12 TB HDD"],
        ]);
    });
});
