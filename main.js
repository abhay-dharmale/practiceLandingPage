import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import gsap from "gsap";

//postprocessing
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass";

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

const canvas = document.querySelector("canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

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
let amongUsModel;
let loadingHead = document.querySelector("h1");

loader.load(
  "/among_us.glb",
  (gltf) => {
    amongUsModel = gltf.scene;
    scene.add(amongUsModel);

    const box = new THREE.Box3().setFromObject(amongUsModel);
    const center = box.getCenter(new THREE.Vector3());
    amongUsModel.position.sub(center);

    amongUsModel.position.set(0, -0.7, 0);
    amongUsModel.scale.set(1, 1, 1);
  },
  // (progress) => {
  //   const percentage = Math.floor((progress.loaded / progress.total) * 100);
  //   // console.log(`Loading model... ${percentage}%`);
  //   loadingHead.textContent = `${percentage}%`;

  //   if (percentage === 100) {
  //     loadingHead.textContent = "";
  //   }
  // },
  (error) => {
    console.error("An error occurred while loading the model:", error);
  }
);
window.addEventListener("mousemove", (e) => {
  if (amongUsModel) {
    const rotationX = (e.clientX / window.innerWidth - 0.5) * (Math.PI * 0.4);
    const rotationY = (e.clientY / window.innerHeight - 0.5) * (Math.PI * 0.1);

    gsap.to(amongUsModel.rotation, {
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
