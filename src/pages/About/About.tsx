import { HISTORY_LINES, WHOAMI_LINES } from "../../data/site";
import { Prompt } from "../../components/ui";
import ui from "../../components/ui/ui.module.css";
import styles from "./About.module.css";

/** About: whoami and history. (The music section is not finalized yet and is intentionally omitted.) */
export default function About() {
    return (
        <div className={styles.page}>
            <section>
                <Prompt as="h1">$ cat ~/about/whoami</Prompt>
                <div className={styles.whoami}>
                    {WHOAMI_LINES.map((line, index) => (
                        <p key={line} className={index === 0 ? ui.bright : undefined}>
                            {line}
                        </p>
                    ))}
                </div>
            </section>

            <section>
                <Prompt as="h2">$ cat ~/about/history</Prompt>
                <div className={styles.history}>
                    {HISTORY_LINES.map((line) => (
                        <p key={line}>{line}</p>
                    ))}
                </div>
            </section>
        </div>
    );
}
