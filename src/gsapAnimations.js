// gsapAnimations.js

import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const setupGSAPAnimations = () => {
    const lenis = new Lenis({
        duration: 1.2,
        wheelMultiplier: 1,
    });

    lenis.scrollTo(0, {
        duration: 0.001,
        onComplete: () => {
            lenis.stop();  // Stops Lenis right after scrolling to the top
        }
    });

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll(".nav-link").forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = this.getAttribute("href");
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - 200;
                lenis.scrollTo(targetPosition);
            }
        });
    });

    const rootStyle = getComputedStyle(document.documentElement);
    const purpleColor = rootStyle.getPropertyValue('--clr-purple').trim();

    const loadingBars = document.querySelectorAll(".loading-bar");
    let tl = gsap.timeline();
    tl.fromTo(loadingBars, { scaleY: 0, height: "0%", transformOrigin: "top center" }, { scaleY: 1, height: "100%", duration: 1, ease: "power3.inOut" });
    tl.fromTo(loadingBars, { boxShadow: "0 0 0px 0" }, { boxShadow: `0 0 32px 2px ${purpleColor}`, duration: 0.8, ease: "power3.inOut" }, ">");

    const loadingScreen = document.querySelector(".loading-screen");
    tl.fromTo(loadingScreen, { opacity: 1 }, {
        opacity: 0,
        duration: 1,
        ease: "power3.inOut",
        userSelect: "none",
        onComplete: () => {
            loadingScreen.remove();
            lenis.start();
        },
    }, ">0.6");

    const content = document.querySelector("#content");
    tl.fromTo(content,
        {
            opacity: 0,
        },
        {
            opacity: 1,
            duration: 1,
        },
        ">-0.4"
    );

    gsap.to("header", {
        scrollTrigger: {
            trigger: "header",
            start: "top top",
            end: "bottom top",
            scrub: true,
        },
        paddingTop: "1rem",
        paddingBottom: "1rem",
        backgroundColor: "rgba(16, 16, 16, 0.90)",
        duration: 1,
        ease: "power3.inOut"
    });
};
