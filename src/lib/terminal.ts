import {
    CD_TARGETS,
    CONTACT,
    NEOFETCH_STATIC,
    SHELL_PATHS,
    SITE,
    TERMINAL_DIRS,
    TERMINAL_FILES,
    type RouteKey,
} from "../data/site";
import { formatDateTime, formatUptime, UPTIME_SINCE_LABEL } from "./time";

export type LineTone = "dim" | "text" | "bright";

export interface TermLine {
    text: string;
    tone: LineTone;
}

export interface TermContext {
    /** Route the page behind the drawer is on (drives the prompt path). */
    path: string;
    now: Date;
}

export interface TermResult {
    /** Lines to append to the scrollback (the echoed command first). */
    lines: TermLine[];
    navigate?: RouteKey;
    clear?: boolean;
    exit?: boolean;
}

export const COMMANDS: readonly string[] = [
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
];

export const MAX_SCROLLBACK = 300;

export const WELCOME_LINE: TermLine = {
    text: `${SITE.host} shell: type help to see what this thing can do.`,
    tone: "dim",
};

export const HELP_LINES: readonly string[] = [
    "help              this list",
    "ls [dir]          list ~ · projects · blog · about",
    "cd <dir>          go to home · projects · blog · about · noir · 001",
    "cat <file>        read motd · whoami · history · noir · 001",
    "status · uptime   NOIR system status",
    "neofetch          system summary",
    "contact           where to reach me",
    "pwd · date · echo · clear · exit",
];

/** Strips a leading `~/`, a trailing `/` and a `.md` suffix, then lowercases. */
export function normalizeArg(arg: string): string {
    return arg.replace(/^~\/?/, "").replace(/\/$/, "").replace(/\.md$/, "").toLowerCase();
}

export function padKey(key: string, value: string, width = 10): string {
    return key.padEnd(width) + value;
}

/** Completes a partial command name; returns `null` when there is nothing to complete. */
export function completeCommand(partial: string): string | null {
    if (!partial || partial.includes(" ")) return null;
    const match = COMMANDS.find((command) => command.startsWith(partial.toLowerCase()));
    return match ? `${match} ` : null;
}

export function statusLines(nowMs: number): string[] {
    return [
        padKey("NOIR", "ONLINE"),
        padKey("uptime", formatUptime(nowMs)),
        padKey("os", "TrueNAS Scale"),
        padKey("services", "NAS storage · Home Assistant"),
        padKey("storage", "1×1TB NVMe · 3×12TB HDD (36 TB raw)"),
        padKey("projects", "1 online · 3 in dev"),
        padKey("entries", "1"),
    ];
}

export function neofetchLines(nowMs: number): TermLine[] {
    const rows: TermLine[] = [
        { text: SITE.promptUser, tone: "bright" },
        { text: "-".repeat(SITE.promptUser.length), tone: "dim" },
    ];
    for (const [key, value] of NEOFETCH_STATIC) rows.push({ text: padKey(key, value), tone: "text" });
    rows.push({ text: padKey("Uptime:", formatUptime(nowMs)), tone: "text" });
    rows.push({ text: padKey("Shell:", SITE.host), tone: "text" });
    rows.push({ text: padKey("Theme:", "violet phosphor"), tone: "text" });
    return rows;
}

export function contactLines(): string[] {
    const strip = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
    return [CONTACT.email, strip(CONTACT.linkedin), strip(CONTACT.github), strip(CONTACT.youtube)];
}


/** Own-key lookup: the tables are plain objects, so `constructor` / `__proto__` would otherwise resolve to Object.prototype members. */
function own<T>(table: Readonly<Record<string, T>>, key: string): T | undefined {
    return Object.prototype.hasOwnProperty.call(table, key) ? table[key] : undefined;
}

/**
 * Runs one command line against the site "filesystem".
 * Returns `null` for blank input. Never throws on unknown commands.
 */
export function runCommand(raw: string, ctx: TermContext): TermResult | null {
    const command = raw.trim();
    if (!command) return null;

    const [word, ...rest] = command.split(/\s+/);
    const name = word.toLowerCase();
    const arg = normalizeArg(rest[0] ?? "");
    const lines: TermLine[] = [{ text: `${SITE.promptUser}:${ctx.path}$ ${command}`, tone: "dim" }];
    const push = (text: string, tone: LineTone = "text") => lines.push({ text, tone });
    const result: TermResult = { lines };

    switch (name) {
        case "help":
            HELP_LINES.forEach((line) => push(line));
            break;
        case "ls": {
            const dir = arg || "~";
            const listing = own(TERMINAL_DIRS, dir === "home" ? "~" : dir);
            if (listing) listing.forEach((line) => push(line));
            else push(`ls: cannot access ${arg}: no such directory`, "dim");
            break;
        }
        case "cd":
        case "open": {
            const target = own(CD_TARGETS, arg);
            if (target !== undefined) {
                result.navigate = target;
                push(SHELL_PATHS[target], "dim");
            } else {
                push(`${name}: no such file or directory: ${arg}`, "dim");
            }
            break;
        }
        case "cat": {
            const file = own(TERMINAL_FILES, arg);
            if (file) file.forEach((line) => push(line));
            else push(`cat: ${arg}: no such file`, "dim");
            break;
        }
        case "whoami":
            push("kelvin chang · engineer · designer");
            break;
        case "status":
            statusLines(ctx.now.getTime()).forEach((line) => push(line));
            break;
        case "uptime":
            push(`up ${formatUptime(ctx.now.getTime())} since ${UPTIME_SINCE_LABEL}`);
            break;
        case "neofetch":
            lines.push(...neofetchLines(ctx.now.getTime()));
            break;
        case "contact":
            contactLines().forEach((line) => push(line));
            break;
        case "pwd":
            push(ctx.path);
            break;
        case "date":
            push(formatDateTime(ctx.now));
            break;
        case "echo":
            push(rest.join(" "));
            break;
        case "clear":
            return { lines: [], clear: true };
        case "exit":
            return { lines: [], exit: true };
        default:
            push(`command not found: ${word} · try help`, "dim");
    }

    return result;
}

/** Appends lines to the scrollback, keeping only the newest `MAX_SCROLLBACK`. */
export function appendScrollback(history: readonly TermLine[], lines: readonly TermLine[]): TermLine[] {
    return [...history, ...lines].slice(-MAX_SCROLLBACK);
}

export interface HistoryStep {
    histIdx: number;
    cmd: string;
}

/**
 * Walks the command history. `histIdx` is -1 when the prompt shows a fresh line.
 * Returns `null` when the key press should be ignored.
 */
export function recallHistory(
    cmdHistory: readonly string[],
    histIdx: number,
    direction: "up" | "down",
): HistoryStep | null {
    if (direction === "up") {
        if (cmdHistory.length === 0) return null;
        const next = histIdx < 0 ? cmdHistory.length - 1 : Math.max(0, histIdx - 1);
        return { histIdx: next, cmd: cmdHistory[next] };
    }
    if (histIdx < 0) return null;
    const next = histIdx + 1;
    if (next >= cmdHistory.length) return { histIdx: -1, cmd: "" };
    return { histIdx: next, cmd: cmdHistory[next] };
}
