import { describe, expect, it } from "vitest";
import {
    CD_TARGETS,
    HISTORY_LINES,
    MOTD,
    NOIR,
    SHELL_PATHS,
    TERMINAL_DIRS,
    TERMINAL_FILES,
    WHOAMI_LINES,
    type RouteKey,
} from "../data/site";
import {
    appendScrollback,
    COMMANDS,
    completeCommand,
    contactLines,
    HELP_LINES,
    MAX_SCROLLBACK,
    neofetchLines,
    normalizeArg,
    padKey,
    recallHistory,
    runCommand,
    statusLines,
    WELCOME_LINE,
    type TermContext,
    type TermLine,
    type TermResult,
} from "./terminal";
import { UPTIME_SINCE_LABEL, UPTIME_SINCE_MS } from "./time";

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** 3d 03:04:05 after NOIR's build day, offset in ms so the uptime reads the same in every time zone. */
const UPTIME_NOW = new Date(UPTIME_SINCE_MS + 3 * DAY + 3 * HOUR + 4 * MINUTE + 5 * SECOND);
const UPTIME_TEXT = "3d 03:04:05";

/** Built from local components so the local-time formatter reads the same digits back everywhere. */
const LOCAL_NOW = new Date(2025, 5, 7, 8, 9, 10);

const EM_DASH = "—";
const PROMPT = "kelvin@noir";

function run(raw: string, overrides: Partial<TermContext> = {}): TermResult {
    const result = runCommand(raw, { path: "~/", now: UPTIME_NOW, ...overrides });
    if (!result) throw new Error(`runCommand returned null for ${JSON.stringify(raw)}`);
    return result;
}

/** The output lines of a command, without the echoed prompt line. */
function body(raw: string, overrides: Partial<TermContext> = {}): TermLine[] {
    return run(raw, overrides).lines.slice(1);
}

function texts(lines: readonly TermLine[]): string[] {
    return lines.map((line) => line.text);
}

function tones(lines: readonly TermLine[]): string[] {
    return lines.map((line) => line.tone);
}

function textLines(strings: readonly string[]): TermLine[] {
    return strings.map((text) => ({ text, tone: "text" }));
}

function dimLine(text: string): TermLine {
    return { text, tone: "dim" };
}

describe("terminal constants", () => {
    it("lists the fifteen commands in the design's order", () => {
        expect(COMMANDS).toEqual([
            "help",
            "ls",
            "cd",
            "cat",
            "open",
            "whoami",
            "status",
            "uptime",
            "neofetch",
            "contact",
            "pwd",
            "date",
            "echo",
            "clear",
            "exit",
        ]);
    });

    it("keeps 300 lines of scrollback", () => {
        expect(MAX_SCROLLBACK).toBe(300);
    });

    it("WELCOME_LINE is the dim shell banner, joined with a colon", () => {
        expect(WELCOME_LINE).toEqual({
            text: "kelvinchang.xyz shell: type help to see what this thing can do.",
            tone: "dim",
        });
    });

    it("HELP_LINES matches the design minus the music entries", () => {
        expect(HELP_LINES).toEqual([
            "help              this list",
            "ls [dir]          list ~ · projects · blog · about",
            "cd <dir>          go to home · projects · blog · about · noir · 001",
            "cat <file>        read motd · whoami · history · noir · 001",
            "status · uptime   NOIR system status",
            "neofetch          system summary",
            "contact           where to reach me",
            "pwd · date · echo · clear · exit",
        ]);
    });

    it("HELP_LINES never mentions music", () => {
        for (const line of HELP_LINES) expect(line).not.toMatch(/music/i);
    });

    it("HELP_LINES aligns descriptions at column 18 like the design", () => {
        for (const line of HELP_LINES.slice(0, 7)) {
            expect(line.charAt(17)).toBe(" ");
            expect(line.charAt(18)).not.toBe(" ");
        }
    });
});

