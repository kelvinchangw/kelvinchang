import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { ROUTE_PATHS, type RouteKey } from "../../data/site";
import { scrollToTop } from "../../hooks/useLenis";
import { useNow } from "../../hooks/useNow";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useTerminal } from "../../hooks/useTerminal";
import { routeKeyForPathname, sectionForRoute, shellPathFor } from "../../lib/routes";
import { DEFAULT_SETTINGS } from "../../settings";
import Footer from "../Footer/Footer";
import Overlays from "../Overlays/Overlays";
import Rail from "../Rail/Rail";
import Terminal from "../Terminal/Terminal";
import TitleBar from "../TitleBar/TitleBar";
import styles from "./Shell.module.css";

function isTypingTarget(element: Element | null): element is HTMLElement {
    if (!element) return false;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName)) return true;
    return (element as HTMLElement).isContentEditable === true;
}

/** The persistent frame around every page: title bar, rail, footer, overlays and the terminal drawer. */
export default function Shell({ children }: { children: ReactNode }) {
    const location = useLocation();
    const navigate = useNavigate();
    const navigationType = useNavigationType();
    const toggleRef = useRef<HTMLButtonElement>(null);
    const route = routeKeyForPathname(location.pathname);
    const section = sectionForRoute(route);
    const path = shellPathFor(route, location.pathname);
    const nowMs = useNow();
    const reducedMotion = usePrefersReducedMotion();
    const crtMotion = DEFAULT_SETTINGS.crtMotion && !reducedMotion;

    // cd/open to the page already on screen replaces the entry instead of stacking a duplicate, like a same-page
    // <Link> click does; a replace still mints a new location.key, so the scroll-to-top below runs either way.
    const onNavigate = useCallback(
        (target: RouteKey) => navigate(ROUTE_PATHS[target], { replace: target === route }),
        [navigate, route],
    );
    const terminal = useTerminal({ path, onNavigate });
    const { open, openTerminal, closeTerminal } = terminal;

    // The design scrolls to the top on every navigation, including to the page already on screen, so key on
    // location.key (fresh on every push or replace). POP is the initial load and back/forward, where the browser
    // restores the position itself. A layout effect runs before paint, so the new page never flashes at the old
    // offset (router transitions defer passive effects past the paint).
    useLayoutEffect(() => {
        if (navigationType === "POP") return;
        scrollToTop();
    }, [location.key, navigationType]);

    // Closing unmounts the drawer and with it the focused element (command input or close button), so focus drops
    // to <body>. Hand it back to the toggle that controls the drawer; when the toggle itself closed the drawer it
    // still has focus and nothing happens.
    useEffect(() => {
        if (!open) return;
        const toggle = toggleRef.current;
        return () => {
            const active = document.activeElement;
            if (!active || active === document.body) toggle?.focus({ preventScroll: true });
        };
    }, [open]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            // Keys delivered while an IME is composing belong to the composition, not to the shortcuts.
            if (event.isComposing || event.keyCode === 229) return;
            if (event.metaKey || event.ctrlKey || event.altKey) return;
            const active = document.activeElement;
            const typing = isTypingTarget(active);
            if ((event.key === "/" || event.key === "`") && !typing) {
                event.preventDefault();
                openTerminal();
            } else if (event.key === "Escape" && open) {
                closeTerminal();
                if (typing) active.blur();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, openTerminal, closeTerminal]);

    return (
        <div className={styles.root}>
            <div className={styles.frame}>
                <TitleBar
                    path={path}
                    nowMs={nowMs}
                    terminalOpen={open}
                    onToggleTerminal={terminal.toggleTerminal}
                    toggleRef={toggleRef}
                />
                <div className={styles.body}>
                    <Rail section={section} nowMs={nowMs} crtMotion={crtMotion} />
                    <main className={styles.content}>{children}</main>
                </div>
                <Footer />
            </div>
            {open && <Terminal path={path} terminal={terminal} />}
            <Overlays scanlines={DEFAULT_SETTINGS.scanlines} />
        </div>
    );
}
