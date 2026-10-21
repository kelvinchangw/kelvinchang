import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE, type RouteKey } from "../data/site";
import { routeKeyForPathname } from "../lib/routes";

const TITLES: Partial<Record<RouteKey, string>> = {
    projects: "Projects",
    blog: "Blog",
    about: "About",
};

/** Keeps document.title in sync with the current section, using the same path resolution as the shell. */
export default function TitleManager() {
    const { pathname } = useLocation();

    useEffect(() => {
        const route = routeKeyForPathname(pathname);
        document.title = (route && TITLES[route]) || SITE.owner;
    }, [pathname]);

    return null;
}
