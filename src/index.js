// IMPORTS
import "./style.css";

// Lenis Smooth Scroll
import Lenis from "@studio-freight/lenis";

// Free version of GSAP's Scramble Text like text shuffle effect
// https://www.npmjs.com/package/scramble-text
import ScrambleText from "scramble-text";

// GSAP ScrollTrigger
import { gsap } from "gsap";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrollToPlugin);

// Lenis + GSAP ScrollTrigger
const lenis = new Lenis({
    duration: 1.2,
    wheelMultiplier: 1,
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

// Scroll to top on page load
window.addEventListener("load", () => {
    lenis.scrollTo(0);
});

// Replaces introTitle (which is an empty space) with "Hello, I am Kelvin."
const introTitle = document.querySelector(".intro-title");
const introText = document.querySelector(".intro-text");

const introSection = document.querySelector("#intro");
const aboutSection = document.querySelector("#about");

gsap.to(introTitle, {
    duration: 1.2,
    text: {
        value: "Hello, I am Kelvin.",
    },
    ease: "none",
});

// gsap.to(introText, {
//     delay: 1.2,
//     duration: 1.2,
//     text: {
//         value: "I create things sometimes.",
//     },
//     ease: "none",
// });

gsap.to(introText, {
    text: {
        value: "I create things sometimes.",
    },
    scrollTrigger: {
        trigger: introSection,
        start: "1", // When the top of the trigger hits the top of the viewport
        endTrigger: aboutSection, // Element that marks the end of the scrolling effect
        end: "top bottom", // When the bottom of the endTrigger hits the top of the viewport
        scrub: true, // Bind the animation progress to the scroll progress
        markers: true, // Shows markers for debugging purposes
    },
});

gsap.to(introTitle, {
    // Must use hex code, if using "wheat", the duration will be ignored
    color: "#EE82EE",
    ease: "none", // Type of easing (none for a linear movement)
    scrollTrigger: {
        trigger: introSection,
        start: "1", // When the top of the trigger hits the top of the viewport
        endTrigger: aboutSection, // Element that marks the end of the scrolling effect
        end: "top bottom", // When the bottom of the endTrigger hits the top of the viewport
        pin: true, // Pin the trigger element
        scrub: true, // Bind the animation progress to the scroll progress
        markers: true, // Shows markers for debugging purposes
    },
});

document.querySelectorAll(".nav-link").forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        lenis.scrollTo(this.getAttribute("href"));
    });
});

// PROJECTS TITLE ZOOM GRADIENT EFFECT
// const projectsSection = document.querySelector("#projects");
// const projectsTitle = document.querySelector(".projects-title");
// const projectsTitleOverlay = document.querySelector(".projects-title-overlay");
// const contactSection = document.querySelector("#contact");
// const copyrightSection = document.querySelector("#copyright");

// // Create a GSAP timeline with scrollTrigger
// const projectsTitleAnimation = gsap.timeline({
//     scrollTrigger: {
//         trigger: projectsSection,
//         start: "top top",
//         endTrigger: contactSection,
//         end: "top bottom",
//         pin: true,
//         scrub: true,
//         markers: true,
//     }
// });

// // Add animation for projectsTitle to the timeline
// projectsTitleAnimation.to(projectsTitle, {
//     scale: 4,
//     opacity: 0,
//     ease: "none",
// });

// // Add animation for projectsTitleOverlay to the timeline
// projectsTitleAnimation.to(projectsTitleOverlay, {
//     scale: 4,
//     opacity: 1, // Ensure this is set to 1 to become fully visible at the end
//     ease: "none",
// }, "<"); // Use "<" to start this animation at the same time as the previous one


// gsap.to(projectsTitle, {
//     , // Adjust the value to control how far it slides
//     opacity: 1,
//     ease: "none", // Type of easing (none for a linear movement)
//     scrollTrigger: {
//         trigger: contactSection,
//         start: "top bottom", // When the top of the trigger hits the top of the viewport
//         endTrigger: , // Element that marks the end of the scrolling effect
//         end: "top bottom", // When the bottom of the endTrigger hits the top of the viewport
//         pin: true, // Pin the trigger element
//         scrub: true, // Bind the animation progress to the scroll progress
//         markers: true, // Shows markers for debugging purposes
//     },
// });
