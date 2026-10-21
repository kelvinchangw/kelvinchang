export type RouteKey = "home" | "projects" | "blog" | "about" | "noir" | "post001";
export type Section = "home" | "projects" | "blog" | "about";
export type LogType = "post" | "noir" | "proj";
export type LogFilter = "all" | LogType;
export type ProjectState = "online" | "dev";

export interface LogEntry {
    date: string;
    type: LogType;
    title: string;
    sub: string;
    meta: string;
    route: RouteKey;
    group: string;
}

export interface Project {
    name: string;
    state: ProjectState;
    since: string;
    title: string;
    quote?: string;
    route?: RouteKey;
}

export interface Post {
    id: string;
    date: string;
    title: string;
    sub: string;
    length: string;
    route: RouteKey;
    body: readonly string[];
}

/** Separator between a title and its subtitle, e.g. "Beginning anew - In search of Heaven". */
export const SEP = " - ";
/** Placeholder shown in date columns for projects that are still in development. */
export const NO_DATE = "--";

export const SITE = {
    host: "kelvinchang.xyz",
    owner: "Kelvin Chang",
    promptUser: "kelvin@noir",
} as const;

export const ROUTE_PATHS: Record<RouteKey, string> = {
    home: "/",
    projects: "/projects",
    blog: "/blog",
    about: "/about",
    noir: "/projects/project-noir",
    post001: "/blog/001",
};

/** The path shown in the title bar and the terminal prompt for each route. */
export const SHELL_PATHS: Record<RouteKey, string> = {
    home: "~/",
    projects: "~/projects",
    blog: "~/blog",
    about: "~/about",
    noir: "~/projects/noir",
    post001: "~/blog/001",
};

/** The nav section each route belongs to (reading pages light up their parent). */
export const ROUTE_SECTIONS: Record<RouteKey, Section> = {
    home: "home",
    projects: "projects",
    blog: "blog",
    about: "about",
    noir: "projects",
    post001: "blog",
};

export const NAV: ReadonlyArray<{ label: string; section: Section }> = [
    { label: "home/", section: "home" },
    { label: "projects/", section: "projects" },
    { label: "blog/", section: "blog" },
    { label: "about/", section: "about" },
];

export const RAIL = {
    tagline: "engineer · designer",
    portraitCaption: "kelvin · pfp.png",
} as const;

export const MOTD: readonly string[] = ["All roads lead to me."];

/** Static rows of the `$ status` block. NOIR state and uptime are rendered separately. */
export const STATUS_STATIC: ReadonlyArray<readonly [string, string]> = [
    ["os", "TrueNAS Scale"],
    ["services", "NAS · Home Assistant"],
    ["storage", "1×1TB NVMe · 3×12TB HDD"],
    ["projects", "1 online · 3 in dev"],
    ["entries", "1"],
];

export const WHOAMI_LINES: readonly string[] = [
    "Hi, my name is Kelvin.",
    "I do programming and other creative works.",
    "Most of my interests revolve around the topics of artificial intelligence, design, metaverse, philosophy, anime, music, and finance.",
];

export const HISTORY_LINES: readonly string[] = [
    "I am a software engineer with self-taught experience and a Computer Science degree with a focus on Graphic Design.",
    "I started coding by building Minecraft plugins and mods as a kid. Now, I work on personal projects that combine engineering and design.",
    "I am especially interested in spatial computing and human-ai interaction. Cybernetics and bionics are cool too.",
    "When I am not coding, I play tennis (competitive) or pickleball (socially). I also perform and produce under the name Voidborne.",
    "I love hotpot, lamb skewers, and DnB. Mmmmmmmmm.",
];

export const CONTACT = {
    email: "kelvinchangw@gmail.com",
    linkedin: "https://www.linkedin.com/in/kelvinchangw/",
    github: "https://github.com/kelvinchangw",
    youtube: "https://www.youtube.com/@kelvin-ai",
} as const;

export const LOG_FILTERS: readonly LogFilter[] = ["all", "post", "proj", "noir"];
export const LOG_GROUP_ORDER: readonly string[] = ["2025", "in development"];

