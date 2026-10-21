import { Link } from "react-router-dom";
import { POSTS, ROUTE_PATHS, SEP } from "../../data/site";
import { cx } from "../../lib/cx";
import { entryCountLabel } from "../../lib/log";
import { Chip, FootNote, Prompt } from "../../components/ui";
import ui from "../../components/ui/ui.module.css";
import styles from "./Blog.module.css";

/** Blog: `ls -la ~/blog` plus a `head` preview of the newest post. */
export default function Blog() {
    const newest = POSTS[0];

    return (
        <div className={styles.page}>
            <section>
                <Prompt as="h1">$ ls -la ~/blog</Prompt>
                <div className={styles.scroller}>
                    <div className={styles.table}>
                        <div className={cx(ui.tableHead, styles.cols)}>
                            <span>ID</span>
                            <span>DATE</span>
                            <span>TITLE</span>
                            <span className={ui.right}>LENGTH</span>
                        </div>
                        {POSTS.map((post, index) => (
                            <Link
                                key={post.id}
                                to={ROUTE_PATHS[post.route]}
                                className={cx(ui.row, styles.cols, ui.rowLink, index === POSTS.length - 1 && ui.rowLast)}
                                data-testid="post-row"
                            >
                                <span>
                                    <Chip>{post.id}</Chip>
                                </span>
                                <span className={ui.dim}>{post.date}</span>
                                <span className={ui.cell}>
                                    <span className={ui.bright}>{post.title}</span>
                                    <span className={ui.dim}>
                                        {SEP}
                                        {post.sub}
                                    </span>
                                </span>
                                <span className={cx(ui.right, ui.meta)}>{post.length}</span>
                            </Link>
                        ))}
                        <FootNote>{entryCountLabel(POSTS.length)} · newest first</FootNote>
                    </div>
                </div>
            </section>

            {newest && (
                <section>
                    <Prompt as="h2">$ head -n 3 ~/blog/{newest.id}.md</Prompt>
                    <div className={styles.head}>
                        <span className={ui.bright}># {newest.title}</span>
                        <span className={ui.dim}>## {newest.sub}</span>
                        <span>{newest.body[0]}</span>
                    </div>
                </section>
            )}
        </div>
    );
}