describe("normalizeArg", () => {
    it("strips a leading ~/", () => {
        expect(normalizeArg("~/projects")).toBe("projects");
    });

    it("strips a bare ~ and a bare ~/ down to nothing", () => {
        expect(normalizeArg("~")).toBe("");
        expect(normalizeArg("~/")).toBe("");
    });

    it("strips a trailing slash", () => {
        expect(normalizeArg("projects/")).toBe("projects");
    });

    it("strips a .md suffix", () => {
        expect(normalizeArg("noir.md")).toBe("noir");
        expect(normalizeArg("001.md")).toBe("001");
    });

    it("lowercases", () => {
        expect(normalizeArg("Projects")).toBe("projects");
        expect(normalizeArg("NOIR")).toBe("noir");
    });

    it("applies every rule together", () => {
        expect(normalizeArg("~/NOIR.md/")).toBe("noir");
        expect(normalizeArg("~/Blog/")).toBe("blog");
    });

    it("leaves .. and the empty string alone", () => {
        expect(normalizeArg("..")).toBe("..");
        expect(normalizeArg("")).toBe("");
    });

    it("only strips .md at the very end", () => {
        expect(normalizeArg("motd.md.bak")).toBe("motd.md.bak");
    });
});

describe("padKey", () => {
    it("pads the key to ten columns by default", () => {
        expect(padKey("NOIR", "ONLINE")).toBe("NOIR      ONLINE");
        expect(padKey("services", "x")).toBe("services  x");
    });

    it("honours a custom width", () => {
        expect(padKey("a", "b", 3)).toBe("a  b");
    });

    it("does not truncate a key wider than the column", () => {
        expect(padKey("abcdefghijkl", "v")).toBe("abcdefghijklv");
    });
});

describe("completeCommand", () => {
    it("completes a unique prefix and appends a space", () => {
        expect(completeCommand("he")).toBe("help ");
        expect(completeCommand("ne")).toBe("neofetch ");
        expect(completeCommand("wh")).toBe("whoami ");
    });

    it("picks the first match in COMMANDS order for an ambiguous prefix", () => {
        expect(completeCommand("c")).toBe("cd ");
        expect(completeCommand("ca")).toBe("cat ");
        expect(completeCommand("cl")).toBe("clear ");
        expect(completeCommand("co")).toBe("contact ");
        expect(completeCommand("e")).toBe("echo ");
        expect(completeCommand("ex")).toBe("exit ");
    });

    it("matches case-insensitively and returns the lowercase command", () => {
        expect(completeCommand("HE")).toBe("help ");
        expect(completeCommand("Cl")).toBe("clear ");
    });

    it("completes a full command name to itself plus a space", () => {
        expect(completeCommand("exit")).toBe("exit ");
    });

    it("returns null once the input contains a space", () => {
        expect(completeCommand("cd ")).toBeNull();
        expect(completeCommand("cd pro")).toBeNull();
    });

    it("returns null for empty input", () => {
        expect(completeCommand("")).toBeNull();
    });

    it("returns null when nothing matches", () => {
        expect(completeCommand("z")).toBeNull();
        expect(completeCommand("helpme")).toBeNull();
    });
});

describe("statusLines", () => {
    it("pads every key to a ten-column key column", () => {
        const lines = statusLines(UPTIME_NOW.getTime());
        expect(lines.map((line) => line.slice(0, 10).trimEnd())).toEqual([
            "NOIR",
            "uptime",
            "os",
            "services",
            "storage",
            "projects",
            "entries",
        ]);
        expect(lines.map((line) => line.slice(10))).toEqual([
            "ONLINE",
            UPTIME_TEXT,
            "TrueNAS Scale",
            "NAS storage · Home Assistant",
            "1×1TB NVMe · 3×12TB HDD (36 TB raw)",
            "1 online · 3 in dev",
            "1",
        ]);
    });

    it("never reports a negative uptime", () => {
        expect(statusLines(UPTIME_SINCE_MS - DAY)[1]).toBe("uptime    0d 00:00:00");
    });
});

