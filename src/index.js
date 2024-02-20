// IMPORTS
import "./style.css";

// Lenis Smooth Scroll
import Lenis from "@studio-freight/lenis";

// GSAP ScrollTrigger
import { gsap } from "gsap";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrollToPlugin);

// Lenis + GSAP ScrollTrigger
const lenis = new Lenis({
    duration: 1.2,
    wheelMultiplier: 2,
});

lenis.on("scroll", (e) => {
    console.log(e);
});

lenis.on("scroll", ScrollTrigger.update);

// lenis.on("scroll", ScrollTrigger.refresh);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Replaces introTitle (which is an empty space) with "Hello, I am Kelvin."
const introTitle = document.querySelector(".intro-title");

const introLink = document.querySelector(".nav-link.intro");

// introLink.addEventListener("click", () => {
//     lenis.scrollTo("#intro");
// });

// DYNAMIC UPDATES OF STUFF BELOW
// https://gsap.com/community/forums/topic/37417-disabling-scrolltrigger-onleave-and-re-enabling-onleaveback/

// ScrollTrigger.create({
//     trigger: introTitle,
//     start: "top 46%", // Trigger point
//     end: "top top", // Define an end point to ensure onLeaveBack is called
//     markers: true, // For debugging, remove in production
//     toggleActions: "play none none none", // Adjust if needed
//     onEnter: () => updateText("Hello, I am Kelvin."), // Text for scrolling down through 50%
//     onLeaveBack: () => updateText("KELVIN KELVIN KELVIN"), // Text for scrolling back up through 50%
//     // Optional: Adjust based on your needs
//     onEnterBack: () => updateText("Original Text"),
//     onLeave: () => updateText("Another Text"),
// });

// // Function to update text
// function updateText(newText) {
//     gsap.to(introTitle, {
//         duration: 2,
//         text: { value: newText },
//         ease: "none", // Customize the easing if needed
//     });
// }

// // Scroll to top on page load
// window.addEventListener("load", () => {
//     lenis.scrollTo(0);
// });

gsap.to(introTitle, {
    duration: 2,
    text: {
        value: "Hello, I am Kelvin.",
    },
    ease: "none",
});

document.querySelectorAll('.nav-link').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        lenis.scrollTo(this.getAttribute("href"));
    });
});
