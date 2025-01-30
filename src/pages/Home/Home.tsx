import styles from "./Home.module.css";
import landingPageImg from "../../assets/images/landing-page-img.jpg";

export default function Home() {
    return (
        <main className={styles.content}>
            <div className={styles.quoteContainer}>
                <span>
                    Did you enjoy your time here? Or maybe not? Well, it doesn't
                    really matter. Though I'm sure you realize that by now.
                </span>
            </div>
            <div className={styles.imgContainer}>
                <img src={landingPageImg} className={styles.landingPageImg} />
            </div>
            <div className={styles.quoteContainer}>
                <span>
                    This place is but a mirror that reflects one's true self
                    back at them.
                </span>
            </div>
        </main>
    );
}
