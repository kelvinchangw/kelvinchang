import styles from "./Blog.module.css";
import { Link } from "react-router-dom";

export default function Blog() {
    return (
        <main className={styles.page}>
            <div className={styles.content}>
                <Link to={"/blog/001"} className={styles.postLink}>
                    <div className={styles.post}>
                        <div>
                            <span className={styles.postId}>001</span>
                            <span className={styles.postTitle}>
                                Beginning anew
                            </span>
                        </div>
                        <span className={styles.postDate}>2025/12/15</span>
                    </div>
                </Link>
            </div>
        </main>
    );
}
