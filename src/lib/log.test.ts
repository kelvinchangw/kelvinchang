import { describe, expect, it } from "vitest";
import { LOG, LOG_FILTERS, LOG_GROUP_ORDER, type LogEntry, type LogType } from "../data/site";
import { entryCountLabel, filterLog, groupLog } from "./log";

function entry(fields: Pick<LogEntry, "title" | "type" | "group"> & Partial<LogEntry>): LogEntry {
    return { date: "2025-01-01", sub: "", meta: "", route: "home", ...fields };
}

/** Mixed types and groups, deliberately not sorted by group. */
const FIXTURE: readonly LogEntry[] = [
    entry({ title: "post-1", type: "post", group: "2025" }),
    entry({ title: "noir-1", type: "noir", group: "2025" }),
    entry({ title: "proj-1", type: "proj", group: "in development" }),
    entry({ title: "post-2", type: "post", group: "in development" }),
    entry({ title: "noir-2", type: "noir", group: "2025" }),
];

const titles = (entries: readonly LogEntry[]) => entries.map((item) => item.title);

describe("filterLog", () => {
    it("keeps every entry, in order, for the 'all' filter", () => {
        const result = filterLog(FIXTURE, "all");
        expect(result).toEqual([...FIXTURE]);
        expect(result).toHaveLength(FIXTURE.length);
        expect(result).not.toBe(FIXTURE);
    });

    it("keeps only post entries, in order", () => {
        expect(titles(filterLog(FIXTURE, "post"))).toEqual(["post-1", "post-2"]);
    });

    it("keeps only noir entries, in order", () => {
        expect(titles(filterLog(FIXTURE, "noir"))).toEqual(["noir-1", "noir-2"]);
    });

    it("keeps only proj entries", () => {
        expect(titles(filterLog(FIXTURE, "proj"))).toEqual(["proj-1"]);
    });

    it("returns an empty list when nothing matches", () => {
        const noProjects = FIXTURE.filter((item) => item.type !== "proj");
        expect(filterLog(noProjects, "proj")).toEqual([]);
        expect(filterLog([], "all")).toEqual([]);
    });

    it("does not mutate its input", () => {
        const copy = [...FIXTURE];
        filterLog(copy, "post");
        expect(copy).toEqual([...FIXTURE]);
    });

    describe("against the site log", () => {
        it("'all' returns the whole log unchanged", () => {
            expect(filterLog(LOG, "all")).toEqual([...LOG]);
        });

        const typed = LOG_FILTERS.filter((filter): filter is LogType => filter !== "all");

        it.each(typed)("'%s' returns only entries of that type, in log order", (filter) => {
            const result = filterLog(LOG, filter);
            expect(result.every((item) => item.type === filter)).toBe(true);
            const positions = result.map((item) => LOG.indexOf(item));
            expect(positions).toEqual([...positions].sort((a, b) => a - b));
        });

        it("the typed filters partition the log", () => {
            const total = typed.reduce((sum, filter) => sum + filterLog(LOG, filter).length, 0);
            expect(total).toBe(LOG.length);
        });
    });
});

describe("groupLog", () => {
    it("buckets rows by group in LOG_GROUP_ORDER order", () => {
        const groups = groupLog(FIXTURE);
        expect(groups.map((group) => group.label)).toEqual([...LOG_GROUP_ORDER]);
        expect(titles(groups[0].rows)).toEqual(["post-1", "noir-1", "noir-2"]);
        expect(titles(groups[1].rows)).toEqual(["proj-1", "post-2"]);
    });

    it("orders groups by the order list, not by first appearance", () => {
        const devFirst = [...FIXTURE].reverse();
        expect(devFirst[0].group).toBe("2025");
        expect(devFirst[1].group).toBe("in development");
        const groups = groupLog(devFirst, ["in development", "2025"]);
        expect(groups.map((group) => group.label)).toEqual(["in development", "2025"]);
    });

    it("preserves row order inside each group", () => {
        const groups = groupLog([...FIXTURE].reverse());
        expect(titles(groups[0].rows)).toEqual(["noir-2", "noir-1", "post-1"]);
        expect(titles(groups[1].rows)).toEqual(["post-2", "proj-1"]);
    });

    it("drops empty groups", () => {
        const only2025 = FIXTURE.filter((item) => item.group === "2025");
        expect(groupLog(only2025).map((group) => group.label)).toEqual(["2025"]);
        expect(groupLog([])).toEqual([]);
    });

    it("exposes the row count as a string", () => {
        const groups = groupLog(FIXTURE);
        expect(groups.map((group) => group.count)).toEqual(["3", "2"]);
        for (const group of groups) {
            expect(typeof group.count).toBe("string");
            expect(group.count).toBe(String(group.rows.length));
        }
    });

    it("accepts a custom order", () => {
        expect(groupLog(FIXTURE, ["in development", "2025"]).map((group) => group.label)).toEqual([
            "in development",
            "2025",
        ]);
    });

    it("omits rows whose group is not in the order list", () => {
        const groups = groupLog(FIXTURE, ["2025"]);
        expect(groups).toHaveLength(1);
        expect(groups[0].label).toBe("2025");
        expect(groups[0].count).toBe("3");
        expect(groupLog(FIXTURE, ["nope"])).toEqual([]);
    });

    it("places every site log entry in exactly one group", () => {
        const groups = groupLog(LOG);
        const labels = groups.map((group) => group.label);
        expect(labels).toEqual(LOG_GROUP_ORDER.filter((label) => labels.includes(label)));
        expect(groups.reduce((sum, group) => sum + group.rows.length, 0)).toBe(LOG.length);
        for (const group of groups) expect(group.count).toBe(String(group.rows.length));
    });
});

describe("entryCountLabel", () => {
    it("pluralises zero", () => {
        expect(entryCountLabel(0)).toBe("0 entries");
    });

    it("uses the singular for exactly one", () => {
        expect(entryCountLabel(1)).toBe("1 entry");
    });

    it("pluralises anything above one", () => {
        expect(entryCountLabel(2)).toBe("2 entries");
        expect(entryCountLabel(6)).toBe("6 entries");
        expect(entryCountLabel(300)).toBe("300 entries");
    });
});
