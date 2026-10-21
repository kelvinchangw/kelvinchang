import { useState } from "react";
import { Link } from "react-router-dom";
import { LOG, LOG_FILTERS, ROUTE_PATHS, SEP, type LogFilter } from "../../data/site";
import { cx } from "../../lib/cx";
import { entryCountLabel, filterLog, groupLog } from "../../lib/log";
import { Marker, Prompt } from "../../components/ui";
import ui from "../../components/ui/ui.module.css";
import styles from "./Home.module.css";

/** Home: a filterable `tail -f` of posts and project updates. */
export default function Home() {
    const [filter, setFilter] = useState<LogFilter>("all");
    const rows = filterLog(LOG, filter);
    const groups = groupLog(rows);

    return (
        <div className={styles.page}>
            <section>
                <div className={styles.headerRow}>
                    <Prompt as="h1">$ tail -f /var/log/kelvin.log</Prompt>
                    <div className={styles.filters} role="group" aria-label="Filter log">
                        {LOG_FILTERS.map((option) => (
                            <button
                                key={option}
                                type="button"
                                className={cx(styles.filter, option === filter && styles.filterActive)}
                                aria-pressed={option === filter}
                                onClick={() => setFilter(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
                <div className={styles.log} data-testid="log">
                    {groups.map((group) => (
                        <div key={group.label} data-testid="log-group">
                            <Marker left={group.label} right={group.count} className={styles.groupMarker} />
                            {group.rows.map((row) => (
                                <Link
                                    key={`${row.date} ${row.title} ${row.sub}`}
                                    to={ROUTE_PATHS[row.route]}
                                    className={styles.row}
                                    data-testid="log-row"
                                >
                                    <span className={ui.dim}>{row.date}</span>
                                    <span className={ui.cell}>
                                        <span className={ui.bright}>{row.title}</span>
                                        <span className={ui.dim}>
                                            {SEP}
                                            {row.sub}
                                        </span>
                                    </span>
                                    <span className={styles.meta}>{row.meta}</span>
                                </Link>
                            ))}
                            <div className={styles.groupEnd} />
                        </div>
                    ))}
                    <div className={styles.logFooter}>
                        <span>{entryCountLabel(rows.length)} · newest first</span>
                        <span>filter: {filter}</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
