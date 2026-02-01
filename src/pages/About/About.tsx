import styles from "./About.module.css";
import divider from "../../assets/images/divider.png";
import pfp from "../../assets/images/pfp.png";

import djTurnItUpCoverArt from "../../assets/images/djturnitup-cover.jpg";
import solarSystemCoverArt from "../../assets/images/solarsystem-cover.jpg";
import cityRuinsCoverArt from "../../assets/images/cityruins-cover.jpg";
import blueCoverArt from "../../assets/images/blue-cover.jpg";
import howSweetCoverArt from "../../assets/images/howsweet-cover.jpg";

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
                            human-ai interaction. Cybernetics and bionics are
                            cool too.
                        </span>
                        <span>
                            When I am not coding, I play tennis (competitive) or
                            pickleball (socially). I also perform and produce
                            under the name Voidborne.
                        </span>
                        <span>
                            I love hotpot, lamb skewers, and DnB. Mmmmmmmmm.
                        </span>
                    </div>
                </div>
                <div className={styles.music}>
                    <span className={styles.title}>music</span>
                    <img src={divider} className={styles.divider} />
                    <div className={styles.musicinfo}>
                        <span>
                            This is a section dedicated to my favorite music.
                            Every song here has impacted me significantly in
                            some way.
                        </span>
                    </div>
                    <div className={styles.songContainer}>
                        <div className={styles.song}>
                            <div className={styles.coverArtContainer}>
                                <img
                                    src={djTurnItUpCoverArt}
                                    className={styles.coverArt}
                                />
                            </div>
                            <span className={styles.songTitle}>
                                Dimension - DJ Turn It Up
                            </span>
                            <span className={styles.songComment}>
                                "Redefined what dance music meant to me"
                            </span>
                        </div>
                        <div className={styles.song}>
                            <div className={styles.coverArtContainer}>
                                <img
                                    src={solarSystemCoverArt}
                                    className={styles.coverArt}
                                />
                            </div>
                            <span className={styles.songTitle}>
                                Sub Focus - Solar System
                            </span>
                            <span className={styles.songComment}>
                                "Started my obsession with the DNB genre"
                            </span>
                        </div>
                        <div className={styles.song}>
                            <div className={styles.coverArtContainer}>
                                <img
                                    src={cityRuinsCoverArt}
                                    className={styles.coverArt}
                                />
                            </div>
                            <span className={styles.songTitle}>
                                Nier OST - City Ruins (Shade)
                            </span>
                            <span className={styles.songComment}>
                                "Influenced my love for ambience and atmosphere"
                            </span>
                        </div>
                        <div className={styles.song}>
                            <div className={styles.coverArtContainer}>
                                <img
                                    src={blueCoverArt}
                                    className={styles.coverArt}
                                />
                            </div>
                            <span className={styles.songTitle}>
                                Yoasobi - Blue
                            </span>
                            <span className={styles.songComment}>
                                "Means something very special to me"
                            </span>
                        </div>
                        <div className={styles.song}>
                            <div className={styles.coverArtContainer}>
                                <img
                                    src={howSweetCoverArt}
                                    className={styles.coverArt}
                                />
                            </div>
                            <span className={styles.songTitle}>
                                NewJeans - How Sweet
                            </span>
                            <span className={styles.songComment}>
                                "Marks a period of heavy nostalgia"
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
