import { useLocation } from "react-router-dom";
import { BackLink, Prompt } from "../../components/ui";
import { cx } from "../../lib/cx";
import ui from "../../components/ui/ui.module.css";
import styles from "./NotFound.module.css";

/** Unknown route: the shell's version of a 404. */
export default function NotFound() {
    const { pathname } = useLocation();
    const file = `~${pathname}`;

    return (
        <div className={ui.readingPage}>
            <div className={ui.headerRow}>
                <Prompt as="h1" className={styles.file}>
                    $ cat {file}
                </Prompt>
                <BackLink to="/">← ~/</BackLink>
            </div>
            <div className={cx(ui.dim, styles.file)}>cat: {file}: no such file or directory</div>
        </div>
    );
}