describe("neofetchLines", () => {
    it("opens with the bright user name underlined by dim dashes of the same length", () => {
        const [name, rule] = neofetchLines(UPTIME_NOW.getTime());
        expect(name).toEqual({ text: PROMPT, tone: "bright" });
        expect(rule).toEqual({ text: "-----------", tone: "dim" });
        expect(rule.text).toHaveLength(name.text.length);
    });

    it("lists the rows in the design's order", () => {
        const rows = neofetchLines(UPTIME_NOW.getTime()).slice(2);
        expect(texts(rows)).toEqual([
            "OS:       TrueNAS Scale",
            "Host:     Fractal Design Meshify 2",
            "CPU:      Intel i5-12400",
            "Memory:   32 GB DDR4 3600",
            "Storage:  1 TB NVMe + 3 × 12 TB HDD",
            `Uptime:   ${UPTIME_TEXT}`,
            "Shell:    kelvinchang.xyz",
            "Theme:    violet phosphor",
        ]);
        expect(tones(rows)).toEqual(Array<string>(8).fill("text"));
    });
});

describe("contactLines", () => {
    it("prints the email and the profile URLs without scheme, www or trailing slash", () => {
        expect(contactLines()).toEqual([
            "kelvinchangw@gmail.com",
            "linkedin.com/in/kelvinchangw",
            "github.com/kelvinchangw",
            "youtube.com/@kelvin-ai",
        ]);
    });
});

