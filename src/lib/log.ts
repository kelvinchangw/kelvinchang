import { LOG_GROUP_ORDER, type LogEntry, type LogFilter } from "../data/site";

export interface LogGroup {
    label: string;
    rows: LogEntry[];
    count: string;
}

/** Keeps the entries matching `filter` ("all" keeps everything), preserving order. */
export function filterLog(entries: readonly LogEntry[], filter: LogFilter): LogEntry[] {
    return entries.filter((entry) => filter === "all" || entry.type === filter);
}

/** Buckets rows by their group label in `order`, dropping empty groups. */
export function groupLog(rows: readonly LogEntry[], order: readonly string[] = LOG_GROUP_ORDER): LogGroup[] {
    return order
        .map((label) => ({ label, rows: rows.filter((row) => row.group === label) }))
        .filter((group) => group.rows.length > 0)
        .map((group) => ({ ...group, count: String(group.rows.length) }));
}

/** "1 entry" / "n entries". */
export function entryCountLabel(count: number): string {
    return `${count} ${count === 1 ? "entry" : "entries"}`;
}
