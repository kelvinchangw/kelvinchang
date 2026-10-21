/** NOIR's build day. Uptime counts from local midnight on this date. */
export const UPTIME_SINCE_LABEL = "2025-01-17";
export const UPTIME_SINCE_MS = new Date(2025, 0, 17).getTime();

export function pad2(n: number): string {
    return String(n).padStart(2, "0");
}

/** HH:MM:SS in local time. */
export function formatClock(date: Date): string {
    return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

/** YYYY-MM-DD in local time. */
export function formatDate(date: Date): string {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** YYYY-MM-DD HH:MM:SS in local time. */
export function formatDateTime(date: Date): string {
    return `${formatDate(date)} ${formatClock(date)}`;
}

/** Elapsed time since `sinceMs`, formatted as `Dd HH:MM:SS`. Never negative. */
export function formatUptime(nowMs: number, sinceMs: number = UPTIME_SINCE_MS): string {
    let seconds = Math.max(0, Math.floor((nowMs - sinceMs) / 1000));
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    return `${days}d ${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}
