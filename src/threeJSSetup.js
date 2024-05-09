// threeJSSetup.js

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// Function to calculate the correct aspect ratio accounting for scrollbar width
function getAspectRatio() {
    const scrollbarWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scrollbar-width'));
    return (window.innerWidth - scrollbarWidth) / window.innerHeight;
}

// Function to set renderer size accounting for scrollbar width
function setRendererSize(renderer) {
    const scrollbarWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scrollbar-width'));
    renderer.setSize(window.innerWidth - scrollbarWidth, window.innerHeight);
}

export const setupThreeJS = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, getAspectRatio(), 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    setRendererSize(renderer); // Set initial renderer size
    renderer.toneMapping = THREE.ReinhardToneMapping;
    document.querySelector("#canvas-container").appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.z = 40;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enableZoom = false; // Disabling zoom functionality
    controls.enablePan = false;
    controls.rotateSpeed = 0.3;

    const loader = new GLTFLoader();
    loader.load("/assets/a_windy_day/scene.gltf", (gltf) => {
        const model = gltf.scene;
        scene.add(model);
        model.scale.set(20, 20, 20);
        model.position.set(0, -10, 0);

        model.traverse((child) => {
            if (child.isMesh) {
                child.material.transparent = true;
                child.material.alphaTest = 0.5;
            }
        });

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        controls.target.copy(center);

        const mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.setLoop(THREE.LoopRepeat);
            action.play();
        });

        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,
            0.4,
            0.85
        );
        bloomPass.threshold = 0.1; // Set bloom threshold
        bloomPass.strength = 6; // Set bloom strength
        bloomPass.radius = 0.8; // Set bloom radius
        composer.addPass(bloomPass);

        renderer.setAnimationLoop(() => {
            renderer.clear();
            controls.update();
            model.rotation.y += 0.0005; // This line makes the model rotate normally when idle
            composer.render();
        });
    });

    window.addEventListener('resize', () => {
        camera.aspect = getAspectRatio();
        camera.updateProjectionMatrix();
        setRendererSize(renderer);
    }, false);
};
