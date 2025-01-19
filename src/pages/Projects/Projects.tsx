import styles from "./Projects.module.css";
import noirThumbnail from "../../assets/images/project-noir-thumbnail.png";
import projectPlaceholder from "../../assets/images/project-placeholder.png";
import TopFrame from "../../components/Frames/TopFrame/TopFrame";
import BotFrame from "../../components/Frames/BotFrame/BotFrame";
import { Link } from "react-router-dom";

export default function Projects() {
    return (
        <main className={styles.page}>
            <TopFrame />
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
                            <div className={styles.description}>
                                "From distance eternal come black wings o'er the
                                land. Feathers fall, bringing ruin. Only white
                                wings may silence its echoes of arrival."
                            </div>
                        </div>
                    </div>
                </Link>
                <div className={styles.project}>
                    <div className={styles.thumbnailContainer}>
                        <img
                            src={projectPlaceholder}
                            className={styles.noirThumbnail}
                        />
                    </div>
                    <div className={styles.info}>
                        <div className={styles.heading}>
                            <div className={styles.title}>
                                <span>[REDACTED]</span>
                                <span>[REDACTED]</span>
                            </div>
                            <span
                                className={`${styles.status} ${styles.devStatus}`}
                            >
                                DEV
                            </span>
                        </div>
                        <div className={styles.description}></div>
                    </div>
                </div>
            </div>
            <BotFrame />
        </main>
    );
}
