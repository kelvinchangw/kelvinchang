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
const lenis = new Lenis();

lenis.on("scroll", (e) => {
    console.log(e);
});

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Replaces introTitle (which is an empty space) with "Hello, I am Kelvin."
const introTitle = document.querySelector(".intro-title");
gsap.to(introTitle, {
    scrollTrigger: introTitle,
    duration: 1.6,
    text: {
        value: "Hello, I am Kelvin.",
    },
    ease: "none",
});

// Scroll to top on page load
window.addEventListener("load", () => {
    gsap.to(window, { duration: 0.6, scrollTo: 0, ease: "expo.inOut" });
});