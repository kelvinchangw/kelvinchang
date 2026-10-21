/** Site-wide CRT settings. There is no UI for these yet; edit here to change the defaults. */
export interface SiteSettings {
    /** Full-viewport scanline overlay. */
    scanlines: boolean;
    /** Continuous CRT portrait animation (also disabled under prefers-reduced-motion). */
    crtMotion: boolean;
}

export const DEFAULT_SETTINGS: SiteSettings = {
    scanlines: true,
    crtMotion: true,
};
