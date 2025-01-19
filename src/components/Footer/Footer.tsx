import styles from "./Footer.module.css";
import brRect from "../../assets/images/br-rect.png";

export default function Footer() {
    return (
        <div className={styles.footer}>
            <div className={styles.emailAndSocials}>
                <div className={styles.email}>
                    <span>Contact Me</span>
                    <a href="mailto:kelvinchangw@gmail.com">
                        kelvinchangw@gmail.com
                    </a>
                </div>
                <div className={styles.socials}>
                    <a href="https://www.linkedin.com/in/kelvinchangw/" target="_blank" className={styles.social}>
                        <span>LinkedIn</span>
                        <img src={brRect} className={styles.brRect}/>
                    </a>
                    <a href="https://github.com/kelvinchangw" target="_blank" className={styles.social}>
                        <span>GitHub</span>
                        <img src={brRect} className={styles.brRect}/>
                    </a>
                    <a href="https://www.youtube.com/@kelvin-ai" target="_blank" className={styles.social}>
                        <span>YouTube</span>
                        <img src={brRect} className={styles.brRect}/>
                    </a>
                </div>
            </div>
            <div className={styles.copyrightAndBuiltWith}>
                <div className={styles.copyright}>Kelvin Chang 2025</div>
                <div className={styles.builtWith}>Built with 💜</div>
            </div>
        </div>
    );
}
