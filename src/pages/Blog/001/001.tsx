import styles from "./001.module.css";
import post001Thumbnail from "../../../assets/images/post-001-thumbnail.jpg";
import divider from "../../../assets/images/divider.png";

export default function post001() {
    return (
        <main className={styles.page}>
            <div className={styles.content}>
                <div className={styles.thumbnailContainer}>
                    <img src={post001Thumbnail} className={styles.thumbnail} />
                </div>
                <div className={styles.post}>
                    <div className={styles.heading}>
                        <div className={styles.title}>
                            <span>Beginning anew</span>
                            <span>In search of Heaven</span>
                        </div>
                        <span className={styles.postId}>001</span>
                    </div>
                    <img src={divider} alt="" />
                    <div className={styles.writeUp}>
                        <span className={styles.date}>15/12/2025</span>
                        <div>
                            <p>I am exactly where I should be.</p>
                        </div>
                    </div>
                    <img src={divider} alt="" />
                    <div className={styles.authorSection}>
                        <p className={styles.authorName}>Kelvin Chang</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
