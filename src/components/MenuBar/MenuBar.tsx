import { Link, useLocation } from "react-router-dom";
import styles from "./MenuBar.module.css";

export default function MenuBar() {
    const location = useLocation();
    const isActiveRoute = (path: string) => {
        return location.pathname === path;
    };

    return (
        <div className={styles.menuBarWrapper}>
            <div className={styles.menuBar}>
                <nav className={styles.nav}>
                    <Link to="/" className={`${styles.navLink} ${isActiveRoute('/') ? styles.active : ''}`}>Home</Link>
                    <Link to="/projects" className={`${styles.navLink} ${isActiveRoute('/projects') ? styles.active : ''}`}>Projects</Link>
                    <Link to="/about" className={`${styles.navLink} ${isActiveRoute('/about') ? styles.active : ''}`}>About</Link>
                </nav>
            </div>
        </div>
    );
}