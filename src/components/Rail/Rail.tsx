import { Link } from "react-router-dom";
import pfp from "../../assets/images/pfp.png";
import { MOTD, NAV, RAIL, SITE, STATUS_STATIC, type Section } from "../../data/site";
import { cx } from "../../lib/cx";
import { formatUptime } from "../../lib/time";
import CrtMonitor from "../CrtMonitor/CrtMonitor";
import { Chip, Prompt } from "../ui";
import styles from "./Rail.module.css";

export interface RailProps {
    /** Nav section to light up, or `null` for pages outside the nav. */
    section: Section | null;
    nowMs: number;
    crtMotion: boolean;
}

/** The left rail, identical on every page: whoami, nav, status, motd. */
export default function Rail({ section, nowMs, crtMotion }: RailProps) {
    const [user, machine] = SITE.promptUser.split("@");

    return (
        <aside className={styles.rail}>
            <section>
                <Prompt>$ whoami</Prompt>
                <CrtMonitor src={pfp} caption={RAIL.portraitCaption} motion={crtMotion} className={styles.monitor} />
                <div className={styles.name}>
                    {user}
                    <span className={styles.at}>@</span>
                    {machine}
                </div>
                <div className={styles.tagline}>{RAIL.tagline}</div>
            </section>

            <section>
                <Prompt>$ ls</Prompt>
                <nav className={styles.nav} aria-label="Site">
                    {NAV.map((item) => {
                        const active = item.section === section;
                        return (
                            <Link
                                key={item.section}
                                to={`/${item.section === "home" ? "" : item.section}`}
                                className={cx(styles.navLink, active && styles.active)}
                                aria-current={active ? "page" : undefined}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </section>

            <section>
                <Prompt>$ status</Prompt>
                <dl className={styles.status}>
                    <div className={styles.pair}>
                        <dt>NOIR</dt>
                        <dd>
                            <Chip className={styles.statusChip}>ONLINE</Chip>
                        </dd>
                    </div>
                    <div className={styles.pair}>
                        <dt>uptime</dt>
                        <dd data-testid="rail-uptime">{formatUptime(nowMs)}</dd>
                    </div>
                    {STATUS_STATIC.map(([key, value]) => (
                        <div className={styles.pair} key={key}>
                            <dt>{key}</dt>
                            <dd>{value}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            <section>
                <Prompt>$ cat /etc/motd</Prompt>
                <div className={styles.motd}>
                    {MOTD.map((line) => (
                        <div key={line}>{line}</div>
                    ))}
                </div>
            </section>
        </aside>
    );
}
