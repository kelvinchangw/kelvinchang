// IMPORTS
import "./style.css";

// Lenis Smooth Scroll
import Lenis from '@studio-freight/lenis';

// GSAP ScrollTrigger
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);


// 
const lenis = new Lenis();

lenis.on('scroll', (e) => {
  console.log(e);
})

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time)=>{
  lenis.raf(time * 1000);
})

gsap.ticker.lagSmoothing(0);