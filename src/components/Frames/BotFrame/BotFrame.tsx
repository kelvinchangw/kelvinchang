import styles from "./BotFrame.module.css";
import blRect from "../../../assets/images/bl-rect.png";
import brRect from "../../../assets/images/br-rect.png";
import horLine from "../../../assets/images/hor-line.png";
import rect from "../../../assets/images/rect.png";

export default function BotFrame() {
    return (
        <div className={styles.botFrame}>
            <img src={blRect} alt="" />
            <img src={horLine} alt="" />
            <img src={horLine} alt="" />
            <img src={rect} alt="" />
            <img src={rect} alt="" />
            <img src={rect} alt="" />
            <img src={horLine} alt="" />
            <img src={horLine} alt="" />
            <img src={brRect} alt="" />
        </div>
    );
}