/** The home page log, newest first. */
export const LOG: readonly LogEntry[] = [
    {
        date: "2025-12-15",
        type: "post",
        title: "Beginning anew",
        sub: "In search of Heaven",
        meta: "post · 1 min",
        route: "post001",
        group: "2025",
    },
    {
        date: "2025-05-19",
        type: "noir",
        title: "NOIR",
        sub: "build video placed on indefinite pause. LOL.",
        meta: "update",
        route: "noir",
        group: "2025",
    },
    {
        date: "2025-01-17",
        type: "noir",
        title: "NOIR",
        sub: "build complete · i5-12400 · 32 GB · 36 TB raw · TrueNAS Scale",
        meta: "→ online",
        route: "noir",
        group: "2025",
    },
    {
        date: NO_DATE,
        type: "proj",
        title: "Project A",
        sub: "[REDACTED]",
        meta: "dev",
        route: "projects",
        group: "in development",
    },
    {
        date: NO_DATE,
        type: "proj",
        title: "Project S",
        sub: "\"We deemed this to be the fastest and most optimal way of doing things.\"",
        meta: "dev",
        route: "projects",
        group: "in development",
    },
    {
        date: NO_DATE,
        type: "proj",
        title: "Project W",
        sub: "\"Only white wings may silence its echoes of arrival.\"",
        meta: "dev",
        route: "projects",
        group: "in development",
    },
];

export const PROJECTS: readonly Project[] = [
    {
        name: "NOIR",
        state: "online",
        since: "2025-01-17",
        title: "Home server / NAS",
        quote: "\"From distance eternal come black wings o'er the land. Feathers fall, bringing ruin.\"",
        route: "noir",
    },
    { name: "A", state: "dev", since: NO_DATE, title: "[REDACTED]" },
    {
        name: "S",
        state: "dev",
        since: NO_DATE,
        title: "[REDACTED]",
        quote: "\"We deemed this to be the fastest and most optimal way of doing things.\"",
    },
    {
        name: "W",
        state: "dev",
        since: NO_DATE,
        title: "[REDACTED]",
        quote: "\"Only white wings may silence its echoes of arrival.\"",
    },
];

export const POSTS: readonly Post[] = [
    {
        id: "001",
        date: "2025-12-15",
        title: "Beginning anew",
        sub: "In search of Heaven",
        length: "1 min",
        route: "post001",
        body: ["I am exactly where I should be."],
    },
];

export const NOIR = {
    title: "Project NOIR",
    sub: "Home server / NAS",
    state: "ONLINE",
    buildDate: "2025-01-17",
    updateDate: "2025-05-19",
    partsUrl: "https://pcpartpicker.com/list/zCjRFZ",
    intro: "I started NOIR as a way to store all of my data that I had accumulated over the years. My main PC has a 2TB M.2 SSD and it was filling up ever so closely to the max. I dislike when storages are near or at capacity.",
    specs: [
        "CPU: Intel i5-12400",
        "CPU Cooler: Noctua NH-D15",
        "MOBO: MSI PRO B660M-A",
        "Memory: TEAMGROUP 2 x 16 GB 3600MHz DDR4",
        "Storage: 1 x WD_BLACK 1 TB M.2 SSD, 3 x Seagate 12 TB HDD",
        "Case: Fractal Design Meshify 2",
        "PSU: EVGA 650 W 80+ Gold",
    ],
    running: ["OS: TrueNAS Scale", "Service: NAS storage", "App: Home Assistant"],
    update: "I am putting the video on indefinite pause. LOL.",
} as const;

/** Files the terminal can `cat`. */
export const TERMINAL_FILES: Readonly<Record<string, readonly string[]>> = {
    motd: MOTD,
    whoami: WHOAMI_LINES,
    history: HISTORY_LINES,
    noir: [
        `# ${NOIR.title}${SEP}home server / NAS  [${NOIR.state}]`,
        NOIR.intro,
        "… cd noir for the full write-up",
    ],
    "001": ["# Beginning anew", "## In search of Heaven", "I am exactly where I should be."],
};

/** Directories the terminal can `ls`. */
export const TERMINAL_DIRS: Readonly<Record<string, readonly string[]>> = {
    "~": ["home/  projects/  blog/  about/"],
    projects: [
        "NOIR/   [ONLINE]  home server / NAS",
        "A/      [DEV]     [REDACTED]",
        "S/      [DEV]     [REDACTED]",
        "W/      [DEV]     [REDACTED]",
    ],
    blog: [`001     2025-12-15  Beginning anew${SEP}In search of Heaven`],
    about: ["whoami  history"],
};

/** Arguments accepted by `cd` / `open`, mapped to the route they navigate to. */
export const CD_TARGETS: Readonly<Record<string, RouteKey>> = {
    "": "home",
    "..": "home",
    home: "home",
    projects: "projects",
    blog: "blog",
    about: "about",
    noir: "noir",
    "001": "post001",
    a: "projects",
    s: "projects",
    w: "projects",
};

export const NEOFETCH_STATIC: ReadonlyArray<readonly [string, string]> = [
    ["OS:", "TrueNAS Scale"],
    ["Host:", "Fractal Design Meshify 2"],
    ["CPU:", "Intel i5-12400"],
    ["Memory:", "32 GB DDR4 3600"],
    ["Storage:", "1 TB NVMe + 3 × 12 TB HDD"],
];
