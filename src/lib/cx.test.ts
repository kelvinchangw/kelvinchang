import { describe, expect, it } from "vitest";
import { cx } from "./cx";

describe("cx", () => {
    it("joins class names with a single space", () => {
        expect(cx("a", "b", "c")).toBe("a b c");
    });

    it("returns a single class unchanged", () => {
        expect(cx("only")).toBe("only");
    });

    it("preserves argument order", () => {
        expect(cx("z", "a")).toBe("z a");
    });

    it("skips false, null, undefined and empty strings", () => {
        expect(cx("a", false, null, undefined, "", "b")).toBe("a b");
        expect(cx(false, "a")).toBe("a");
        expect(cx("a", null)).toBe("a");
    });

    it("returns an empty string when nothing is truthy", () => {
        expect(cx()).toBe("");
        expect(cx(false, null, undefined, "")).toBe("");
    });

    it("supports the conditional-class idiom", () => {
        const flags = { active: true, disabled: false };
        expect(cx("row", flags.active && "active", flags.disabled && "disabled")).toBe("row active");
        expect(cx("row", !flags.active && "active", !flags.disabled && "disabled")).toBe("row disabled");
    });

    it("does not add separators around skipped values", () => {
        expect(cx("a", false, "b")).not.toContain("  ");
        expect(cx(false, "a", false)).toBe("a");
    });
});