describe("runCommand", () => {
    describe("input handling", () => {
        it.each(["", "   ", "\t", " \n "])("returns null for blank input %j", (raw) => {
            expect(runCommand(raw, { path: "~/", now: UPTIME_NOW })).toBeNull();
        });

        it("echoes the prompt, path and command as a dim first line", () => {
            expect(run("help").lines[0]).toEqual({ text: `${PROMPT}:~/$ help`, tone: "dim" });
        });

        it("uses the context path in the prompt", () => {
            expect(run("pwd", { path: "~/projects/noir" }).lines[0].text).toBe(`${PROMPT}:~/projects/noir$ pwd`);
        });

        it("echoes the trimmed command exactly as typed", () => {
            expect(run("  LS   Projects  ").lines[0].text).toBe(`${PROMPT}:~/$ LS   Projects`);
        });

        it("matches command names case-insensitively", () => {
            expect(body("HELP")).toEqual(body("help"));
            expect(body("Ls")).toEqual(body("ls"));
        });

        it("uses only the first argument", () => {
            const result = run("cd projects blog about");
            expect(result.navigate).toBe("projects");
            expect(texts(result.lines.slice(1))).toEqual(["~/projects"]);
        });

        it("splits arguments on any whitespace", () => {
            expect(texts(body("cd\tnoir"))).toEqual(["~/projects/noir"]);
        });

        it("never sets navigate, clear or exit on an ordinary command", () => {
            const result = run("help");
            expect(result.navigate).toBeUndefined();
            expect(result.clear).toBeUndefined();
            expect(result.exit).toBeUndefined();
        });
    });

    describe("help", () => {
        it("prints HELP_LINES in the text tone after the echo", () => {
            expect(body("help")).toEqual(textLines(HELP_LINES));
        });

        it("ignores arguments", () => {
            expect(body("help me")).toEqual(textLines(HELP_LINES));
        });
    });

    describe("ls", () => {
        const ROOT = ["home/  projects/  blog/  about/"];
        const PROJECTS = [
            "NOIR/   [ONLINE]  home server / NAS",
            "A/      [DEV]     [REDACTED]",
            "S/      [DEV]     [REDACTED]",
            "W/      [DEV]     [REDACTED]",
        ];

        it("lists the root with no argument", () => {
            expect(body("ls")).toEqual(textLines(ROOT));
        });

        it.each(["ls ~", "ls ~/", "ls home", "ls HOME", "ls ~/home/"])("%s lists the root", (raw) => {
            expect(texts(body(raw))).toEqual(ROOT);
        });

        it("the root listing has no music directory", () => {
            expect(texts(body("ls")).join("\n")).not.toMatch(/music/);
        });

        it("lists projects with their state", () => {
            expect(texts(body("ls projects"))).toEqual(PROJECTS);
        });

        it("normalizes the directory argument", () => {
            expect(texts(body("ls ~/Projects/"))).toEqual(PROJECTS);
        });

        it("lists the blog with the hyphen separator", () => {
            expect(texts(body("ls blog"))).toEqual(["001     2025-12-15  Beginning anew - In search of Heaven"]);
        });

        it("lists about's files without music", () => {
            expect(texts(body("ls about"))).toEqual(["whoami  history"]);
        });

        it("prints listings in the text tone", () => {
            expect(tones(body("ls projects"))).toEqual(["text", "text", "text", "text"]);
        });

        it("reports a missing directory on a dim line", () => {
            expect(body("ls nope")).toEqual([dimLine("ls: cannot access nope: no such directory")]);
        });

        it("reports the normalized argument in the error", () => {
            expect(body("ls ~/Nope/")).toEqual([dimLine("ls: cannot access nope: no such directory")]);
        });

        it.each(["ls music", "ls ~/music", "ls music/"])("%s is an error now that the music section is gone", (raw) => {
            expect(body(raw)).toEqual([dimLine("ls: cannot access music: no such directory")]);
        });

        it.each(["ls constructor", "ls __proto__", "ls ~/constructor/"])(
            "%s is a missing directory, not an inherited object key",
            (raw) => {
                const arg = normalizeArg(raw.split(/\s+/)[1]);
                expect(body(raw)).toEqual([dimLine(`ls: cannot access ${arg}: no such directory`)]);
            },
        );
    });

    describe("cd and open", () => {
        const CD_CASES: ReadonlyArray<{ arg: string; route: RouteKey; path: string }> = [
            { arg: "", route: "home", path: "~/" },
            { arg: "..", route: "home", path: "~/" },
            { arg: "home", route: "home", path: "~/" },
            { arg: "projects", route: "projects", path: "~/projects" },
            { arg: "blog", route: "blog", path: "~/blog" },
            { arg: "about", route: "about", path: "~/about" },
            { arg: "noir", route: "noir", path: "~/projects/noir" },
            { arg: "001", route: "post001", path: "~/blog/001" },
            { arg: "a", route: "projects", path: "~/projects" },
            { arg: "s", route: "projects", path: "~/projects" },
            { arg: "w", route: "projects", path: "~/projects" },
        ];

        it("the case table covers every CD_TARGETS key", () => {
            expect(CD_CASES.map((c) => c.arg).sort()).toEqual(Object.keys(CD_TARGETS).sort());
        });

        describe.each(["cd", "open"] as const)("%s", (verb) => {
            it.each(CD_CASES)(`${verb} "$arg" navigates to $route and prints $path`, ({ arg, route, path }) => {
                const result = run(`${verb} ${arg}`);
                expect(result.navigate).toBe(route);
                expect(result.lines.slice(1)).toEqual([dimLine(path)]);
                expect(result.clear).toBeUndefined();
                expect(result.exit).toBeUndefined();
            });

            it(`${verb} prints the shell path of every CD_TARGETS route`, () => {
                for (const [arg, route] of Object.entries(CD_TARGETS)) {
                    const result = run(`${verb} ${arg}`);
                    expect(result.navigate).toBe(route);
                    expect(texts(result.lines.slice(1))).toEqual([SHELL_PATHS[route]]);
                }
            });

            it(`${verb} rejects an unknown target on a dim line without navigating`, () => {
                const result = run(`${verb} nowhere`);
                expect(result.navigate).toBeUndefined();
                expect(result.lines.slice(1)).toEqual([dimLine(`${verb}: no such file or directory: nowhere`)]);
            });

            it(`${verb} music is an error now that the music section is gone`, () => {
                const result = run(`${verb} music`);
                expect(result.navigate).toBeUndefined();
                expect(result.lines.slice(1)).toEqual([dimLine(`${verb}: no such file or directory: music`)]);
            });
        });

        it("normalizes the target", () => {
            expect(run("cd ~").navigate).toBe("home");
            expect(run("cd ~/projects/").navigate).toBe("projects");
            expect(run("open A").navigate).toBe("projects");
            expect(run("cd 001.md").navigate).toBe("post001");
            expect(run("open ~/NOIR").navigate).toBe("noir");
        });

        it("reports the lowercased verb and the normalized argument in the error", () => {
            expect(body("CD ~/Nowhere/")).toEqual([dimLine("cd: no such file or directory: nowhere")]);
        });

        it("does not accept nested paths", () => {
            expect(run("cd projects/noir").navigate).toBeUndefined();
            expect(texts(body("cd projects/noir"))).toEqual(["cd: no such file or directory: projects/noir"]);
        });

        it.each([
            ["cd constructor", "cd: no such file or directory: constructor"],
            ["open __proto__", "open: no such file or directory: __proto__"],
            ["cd ~/constructor/", "cd: no such file or directory: constructor"],
        ])("%s is an unknown target, not an inherited object key", (raw, error) => {
            const result = run(raw);
            expect(result.navigate).toBeUndefined();
            expect(result.lines.slice(1)).toEqual([dimLine(error)]);
        });
    });

    describe("cat", () => {
        it("cat motd prints the message of the day", () => {
            expect(body("cat motd")).toEqual([{ text: "All roads lead to me.", tone: "text" }]);
            expect(texts(body("cat motd"))).toEqual([...MOTD]);
        });

        it("cat whoami prints the three bio lines", () => {
            const lines = texts(body("cat whoami"));
            expect(lines).toEqual([...WHOAMI_LINES]);
            expect(lines).toHaveLength(3);
            expect(lines[0]).toBe("Hi, my name is Kelvin.");
        });

        it("cat history prints the five history lines", () => {
            const lines = texts(body("cat history"));
            expect(lines).toEqual([...HISTORY_LINES]);
            expect(lines).toHaveLength(5);
            expect(lines[4]).toBe("I love hotpot, lamb skewers, and DnB. Mmmmmmmmm.");
        });

        it("cat noir prints the hyphenated heading, the intro and a pointer to cd noir", () => {
            expect(texts(body("cat noir"))).toEqual([
                "# Project NOIR - home server / NAS  [ONLINE]",
                NOIR.intro,
                "… cd noir for the full write-up",
            ]);
        });

        it("cat 001 prints the post", () => {
            expect(texts(body("cat 001"))).toEqual([
                "# Beginning anew",
                "## In search of Heaven",
                "I am exactly where I should be.",
            ]);
        });

        it("prints files in the text tone", () => {
            expect(tones(body("cat history"))).toEqual(Array<string>(5).fill("text"));
        });

        it.each(["cat MOTD", "cat motd.md", "cat ~/motd", "cat ~/MOTD.md/"])("%s resolves to motd", (raw) => {
            expect(texts(body(raw))).toEqual([...MOTD]);
        });

        it("reports a missing file on a dim line", () => {
            expect(body("cat nope")).toEqual([dimLine("cat: nope: no such file")]);
        });

        it("reports an empty name when no file is given", () => {
            expect(body("cat")).toEqual([dimLine("cat: : no such file")]);
        });

        it("cat music is an error now that the music section is gone", () => {
            expect(body("cat music")).toEqual([dimLine("cat: music: no such file")]);
        });

        it("does not accept nested paths", () => {
            expect(body("cat about/whoami")).toEqual([dimLine("cat: about/whoami: no such file")]);
        });

        it.each(["cat constructor", "cat __proto__", "cat constructor.md"])(
            "%s is a missing file, not an inherited object key",
            (raw) => {
                const arg = normalizeArg(raw.split(/\s+/)[1]);
                expect(body(raw)).toEqual([dimLine(`cat: ${arg}: no such file`)]);
            },
        );
    });

    describe("whoami", () => {
        it("prints the one-line identity joined with middle dots", () => {
            expect(body("whoami")).toEqual([{ text: "kelvin chang · engineer · designer", tone: "text" }]);
        });
    });

    describe("status", () => {
        const EXPECTED = [
            "NOIR      ONLINE",
            `uptime    ${UPTIME_TEXT}`,
            "os        TrueNAS Scale",
            "services  NAS storage · Home Assistant",
            "storage   1×1TB NVMe · 3×12TB HDD (36 TB raw)",
            "projects  1 online · 3 in dev",
            "entries   1",
        ];

        it("prints the seven status rows in the text tone", () => {
            expect(body("status")).toEqual(textLines(EXPECTED));
        });

        it("matches statusLines for the same clock", () => {
            expect(texts(body("status"))).toEqual(statusLines(UPTIME_NOW.getTime()));
        });

        it("reads the uptime from the context clock", () => {
            const now = new Date(UPTIME_NOW.getTime() + 10 * SECOND);
            expect(texts(body("status", { now }))[1]).toBe("uptime    3d 03:04:15");
        });
    });

    describe("uptime", () => {
        it("prints the elapsed time since the build day", () => {
            expect(body("uptime")).toEqual([{ text: "up 3d 03:04:05 since 2025-01-17", tone: "text" }]);
        });

        it("names the build day from time.ts", () => {
            expect(texts(body("uptime"))).toEqual([`up ${UPTIME_TEXT} since ${UPTIME_SINCE_LABEL}`]);
        });

        it("rolls days, hours, minutes and seconds", () => {
            const now = new Date(UPTIME_SINCE_MS + 400 * DAY + 23 * HOUR + 59 * MINUTE + 59 * SECOND);
            expect(texts(body("uptime", { now }))).toEqual(["up 400d 23:59:59 since 2025-01-17"]);
        });

        it("clamps to zero before the build day", () => {
            const now = new Date(UPTIME_SINCE_MS - HOUR);
            expect(texts(body("uptime", { now }))).toEqual(["up 0d 00:00:00 since 2025-01-17"]);
        });
    });

    describe("neofetch", () => {
        it("opens with the bright user name underlined by dim dashes of equal length", () => {
            const [name, rule] = body("neofetch");
            expect(name).toEqual({ text: PROMPT, tone: "bright" });
            expect(rule.tone).toBe("dim");
            expect(rule.text).toMatch(/^-+$/);
            expect(rule.text).toHaveLength(name.text.length);
        });

        it("prints the rows in the design's order after the header", () => {
            expect(texts(body("neofetch")).slice(2).map((line) => line.slice(0, 10).trimEnd())).toEqual([
                "OS:",
                "Host:",
                "CPU:",
                "Memory:",
                "Storage:",
                "Uptime:",
                "Shell:",
                "Theme:",
            ]);
        });

        it("matches neofetchLines for the same clock", () => {
            expect(body("neofetch")).toEqual(neofetchLines(UPTIME_NOW.getTime()));
            expect(body("neofetch")).toHaveLength(10);
        });
    });

    describe("contact", () => {
        it("prints the four contact lines in the text tone", () => {
            expect(body("contact")).toEqual(
                textLines([
                    "kelvinchangw@gmail.com",
                    "linkedin.com/in/kelvinchangw",
                    "github.com/kelvinchangw",
                    "youtube.com/@kelvin-ai",
                ]),
            );
        });
    });

    describe("pwd", () => {
        it.each(["~/", "~/projects", "~/blog/001"])("prints the context path %s", (path) => {
            expect(body("pwd", { path })).toEqual([{ text: path, tone: "text" }]);
        });
    });

    describe("date", () => {
        it("prints the context clock as YYYY-MM-DD HH:MM:SS in local time", () => {
            expect(body("date", { now: LOCAL_NOW })).toEqual([{ text: "2025-06-07 08:09:10", tone: "text" }]);
        });

        it("zero-pads every field", () => {
            expect(texts(body("date", { now: new Date(2025, 0, 1, 0, 0, 0) }))).toEqual(["2025-01-01 00:00:00"]);
        });

        it("formats the last second of the year", () => {
            expect(texts(body("date", { now: new Date(2025, 11, 31, 23, 59, 59) }))).toEqual(["2025-12-31 23:59:59"]);
        });
    });

    describe("echo", () => {
        it("prints its arguments", () => {
            expect(body("echo hello world")).toEqual([{ text: "hello world", tone: "text" }]);
        });

        it("joins the arguments with single spaces", () => {
            expect(texts(body("echo   a    b\tc  "))).toEqual(["a b c"]);
        });

        it("prints an empty line with no arguments", () => {
            expect(body("echo")).toEqual([{ text: "", tone: "text" }]);
        });

        it("keeps the argument case", () => {
            expect(texts(body("echo Hello World"))).toEqual(["Hello World"]);
        });

        it("does not normalize its arguments like a path", () => {
            expect(texts(body("echo ~/Projects/ noir.md"))).toEqual(["~/Projects/ noir.md"]);
        });
    });

    describe("clear", () => {
        it("returns no lines and the clear flag", () => {
            expect(run("clear")).toStrictEqual({ lines: [], clear: true });
        });

        it("is case-insensitive and ignores arguments", () => {
            expect(run("CLEAR now")).toStrictEqual({ lines: [], clear: true });
        });
    });

    describe("exit", () => {
        it("returns no lines and the exit flag", () => {
            expect(run("exit")).toStrictEqual({ lines: [], exit: true });
        });

        it("is case-insensitive", () => {
            expect(run("Exit")).toStrictEqual({ lines: [], exit: true });
        });
    });

    describe("unknown commands", () => {
        it("reports command not found on a dim line with a hint", () => {
            expect(body("frobnicate")).toEqual([dimLine("command not found: frobnicate · try help")]);
        });

        it("echoes the command word as typed", () => {
            expect(body("FooBar baz")).toEqual([dimLine("command not found: FooBar · try help")]);
        });

        it("does not navigate, clear or exit", () => {
            const result = run("frobnicate");
            expect(result.navigate).toBeUndefined();
            expect(result.clear).toBeUndefined();
            expect(result.exit).toBeUndefined();
        });

        it("music is not a command", () => {
            expect(body("music")).toEqual([dimLine("command not found: music · try help")]);
        });
    });

    describe("no em dashes in terminal output", () => {
        const SWEEP: readonly string[] = [
            "help",
            "ls",
            "ls ~",
            "ls home",
            ...Object.keys(TERMINAL_DIRS).map((dir) => `ls ${dir}`),
            "ls nope",
            "ls music",
            ...Object.keys(CD_TARGETS).flatMap((key) => [`cd ${key}`, `open ${key}`]),
            "cd nowhere",
            "open nowhere",
            "cd music",
            ...Object.keys(TERMINAL_FILES).map((file) => `cat ${file}`),
            "cat",
            "cat nope",
            "cat music",
            "whoami",
            "status",
            "uptime",
            "neofetch",
            "contact",
            "pwd",
            "date",
            "echo plain words",
            "clear",
            "exit",
            "frobnicate",
        ];

        it("exercises every command", () => {
            const swept = new Set(SWEEP.map((raw) => raw.split(/\s+/)[0]));
            for (const command of COMMANDS) expect(swept.has(command)).toBe(true);
        });

        it("produces a substantial amount of output", () => {
            const total = SWEEP.reduce((sum, raw) => sum + run(raw, { path: "~/projects/noir" }).lines.length, 0);
            expect(total).toBeGreaterThan(100);
        });

        it.each(SWEEP)("%s prints no em dash", (raw) => {
            for (const line of run(raw, { path: "~/projects/noir" }).lines) {
                expect(line.text).not.toContain(EM_DASH);
            }
        });

        it("the welcome banner and help text are clean too", () => {
            expect(WELCOME_LINE.text).not.toContain(EM_DASH);
            for (const line of HELP_LINES) expect(line).not.toContain(EM_DASH);
        });
    });
});

