import { CONTACT, SITE } from "../../data/site";
import styles from "./Footer.module.css";

export default function Footer({ year = new Date().getFullYear() }: { year?: number }) {
    return (
        <footer className={styles.footer}>
            <div className={styles.links}>
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                <a href={CONTACT.linkedin} target="_blank" rel="noreferrer">
                    linkedin
                </a>
                <a href={CONTACT.github} target="_blank" rel="noreferrer">
                    github
                </a>
                <a href={CONTACT.youtube} target="_blank" rel="noreferrer">
                    youtube
                </a>
            </div>
            <span>
                © {year} {SITE.owner} · built with 💜
            </span>
        </footer>
    );
}
