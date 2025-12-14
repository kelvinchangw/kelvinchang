import styles from "./About.module.css";
import divider from "../../assets/images/divider.png";
import pfp from "../../assets/images/pfp.png";

export default function About() {
    return (
        <main className={styles.page}>
            <div className={styles.content}>
                <div className={styles.whoami}>
                    <span className={styles.title}>whoami</span>
                    <img src={divider} className={styles.divider} />
                    <div>
                        <div className={styles.pfpContainer}>
                            <img src={pfp} className={styles.pfp} />
                        </div>
                        <div className={styles.whoamiInfo}>
                            <span>Hi, my name is Kelvin.</span>
                            <span>
                                I do programming and other creative works.
                            </span>
                            <span>
                                Most of my interests revolve around the topics
                                of artificial intelligence, design, metaverse,
                                philosophy, anime, music, and finance.
                            </span>
                        </div>
                    </div>
                </div>
                <div className={styles.history}>
                    <span className={styles.title}>history</span>
                    <img src={divider} className={styles.divider} />
                    <div className={styles.historyInfo}>
                        <span>
                            I am a software engineer with self-taught experience
                            and a Computer Science degree with a focus on
                            Graphic Design.
                        </span>
                        <span>
                            I started coding by building Minecraft plugins and
                            mods as a kid. Now, I work on personal projects that
                            combine engineering and design.
                        </span>
                        <span>
                            I am especially interested in spatial computing and
                            human-ai interaction. Cybernetics and bionics is
                            cool too.
                        </span>
                        <span>
                            When I am not coding, I play tennis or pickleball
                            (socially). I also perform and produce under the
                            name Voidborne.
                        </span>
                        <span>
                            I love hotpot and lamb skewers. And DnB.
                        </span>
                    </div>
                </div>
            </div>
        </main>
    );
}