describe("appendScrollback", () => {
    const line = (text: string): TermLine => ({ text, tone: "text" });
    const many = (prefix: string, count: number): TermLine[] =>
        Array.from({ length: count }, (_, i) => line(`${prefix}${i}`));

    it("appends new lines after the existing history", () => {
        expect(appendScrollback([line("a")], [line("b"), line("c")])).toEqual([line("a"), line("b"), line("c")]);
    });

    it("returns an empty scrollback for empty inputs", () => {
        expect(appendScrollback([], [])).toEqual([]);
    });

    it("keeps everything up to MAX_SCROLLBACK lines", () => {
        const result = appendScrollback(many("h", MAX_SCROLLBACK - 2), many("n", 2));
        expect(result).toHaveLength(MAX_SCROLLBACK);
        expect(result[0].text).toBe("h0");
        expect(result[MAX_SCROLLBACK - 1].text).toBe("n1");
    });

    it("drops the oldest lines beyond MAX_SCROLLBACK", () => {
        const result = appendScrollback(many("h", MAX_SCROLLBACK), many("n", 2));
        expect(result).toHaveLength(300);
        expect(result[0].text).toBe("h2");
        expect(result[298].text).toBe("n0");
        expect(result[299].text).toBe("n1");
    });

    it("keeps only the newest 300 when a single append overflows", () => {
        const result = appendScrollback([], many("n", 450));
        expect(result).toHaveLength(300);
        expect(result[0].text).toBe("n150");
        expect(result[299].text).toBe("n449");
    });

    it("does not mutate its inputs", () => {
        const history = Object.freeze(many("h", 3));
        const lines = Object.freeze(many("n", 2));
        const result = appendScrollback(history, lines);
        expect(history).toHaveLength(3);
        expect(lines).toHaveLength(2);
        expect(result).not.toBe(history);
        expect(result).toHaveLength(5);
    });
});

