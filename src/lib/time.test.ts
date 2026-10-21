import { describe, expect, it } from "vitest";
import {
    formatClock,
    formatDate,
    formatDateTime,
    formatUptime,
    pad2,
    UPTIME_SINCE_LABEL,
    UPTIME_SINCE_MS,
} from "./time";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Fixed origin for uptime maths. formatUptime is pure millisecond arithmetic, so DST never applies. */
const SINCE = new Date(2025, 0, 17).getTime();

describe("pad2", () => {
    it("left-pads single digits with a zero", () => {
        expect(pad2(0)).toBe("00");
        expect(pad2(5)).toBe("05");
        expect(pad2(9)).toBe("09");
    });

    it("leaves two-digit numbers alone", () => {
        expect(pad2(10)).toBe("10");
        expect(pad2(59)).toBe("59");
    });

    it("never truncates wider numbers", () => {
        expect(pad2(100)).toBe("100");
        expect(pad2(2025)).toBe("2025");
    });
});

describe("formatClock", () => {
    it("formats midnight as 00:00:00", () => {
        expect(formatClock(new Date(2025, 0, 17, 0, 0, 0))).toBe("00:00:00");
    });

    it("zero-pads single-digit hours, minutes and seconds", () => {
        expect(formatClock(new Date(2025, 0, 17, 1, 2, 3))).toBe("01:02:03");
    });

    it("uses a 24-hour clock", () => {
        expect(formatClock(new Date(2025, 0, 17, 12, 0, 0))).toBe("12:00:00");
        expect(formatClock(new Date(2025, 0, 17, 13, 45, 30))).toBe("13:45:30");
    });

    it("formats the last second of the day as 23:59:59", () => {
        expect(formatClock(new Date(2025, 11, 31, 23, 59, 59))).toBe("23:59:59");
    });

    it("ignores milliseconds", () => {
        expect(formatClock(new Date(2025, 0, 17, 10, 20, 30, 999))).toBe("10:20:30");
    });
});

describe("formatDate", () => {
    it("formats as YYYY-MM-DD with a zero-padded month and day", () => {
        expect(formatDate(new Date(2025, 0, 5))).toBe("2025-01-05");
    });

    it("uses one-based months", () => {
        expect(formatDate(new Date(2025, 11, 31))).toBe("2025-12-31");
        expect(formatDate(new Date(2025, 9, 20))).toBe("2025-10-20");
    });

    it("is unaffected by the time of day", () => {
        expect(formatDate(new Date(2025, 0, 17, 0, 0, 0))).toBe("2025-01-17");
        expect(formatDate(new Date(2025, 0, 17, 23, 59, 59))).toBe("2025-01-17");
    });
});

describe("formatDateTime", () => {
    it("joins the date and the clock with a single space", () => {
        expect(formatDateTime(new Date(2025, 0, 17, 0, 0, 0))).toBe("2025-01-17 00:00:00");
        expect(formatDateTime(new Date(2025, 2, 4, 5, 6, 7))).toBe("2025-03-04 05:06:07");
        expect(formatDateTime(new Date(2025, 11, 31, 23, 59, 59))).toBe("2025-12-31 23:59:59");
    });

    it("is formatDate and formatClock composed", () => {
        const date = new Date(2026, 9, 20, 14, 30, 15);
        expect(formatDateTime(date)).toBe(`${formatDate(date)} ${formatClock(date)}`);
    });
});

describe("formatUptime", () => {
    it("starts at 0d 00:00:00", () => {
        expect(formatUptime(SINCE, SINCE)).toBe("0d 00:00:00");
    });

    it("counts seconds", () => {
        expect(formatUptime(SINCE + SECOND, SINCE)).toBe("0d 00:00:01");
        expect(formatUptime(SINCE + 59 * SECOND, SINCE)).toBe("0d 00:00:59");
    });

    it("rolls seconds into minutes", () => {
        expect(formatUptime(SINCE + MINUTE, SINCE)).toBe("0d 00:01:00");
        expect(formatUptime(SINCE + HOUR - SECOND, SINCE)).toBe("0d 00:59:59");
    });

    it("rolls minutes into hours", () => {
        expect(formatUptime(SINCE + HOUR, SINCE)).toBe("0d 01:00:00");
        expect(formatUptime(SINCE + DAY - SECOND, SINCE)).toBe("0d 23:59:59");
    });

    it("rolls hours into days", () => {
        expect(formatUptime(SINCE + DAY, SINCE)).toBe("1d 00:00:00");
        expect(formatUptime(SINCE + 10 * DAY + 5 * HOUR + 7 * MINUTE + 9 * SECOND, SINCE)).toBe("10d 05:07:09");
    });

    it("does not pad the day count", () => {
        expect(formatUptime(SINCE + 365 * DAY, SINCE)).toBe("365d 00:00:00");
    });

    it("floors partial seconds", () => {
        expect(formatUptime(SINCE + 999, SINCE)).toBe("0d 00:00:00");
        expect(formatUptime(SINCE + 1999, SINCE)).toBe("0d 00:00:01");
    });

    it("clamps a negative delta to 0d 00:00:00", () => {
        expect(formatUptime(SINCE - 1, SINCE)).toBe("0d 00:00:00");
        expect(formatUptime(SINCE - SECOND, SINCE)).toBe("0d 00:00:00");
        expect(formatUptime(SINCE - 3 * DAY, SINCE)).toBe("0d 00:00:00");
    });

    it("counts from UPTIME_SINCE_MS by default", () => {
        expect(formatUptime(UPTIME_SINCE_MS + DAY + 2 * HOUR)).toBe("1d 02:00:00");
        expect(formatUptime(UPTIME_SINCE_MS + 42 * SECOND)).toBe(
            formatUptime(UPTIME_SINCE_MS + 42 * SECOND, UPTIME_SINCE_MS),
        );
    });
});

describe("UPTIME_SINCE_MS", () => {
    it("is local midnight on 2025-01-17", () => {
        expect(UPTIME_SINCE_MS).toBe(new Date(2025, 0, 17, 0, 0, 0, 0).getTime());
        expect(formatDateTime(new Date(UPTIME_SINCE_MS))).toBe("2025-01-17 00:00:00");
    });

    it("matches UPTIME_SINCE_LABEL", () => {
        expect(UPTIME_SINCE_LABEL).toBe("2025-01-17");
        expect(formatDate(new Date(UPTIME_SINCE_MS))).toBe(UPTIME_SINCE_LABEL);
    });
});
