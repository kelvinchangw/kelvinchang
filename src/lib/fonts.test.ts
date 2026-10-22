import { afterEach, describe, expect, it, vi } from "vitest";
import { waitForFonts } from "./fonts";

const FONTS = ["14px \"Fragment Mono\"", "italic 14px \"Fragment Mono\""];
/** What a real font set hands back for a shorthand that matches a declared face. */
const FACE = {} as FontFace;

type Deferred = { promise: Promise<FontFace[]>; resolve: (faces: FontFace[]) => void; reject: (reason: Error) => void };

function deferred(): Deferred {
    let resolve!: Deferred["resolve"];
    let reject!: Deferred["reject"];
    const promise = new Promise<FontFace[]>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

/** Installs a fake `document.fonts` whose `load` hands back one deferred per call, in order. */
function installFonts(loads: Deferred[]) {
    let calls = 0;
    const load = vi.fn<(font: string) => Promise<FontFace[]>>(() => loads[calls++].promise);
    Object.defineProperty(document, "fonts", { value: { load }, configurable: true });
    return load;
}

/** A stylesheet link still loading: jsdom fetches nothing, so `sheet` stays empty until the test fires `load`. */
function appendPendingStylesheet() {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/pending.css";
    document.head.append(link);
    expect(link.sheet).toBeFalsy();
    return link;
}

/** Whether `promise` has settled, checked after enough microtask turns for the wait's own promise chain to run. */
async function settled(promise: Promise<void>) {
    let done = false;
    promise.then(() => {
        done = true;
    });
    for (let turn = 0; turn < 50; turn++) await Promise.resolve();
    return done;
}

describe("waitForFonts", () => {
    afterEach(() => {
        delete (document as { fonts?: unknown }).fonts;
        document.head.querySelectorAll("link").forEach((link) => link.remove());
        vi.useRealTimers();
    });

    it("resolves at once where document.fonts is missing (jsdom)", async () => {
        expect(document.fonts).toBeUndefined();
        await expect(waitForFonts(FONTS, 2000)).resolves.toBeUndefined();
    });

    it("asks the font set for every face and resolves once all have loaded", async () => {
        vi.useFakeTimers();
        const loads = [deferred(), deferred()];
        const load = installFonts(loads);

        const wait = waitForFonts(FONTS, 2000);
        expect(load.mock.calls.map(([font]) => font)).toEqual(FONTS);
        expect(await settled(wait)).toBe(false);

        loads[0].resolve([FACE]);
        expect(await settled(wait)).toBe(false);

        loads[1].resolve([FACE]);
        await expect(wait).resolves.toBeUndefined();
        expect(load).toHaveBeenCalledTimes(2);
        expect(vi.getTimerCount()).toBe(0);
    });

    it("gives up after the timeout while a face is still loading", async () => {
        vi.useFakeTimers();
        installFonts([deferred(), deferred()]);

        const wait = waitForFonts(FONTS, 2000);
        await vi.advanceTimersByTimeAsync(1999);
        expect(await settled(wait)).toBe(false);

        await vi.advanceTimersByTimeAsync(1);
        await expect(wait).resolves.toBeUndefined();
    });

    it("resolves as soon as a face fails rather than waiting for the timeout", async () => {
        vi.useFakeTimers();
        const loads = [deferred(), deferred()];
        installFonts(loads);

        const wait = waitForFonts(FONTS, 2000);
        loads[0].reject(new Error("404"));
        await expect(wait).resolves.toBeUndefined();
        expect(vi.getTimerCount()).toBe(0);
    });

    it("waits for a stylesheet still loading, then asks again, when a face matched nothing", async () => {
        vi.useFakeTimers();
        const loads = [deferred(), deferred(), deferred(), deferred()];
        const load = installFonts(loads);
        const link = appendPendingStylesheet();

        const wait = waitForFonts(FONTS, 2000);
        loads[0].resolve([]);
        loads[1].resolve([]);
        expect(await settled(wait)).toBe(false);
        expect(load).toHaveBeenCalledTimes(2);

        link.dispatchEvent(new Event("load"));
        expect(await settled(wait)).toBe(false);
        expect(load.mock.calls.map(([font]) => font)).toEqual([...FONTS, ...FONTS]);

        loads[2].resolve([FACE]);
        loads[3].resolve([FACE]);
        await expect(wait).resolves.toBeUndefined();
        expect(vi.getTimerCount()).toBe(0);
    });

    it("asks again at once, and only once, when a face matched nothing and no stylesheet is pending", async () => {
        vi.useFakeTimers();
        const loads = [deferred(), deferred(), deferred(), deferred()];
        const load = installFonts(loads);

        const wait = waitForFonts(FONTS, 2000);
        loads[0].resolve([]);
        loads[1].resolve([]);
        expect(await settled(wait)).toBe(false);
        expect(load).toHaveBeenCalledTimes(4);

        loads[2].resolve([]);
        loads[3].resolve([]);
        await expect(wait).resolves.toBeUndefined();
        expect(load).toHaveBeenCalledTimes(4);
        expect(vi.getTimerCount()).toBe(0);
    });

    it("still gives up at the timeout while a stylesheet never finishes loading", async () => {
        vi.useFakeTimers();
        const loads = [deferred(), deferred()];
        const load = installFonts(loads);
        appendPendingStylesheet();

        const wait = waitForFonts(FONTS, 2000);
        loads[0].resolve([]);
        loads[1].resolve([]);
        await vi.advanceTimersByTimeAsync(1999);
        expect(await settled(wait)).toBe(false);
        expect(load).toHaveBeenCalledTimes(2);

        await vi.advanceTimersByTimeAsync(1);
        await expect(wait).resolves.toBeUndefined();
    });

    it("resolves at once when the font set cannot load fonts", async () => {
        Object.defineProperty(document, "fonts", { value: {}, configurable: true });
        await expect(waitForFonts(FONTS, 2000)).resolves.toBeUndefined();
    });

    it("resolves at once, with no timer left behind, when load throws instead of returning a promise", async () => {
        vi.useFakeTimers();
        const load = vi.fn((): Promise<FontFace[]> => {
            throw new SyntaxError("bad font shorthand");
        });
        Object.defineProperty(document, "fonts", { value: { load }, configurable: true });

        await expect(waitForFonts(FONTS, 2000)).resolves.toBeUndefined();
        expect(vi.getTimerCount()).toBe(0);
    });

    it("reports a pending wait as pending (the settled helper is not biased towards false)", async () => {
        vi.useFakeTimers();
        const loads = [deferred(), deferred()];
        installFonts(loads);
        const wait = waitForFonts(FONTS, 2000);
        loads[0].resolve([FACE]);
        loads[1].resolve([FACE]);
        expect(await settled(wait)).toBe(true);
    });
});
