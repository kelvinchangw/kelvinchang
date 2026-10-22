import { memo } from "react";
import { cx } from "../../lib/cx";
import styles from "./CrtMonitor.module.css";

export interface CrtMonitorProps {
    /** Portrait image URL. */
    src: string;
    caption?: string;
    /** Continuous CRT animation and the power-on sequence. */
    motion?: boolean;
    className?: string;
}

/**
 * The animated CRT portrait in the rail: a stack of blended layers over one image
 * (vertical-hold roll, glitch slices, chroma split, tint, scanlines, grain, flicker, glass).
 */
function CrtMonitorBase({ src, caption, motion = true, className }: CrtMonitorProps) {
    const image = { backgroundImage: `url(${src})` };

    return (
        <div
            className={cx(styles.monitor, !motion && styles.still, className)}
            role="img"
            aria-label="Portrait of Kelvin on a CRT monitor"
            data-testid="crt-monitor"
            data-motion={motion ? "on" : "off"}
        >
            <div className={cx(styles.layer, styles.image, styles.base)} style={image} />
            <div className={cx(styles.layer, styles.image, styles.glitch1)} style={image} />
            <div className={cx(styles.layer, styles.image, styles.glitch2)} style={image} />
            <div className={cx(styles.layer, styles.image, styles.splitA)} style={image} />
            <div className={cx(styles.layer, styles.image, styles.splitB)} style={image} />
            <div className={cx(styles.layer, styles.tint)} />
            <div className={cx(styles.layer, styles.scanlines)} />
            <div className={cx(styles.layer, styles.grain)} />
            <div className={cx(styles.layer, styles.flicker)} />
            <div className={cx(styles.layer, styles.glass)} />
            {motion && (
                <>
                    <div className={cx(styles.layer, styles.shutterTop)} data-testid="crt-shutter" />
                    <div className={cx(styles.layer, styles.shutterBottom)} data-testid="crt-shutter" />
                </>
            )}
            {caption && <div className={styles.caption}>{caption}</div>}
        </div>
    );
}

const CrtMonitor = memo(CrtMonitorBase);
export default CrtMonitor;
