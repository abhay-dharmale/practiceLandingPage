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
document.querySelector(".loaderHeading").textContent = "";

loaderHeadingArray[0].forEach((element) => {
  let span = document.createElement("span");
  span.textContent = element;
  document.querySelector(".loaderHeading").appendChild(span);
});

function animateLoaderOut() {
  const tl = gsap.timeline();

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
          // Remove scroll lock after loader is hidden
          document.body.classList.remove("scroll-lock");
        },
      },
      "-=0.2"
    );

  // Subtle bg color transition
  tl.fromTo(
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
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/shanghai_bund_2k.hdr",
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    // scene.background = texture;
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

  // slight delay before starting the exit animation
  setTimeout(animateLoaderOut, 900);
});

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
