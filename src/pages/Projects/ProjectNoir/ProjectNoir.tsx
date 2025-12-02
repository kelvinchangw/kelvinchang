import styles from "./ProjectNoir.module.css";
import noirThumbnail from "../../../assets/images/project-noir-thumbnail.jpg";
import divider from "../../../assets/images/divider.png";

export default function ProjectNoir() {
    return (
        <main className={styles.page}>
            <div className={styles.content}>
                <div className={styles.thumbnailContainer}>
                    <img src={noirThumbnail} className={styles.noirThumbnail} />
                </div>
                <div className={styles.project}>
                    <div className={styles.heading}>
                        <div className={styles.title}>
                            <span>Project NOIR</span>
                            <span>Home server / NAS</span>
                        </div>
                        <span className={styles.status}>ONLINE</span>
                    </div>
                    <img src={divider} alt="" />
                    <div className={styles.writeUp}>
                        <div className={styles.block}>
                            <span className={styles.date}>17/01/2025</span>
                            <div>
                                <p>
                                    I started NOIR as a way to store all of my
                                    data that I had accumulated over the years.
                                    My main PC has a 2TB M.2 SSD and it was
                                    filling up ever so closely to the max. I
                                    dislike when storages are near or at
                                    capacity.
                                </p>
                                <p>
                                    These are the specs of NOIR; you can look at
                                    it more in depth on its{" "}
                                    <a
                                        href="https://pcpartpicker.com/list/zCjRFZ"
                                        target="_blank"
                                    >
                                        pc part picker
                                    </a>
                                    .
                                </p>
                                <ul>
                                    <li>CPU: Intel i5-12400</li>
                                    <li>CPU Cooler: Noctua NH-D15</li>
                                    <li>MOBO: MSI PRO B660M-A</li>
                                    <li>
                                        Memory: TEAMGROUP 2 x 16 GB 3600MHz DDR4
                                    </li>
                                    <li>
                                        Storage: 1 x WD_BLACK 1 TB M.2 SSD, 3 x
                                        Seagate 12 TB HDD
                                    </li>
                                    <li>Case: Fractal Design Meshify 2</li>
                                    <li>PSU: EVGA 650 W 80+ Gold</li>
                                </ul>
                                <p>
                                    I did not need a dedicated GPU for what I
                                    wanted from NOIR so I opted for integrated
                                    Intel CPU graphics.
                                </p>
                                <p>
                                    The build process was somewhat simple, aside
                                    from me not having HDD data sata cables
                                    ready at the time of build. Somehow, it
                                    never occurred to me that a HDD needed a
                                    cable to power it and also another cable to
                                    transmit data...
                                </p>
                                <p>
                                    Post build process, there were two exhaust
                                    fans that were not spinning. Originally I
                                    thought it was a compatibility issue with
                                    the fans' 3 pin headers and Meshify's built
                                    in Nexus+ 2 Fan Hub. Turns out I didn't plug
                                    in the Hub's PWM header into the MOBO...
                                </p>
                                <p>
                                    This was also my first time installing and
                                    working with a Linux based OS (aside from VM
                                    projects in university). TrueNAS feels great
                                    to use.
                                </p>
                                <p>
                                    Currently, I have the following running on
                                    NOIR.
                                </p>
                                <ul>
                                    <li>OS: TrueNAS Scale</li>
                                    <li>Service: NAS storage</li>
                                    <li>App: Home Assistant</li>
                                </ul>
                                <p>
                                    I thought to myself, wow is this really all
                                    I have on there? Yup.
                                </p>
                                <p>
                                    I considered Plex for media streaming, but I
                                    don't watch any shows or movies. Besides
                                    Arcane of course.
                                </p>
                                <p>
                                    The build process was recorded, and I am in
                                    the process of compiling and editing the
                                    footage for YouTube. ;)
                                </p>
                            </div>
                            <span className={styles.date}>19/05/2025</span>
                            <div>
                                <p>I am putting the video on indefinite pause. LOL.</p>
                            </div>
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
