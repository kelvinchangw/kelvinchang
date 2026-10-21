import { Link } from "react-router-dom";
import { PROJECTS, ROUTE_PATHS, SEP } from "../../data/site";
import { cx } from "../../lib/cx";
import { Chip, FootNote, Prompt } from "../../components/ui";
import ui from "../../components/ui/ui.module.css";
import styles from "./Projects.module.css";

/** Projects: `ls -la ~/projects`. Only online projects link to a page. */
export default function Projects() {
    const online = PROJECTS.filter((project) => project.state === "online").length;
    const dev = PROJECTS.length - online;

    return (
        <div className={styles.page}>
            <section>
                <Prompt as="h1">$ ls -la ~/projects</Prompt>
                <div className={styles.scroller}>
                    <div className={styles.table}>
                        <div className={cx(ui.tableHead, styles.cols)}>
                            <span>STATE</span>
                            <span>SINCE</span>
                            <span>NAME</span>
                            <span>DESCRIPTION</span>
                        </div>
                        {PROJECTS.map((project, index) => {
                            const isDev = project.state === "dev";
                            const className = cx(
                                ui.row,
                                styles.cols,
                                index === PROJECTS.length - 1 && ui.rowLast,
                                project.route && ui.rowLink,
                            );
                            const cells = (
                                <>
                                    <span>{isDev ? <Chip variant="outline">DEV</Chip> : <Chip>ONLINE</Chip>}</span>
                                    <span className={ui.dim}>{project.since}</span>
                                    <span className={ui.bright}>{project.name}/</span>
                                    <span className={cx(ui.cell, isDev && ui.dim)}>
                                        {project.title}
                                        {project.quote && (
                                            <span className={ui.dim}>
                                                {SEP}
                                                {project.quote}
                                            </span>
                                        )}
                                    </span>
                                </>
                            );
                            return project.route ? (
                                <Link
                                    key={project.name}
                                    to={ROUTE_PATHS[project.route]}
                                    className={className}
                                    data-testid="project-row"
                                >
                                    {cells}
                                </Link>
                            ) : (
                                <div key={project.name} className={className} data-testid="project-row">
                                    {cells}
                                </div>
                            );
                        })}
                        <FootNote>
                            {PROJECTS.length} projects · {online} online · {dev} in development
                        </FootNote>
                    </div>
                </div>
            </section>
        </div>
    );
}
