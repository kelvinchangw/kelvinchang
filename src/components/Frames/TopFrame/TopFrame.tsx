import styles from "./TopFrame.module.css";
import tlRect from "../../../assets/images/tl-rect.png";
import trRect from "../../../assets/images/tr-rect.png";
import horLine from "../../../assets/images/hor-line.png";
import rect from "../../../assets/images/rect.png";
import vbLogo from "../../../assets/images/vb-logo.png";

export default function TopFrame() {
    return (
        <div className={styles.topFrame}>
            <img src={tlRect} alt="" />
            <img src={horLine} alt="" />
            <img src={rect} alt="" />
            <img src={horLine} alt="" />
            <img src={vbLogo} alt="" />
            <img src={horLine} alt="" />
            <img src={rect} alt="" />
            <img src={horLine} alt="" />
            <img src={trRect} alt="" />
        </div>
    );
}
