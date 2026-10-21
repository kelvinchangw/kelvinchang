import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cx } from "../../lib/cx";
import ui from "./ui.module.css";

interface WithChildren {
    children: ReactNode;
    className?: string;
}

/** A `$ command` line above a block of content. List pages render their primary prompt as the page heading. */
export function Prompt({ as: Tag = "div", children, className }: WithChildren & { as?: "div" | "h1" | "h2" }) {
    return <Tag className={cx(ui.prompt, className)}>{children}</Tag>;
}

/** Inverse-video chip (ONLINE, 001) or outline chip (DEV). */
export function Chip({
    variant = "inverse",
    children,
    className,
}: WithChildren & { variant?: "inverse" | "outline" }) {
    return (
        <span className={cx(variant === "inverse" ? ui.chipInverse : ui.chipOutline, className)}>
            {children}
        </span>
    );
}

/** `label ——— count` group or date marker. */
export function Marker({ left, right, className }: { left?: ReactNode; right?: ReactNode; className?: string }) {
    return (
        <div className={cx(ui.marker, className)}>
            {left !== undefined && <span>{left}</span>}
            <span className={ui.markerLine} aria-hidden="true" />
            {right !== undefined && <span>{right}</span>}
        </div>
    );
}

/** `——— label ———` closing marker. */
export function EofMarker({ children, className }: WithChildren) {
    return (
        <div className={cx(ui.marker, className)}>
            <span className={ui.markerLine} aria-hidden="true" />
            <span>{children}</span>
            <span className={ui.markerLine} aria-hidden="true" />
        </div>
    );
}

/** A photo with the violet phosphor treatment and an optional caption. */
export function PhosphorImage({
    src,
    alt,
    caption,
    className,
}: {
    src: string;
    alt: string;
    caption?: string;
    className?: string;
}) {
    return (
        <figure className={cx(ui.phosphor, className)}>
            <img src={src} alt={alt} className={ui.phosphorImg} />
            <div className={ui.phosphorTint} aria-hidden="true" />
            {caption && <figcaption className={ui.phosphorCaption}>{caption}</figcaption>}
        </figure>
    );
}

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
    return (
        <Link to={to} className={ui.backLink}>
            {children}
        </Link>
    );
}

/** Dim 12px line under a table (`4 projects · 1 online · 3 in development`). */
export function FootNote({ children, className }: WithChildren) {
    return <div className={cx(ui.footNote, className)}>{children}</div>;
}

/** `- item` list with a 24px gutter. */
export function DashList({ items, className }: { items: readonly string[]; className?: string }) {
    return (
        <ul className={cx(ui.list, className)}>
            {items.map((item) => (
                <li key={item} className={ui.listItem}>
                    <span className={ui.listDash} aria-hidden="true">
                        -
                    </span>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}
