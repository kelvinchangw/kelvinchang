import "./style.css";
import { gsap } from "gsap";

// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", () => {
    // GSAP fade-in animation for the .content element
    gsap.to(
        ".content",
        {
            opacity: 1, // End at opacity 1
            duration: 2, // Duration of the animation (3 seconds)
            ease: "power4.out", // Easing for a smoother transition
        }
    );
});