describe("recallHistory", () => {
    const HISTORY: readonly string[] = Object.freeze(["help", "ls projects", "cat motd"]);

    it("ignores up with an empty history", () => {
        expect(recallHistory([], -1, "up")).toBeNull();
        expect(recallHistory([], 0, "up")).toBeNull();
    });

    it("recalls the newest entry on the first up", () => {
        expect(recallHistory(HISTORY, -1, "up")).toEqual({ histIdx: 2, cmd: "cat motd" });
    });

    it("walks back one entry per up", () => {
        expect(recallHistory(HISTORY, 2, "up")).toEqual({ histIdx: 1, cmd: "ls projects" });
        expect(recallHistory(HISTORY, 1, "up")).toEqual({ histIdx: 0, cmd: "help" });
    });

    it("clamps repeated up at the oldest entry", () => {
        expect(recallHistory(HISTORY, 0, "up")).toEqual({ histIdx: 0, cmd: "help" });
    });

    it("ignores down on a fresh prompt", () => {
        expect(recallHistory(HISTORY, -1, "down")).toBeNull();
        expect(recallHistory([], -1, "down")).toBeNull();
    });

    it("walks forward one entry per down", () => {
        expect(recallHistory(HISTORY, 0, "down")).toEqual({ histIdx: 1, cmd: "ls projects" });
        expect(recallHistory(HISTORY, 1, "down")).toEqual({ histIdx: 2, cmd: "cat motd" });
    });

    it("returns to a fresh prompt when down runs past the newest entry", () => {
        expect(recallHistory(HISTORY, 2, "down")).toEqual({ histIdx: -1, cmd: "" });
        expect(recallHistory(HISTORY, 7, "down")).toEqual({ histIdx: -1, cmd: "" });
    });

    it("replays a full up and down walk", () => {
        let idx = -1;
        const walk: string[] = [];
        for (const direction of ["up", "up", "up", "up", "down", "down", "down", "down"] as const) {
            const step = recallHistory(HISTORY, idx, direction);
            if (step) idx = step.histIdx;
            walk.push(step ? step.cmd : "(ignored)");
        }
        expect(walk).toEqual(["cat motd", "ls projects", "help", "help", "ls projects", "cat motd", "", "(ignored)"]);
        expect(idx).toBe(-1);
    });
});
