import styles from "./Projects.module.css";
import noirThumbnail from "../../assets/images/project-noir-thumbnail.jpg";
import projectAPlaceholder from "../../assets/images/project-a.jpg";
import projectSPlaceholder from "../../assets/images/project-s.jpg";
import projectWPlaceholder from "../../assets/images/project-w.jpeg";
import { Link } from "react-router-dom";

export default function Projects() {
    return (
        <main className={styles.page}>
            <div className={styles.content}>
                <Link
                    to="/projects/project-noir"
                    className={styles.projectLink}
                >
                    <div className={styles.project}>
                        <div className={styles.thumbnailContainer}>
                            <img
                                src={noirThumbnail}
                                className={styles.noirThumbnail}
                            />
                        </div>
                        <div className={styles.info}>
                            <div className={styles.heading}>
                                <div className={styles.title}>
                                    <span>Project NOIR</span>
                                    <span>Home server / NAS</span>
                                </div>
                                <span
                                    className={`${styles.status} ${styles.activeStatus}`}
                                >
                                    ONLINE
                                </span>
                            </div>
                            <p className={styles.description}>
                                "From distance eternal come black wings o'er the
                                land. Feathers fall, bringing ruin."
                            </p>
                        </div>
                    </div>
                </Link>
                <div className={styles.project}>
                    <div className={styles.thumbnailContainer}>
                        <img
                            src={projectAPlaceholder}
                            className={styles.noirThumbnail}
                        />
                    </div>
                    <div className={styles.info}>
                        <div className={styles.heading}>
                            <div className={styles.title}>
                                <span>Project A</span>
                                <span>[REDACTED]</span>
                            </div>
                            <span
                                className={`${styles.status} ${styles.devStatus}`}
                            >
                                DEV
                            </span>
                        </div>
                        {/* <div className={styles.description}></div> */}
                    </div>
                </div>
                <div className={styles.project}>
                    <div className={styles.thumbnailContainer}>
                        <img
                            src={projectSPlaceholder}
                            className={styles.noirThumbnail}
                        />
                    </div>
                    <div className={styles.info}>
                        <div className={styles.heading}>
                            <div className={styles.title}>
                                <span>Project S</span>
                                <span>[REDACTED]</span>
                            </div>
                            <span
                                className={`${styles.status} ${styles.devStatus}`}
                            >
                                DEV
                            </span>
                        </div>
                        <p className={styles.description}>
                            "We deemed this to be the fastest and most optimal
                            way of doing things."
                        </p>
                    </div>
                </div>
                <div className={styles.project}>
                    <div className={styles.thumbnailContainer}>
                        <img
                            src={projectWPlaceholder}
                            className={styles.noirThumbnail}
                        />
                    </div>
                    <div className={styles.info}>
                        <div className={styles.heading}>
                            <div className={styles.title}>
                                <span>Project W</span>
                                <span>[REDACTED]</span>
                            </div>
                            <span
                                className={`${styles.status} ${styles.devStatus}`}
                            >
                                DEV
                            </span>
                        </div>
                        <p className={styles.description}>
                            "Only white wings may silence its echoes of
                            arrival."
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
