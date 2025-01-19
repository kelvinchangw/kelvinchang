import styles from "./Header.module.css";
import logoImg from "../../assets/images/kc-logo.png";
import status from "../../assets/images/system-status.png";

export default function Header() {
    return (
        <div className={styles.header}>
            <div className={styles.logoContainer}>
                <img src={logoImg} className={styles.logoImg} alt="Logo" />
            </div>
            <div className={styles.systemStatus}>
                <span>STATUS</span>
                <img src={status} className={styles.status} alt="System status" />
            </div>
        </div>
    );
}