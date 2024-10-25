document.body.classList.add("scroll-lock");

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import gsap from "gsap";

//postprocessing
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass";

// let loaderHeadingArray = [["A", "M", "O", "N", "G", "-", "U", "S"]];
let loaderHeadingArray = [["W", "A", "L", "L", "-", "E"]];
const loaderHeading = document.querySelector(".loaderHeading");
loaderHeading.textContent = "";

// Create spans for each letter
loaderHeadingArray[0].forEach((element) => {
  let span = document.createElement("span");
  span.textContent = element;
  loaderHeading.appendChild(span);
});

// Add loading/glitch effect
function glitchEffect() {
  const spans = document.querySelectorAll(".loaderHeading span");
  spans.forEach((span, index) => {
    gsap.to(span, {
      y: gsap.utils.random(-2, 2),
      opacity: gsap.utils.random(0.7, 1),
      filter: `blur(${gsap.utils.random(0, 2)}px)`,
      duration: 0.2,
      repeat: -1,
      yoyo: true,
      ease: "none",
      delay: index * 0.05,
    });
  });
}

function animateLoaderOut() {
  const tl = gsap.timeline();

  // Kill glitch animations before exit animation
  gsap.killTweensOf(".loaderHeading span");

  // Letter animation
  tl.to(".loaderHeading span", {
    y: -30,
    opacity: 0,
    filter: "blur(5px)",
    stagger: {
      each: 0.08,
      from: "center",
    },
    duration: 0.4,
    ease: "power2.out",
  })
    // Loader smooth exit
    .to(
      ".loader",
      {
        y: "-100%",
        duration: 1.4,
        ease: "expo.inOut",
        onComplete: () => {
          document.querySelector(".loader").style.display = "none";
          document.body.classList.remove("scroll-lock");
        },
      },
      "-=0.2"
    )
    // Subtle bg color transition
    .fromTo(
      ".loader",
      {
        backgroundColor: "black",
      },
      {
        backgroundColor: "#0a0a0a",
        duration: 0.8,
      },
      "<"
    );
}

// Start the glitch effect immediately
glitchEffect();

// menu

const mobileMenuButton = document.getElementById("mobile-menu-button");
const mobileMenu = document.getElementById("mobile-menu");

function closeMenu() {
  gsap.to(mobileMenu, {
    x: "100%",
    opacity: 0,
    duration: 0.5,
    ease: "power2.inOut",
  });
  document.body.classList.remove("overflow-hidden");
}

mobileMenuButton.addEventListener("click", () => {
  gsap.to(mobileMenu, {
    x: "0%",
    opacity: 1,
    duration: 0.5,
    ease: "power2.inOut",
  });
  document.body.classList.toggle("overflow-hidden");
});

// GSAP animation for the loader and navbar items
window.onload = () => {
  gsap.to(".loaderHeading", {
    duration: 1,
    opacity: 0,
    y: -50,
    ease: "power2.inOut",
    onComplete: () => {
      document.querySelector(".loader").style.display = "none";
    },
  });

  gsap.from(".walle-text", {
    duration: 1,
    y: 50,
    opacity: 0,
    ease: "power2.out",
    delay: 0.5,
  });

  gsap.from("nav a", {
    duration: 0.6,
    y: -20,
    opacity: 0,
    stagger: 0.2,
    ease: "power2.out",
    delay: 1,
  });
};

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 3;

const canvas = document.getElementById("canvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.5, // strength
  0.8, // radius
  0.4 // threshold
);
composer.addPass(bloomPass);

const filmPass = new FilmPass(0.55, 0.25, 648, false);
composer.addPass(filmPass);

//hdr loader
let modelLoaded = false;
let textureLoaded = false;

//hdr loader
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/shanghai_bund_2k.hdr",
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    textureLoaded = true;
    checkAllAssetsLoaded();
  }
);

//model loader
const loader = new GLTFLoader();
let model;

loader.load("/walle.glb", (gltf) => {
  model = gltf.scene;
  scene.add(model);

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);

  model.position.set(0, -0.4, 0);
  model.scale.set(1, 1, 1);

  modelLoaded = true;
  checkAllAssetsLoaded();
});

function checkAllAssetsLoaded() {
  if (modelLoaded && textureLoaded) {
    // Add a small delay to ensure everything is rendered properly
    setTimeout(animateLoaderOut, 500);
  }
}

window.addEventListener("mousemove", (e) => {
  if (model) {
    const rotationX = (e.clientX / window.innerWidth - 0.5) * (Math.PI * 0.4);
    const rotationY = (e.clientY / window.innerHeight - 0.5) * (Math.PI * 0.1);

    gsap.to(model.rotation, {
      x: rotationY,
      y: rotationX,
      duration: 0.9,
      ease: "power4.out",
    });
  }
});

// Animation loop
(function animate() {
  requestAnimationFrame(animate);
  composer.render();
})();

// Handle window resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
