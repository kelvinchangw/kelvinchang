import styles from "./TopFrame.module.css";
import tlRect from "../../../assets/images/tl-rect.png";
import trRect from "../../../assets/images/tr-rect.png";
import horLine from "../../../assets/images/hor-line.png";
import rect from "../../../assets/images/rect.png";
import vbLogo from "../../../assets/images/vb-logo.png";

export default function TopFrame() {
    return (
        <div className={styles.topFrame}>
            <img src={tlRect} className={styles.tlRect} alt="" />
            <img src={horLine} className={styles.horLine} alt="" />
            <img src={rect} className={styles.rect} alt="" />
            <img src={horLine} className={styles.horLine} alt="" />
            <img src={vbLogo} className={styles.vbLogo} alt="" />
            <img src={horLine} className={styles.horLine} alt="" />
            <img src={rect} className={styles.rect} alt="" />
            <img src={horLine} className={styles.horLine} alt="" />
            <img src={trRect} className={styles.trRect} alt="" />
        </div>
    );
}
