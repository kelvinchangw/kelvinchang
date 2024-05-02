// IMPORTS
import "./style.css"; // Import CSS file
import * as THREE from "three"; // Import the Three.js library
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"; // Import GLTFLoader for loading 3D models
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"; // Import OrbitControls for camera movement
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"; // Import EffectComposer for post-processing effects
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"; // Import RenderPass for rendering passes
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js"; // Import UnrealBloomPass for bloom effect

// Setup the scene, camera, and renderer
const scene = new THREE.Scene(); // Create a new Three.js scene
const camera = new THREE.PerspectiveCamera(75, getAspectRatio(), 0.1, 1000); // Create a perspective camera

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Create a WebGL renderer with antialiasing and alpha transparency
scene.background = null;
setRendererSize(); // Set initial renderer size
renderer.toneMapping = THREE.ReinhardToneMapping; // Set tone mapping for renderer
document.body.appendChild(renderer.domElement); // Append renderer canvas element to document body

// Function to calculate the correct aspect ratio accounting for scrollbar width
function getAspectRatio() {
    const scrollbarWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scrollbar-width'));
    return (window.innerWidth - scrollbarWidth) / window.innerHeight;
}

// Function to set renderer size accounting for scrollbar width
function setRendererSize() {
    const scrollbarWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scrollbar-width'));
    renderer.setSize(window.innerWidth - scrollbarWidth, window.innerHeight);
}

// Responsive canvas resizing
function onWindowResize() {
    camera.aspect = getAspectRatio(); // Update camera aspect ratio
    camera.updateProjectionMatrix(); // Update the projection matrix
    setRendererSize(); // Update renderer size
}
window.addEventListener('resize', onWindowResize, false); // Add resize event listener

// Add dynamic lighting
const ambientLight = new THREE.AmbientLight(0x404040, 2); // Create ambient light with soft white color and intensity 2
scene.add(ambientLight); // Add ambient light to the scene

const pointLight = new THREE.PointLight(0xffffff, 1, 100); // Create a point light with white color, intensity 1, and distance 100
pointLight.position.set(10, 10, 10); // Set position of point light
scene.add(pointLight); // Add point light to the scene

// Initialize the GLTF loader
const loader = new GLTFLoader(); // Create a GLTF loader instance
let model, mixer; // Initialize variables to hold model and animation mixer reference

loader.load(
    "./assets/a_windy_day/scene.gltf", // Path to the GLTF model file
    function (gltf) { // called when the resource is loaded
        model = gltf.scene; // Get the loaded 3D model scene
        scene.add(model); // Add the model to the scene
        model.scale.set(20, 20, 20); // Scale the model down
        model.position.set(0, -10, 0); // Adjust the position as needed

        model.traverse((child) => { // Traverse through all child objects of the model
            if (child.isMesh) { // Check if the child is a mesh
                child.material.transparent = true; // Make the material transparent
                child.material.alphaTest = 0.5; // Set alpha test value
            }
        });

        const box = new THREE.Box3().setFromObject(model); // Create bounding box from the model
        const center = box.getCenter(new THREE.Vector3()); // Get center of the bounding box

        controls.target.copy(center); // Set control target

        mixer = new THREE.AnimationMixer(model); // Create an animation mixer for the model
        gltf.animations.forEach((clip) => { // Iterate over all animations in the GLTF file
            const action = mixer.clipAction(clip); // Create an action for each animation clip
            action.setLoop(THREE.LoopRepeat); // Set looping for the animation
            action.play(); // Start playing the animation
        });

        const composer = new EffectComposer(renderer); // Create an instance of EffectComposer
        composer.addPass(new RenderPass(scene, camera)); // Add RenderPass to composer

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight), // Pass render size to bloom pass
            1.5, // Strength
            0.4, // Kernel size
            0.85 // Sigma
        );
        bloomPass.threshold = 0.1; // Set bloom threshold
        bloomPass.strength = 6; // Set bloom strength
        bloomPass.radius = 1; // Set bloom radius
        composer.addPass(bloomPass); // Add bloom pass to composer

        renderer.setAnimationLoop(() => {
            renderer.clear();
            controls.update();
            model.rotation.y += 0.0005;
            composer.render();
        });
    },
    function (xhr) { // called while loading is progressing
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    function (error) { // called when loading has errors
        console.error("An error happened", error);
    }
);

const controls = new OrbitControls(camera, renderer.domElement); // Create OrbitControls instance
camera.position.z = 50; // Set camera position
controls.enableDamping = true; // Enable damping for smoother camera movement
controls.dampingFactor = 0.1; // Set damping factor

// GSAP and Lenis for smooth scrolling and animations
import Lenis from "@studio-freight/lenis";
import ScrambleText from "scramble-text";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrollToPlugin);

const lenis = new Lenis({
    duration: 1.2,
    wheelMultiplier: 1,
});

lenis.on("scroll", (e) => {
    console.log(e);
});

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

const introSection = document.querySelector("#intro");
const aboutSection = document.querySelector("#about");

document.querySelectorAll(".nav-link").forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        lenis.scrollTo(this.getAttribute("href"));
    });
});

const loadingBars = document.querySelectorAll(".loading-bar");
let tl = gsap.timeline();

tl.fromTo(
    loadingBars,
    { scaleY: 0, height: "0%", transformOrigin: "top center" },
    { scaleY: 1, height: "100%", duration: 1, ease: "power3.inOut" }
);

tl.fromTo(
    loadingBars,
    { boxShadow: "0 0 0px 0 violet" },
    { boxShadow: "0 0 18px 0 violet", duration: 0.8, ease: "power3.inOut" },
    ">" // No additional delay, starts immediately after the previous one
);

const loadingScreen = document.querySelector(".loading-screen");

tl.fromTo(
    loadingScreen,
    {
        opacity: 1,
    },
    {
        opacity: 0,
        duration: 1,
        ease: "power3.inOut",
        userSelect: "none",
        onComplete: () => {
            loadingScreen.remove();
        },
    },
    ">0.6"
);