import styles from "./Home.module.css";
import landingPageImg from "../../assets/images/landing-page-img.jpg";

export default function Home() {
    return (
        <main className={styles.content}>
            <div className={styles.quoteContainer}>
                <span>I could be yours, you could be mine</span>
            </div>
            <div className={styles.imgContainer}>
                <img src={landingPageImg} className={styles.landingPageImg} />
            </div>
            <div className={styles.quoteContainer}>
                <span>We could be once in a lifetime</span>
            </div>
        </main>
    );
}
