import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const canvas = document.querySelector('canvas')
const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Add smooth damping effect
controls.dampingFactor = 0.05;

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(-5, 3, -5);
scene.add(pointLight);

// Load Among Us model
const loader = new GLTFLoader();
let amongUsModel;
let loadingHead = document.querySelector('h1')

// loader.load(
//     '/among_us.glb', // Adjust the path if necessary
//     (gltf) => {
//         amongUsModel = gltf.scene;
//         scene.add(amongUsModel);
        
//         // Center the model's origin
//         const box = new THREE.Box3().setFromObject(amongUsModel);
//         const center = box.getCenter(new THREE.Vector3());
//         amongUsModel.position.sub(center);

//         // Adjust model position and scale if needed
//         amongUsModel.position.set(0, 0, 0);
//         amongUsModel.scale.set(1, 1, 1);
//     },
//     (progress) => {
//         console.log(`Loading model... ${Math.floor((progress.loaded / progress.total * 100))}%`);
//         loadingHead.textContent = Math.floor((progress.loaded / progress.total * 100))
//         if(progress.loaded){
//           loadingHead.textContent = ''
//         }
//     },
//     (error) => {
//         console.error('An error occurred while loading the model:', error);
//     }
// );

loader.load(
  '/among_us.glb',
  (gltf) => {
      amongUsModel = gltf.scene;
      scene.add(amongUsModel);
      
      const box = new THREE.Box3().setFromObject(amongUsModel);
      const center = box.getCenter(new THREE.Vector3());
      amongUsModel.position.sub(center);

      amongUsModel.position.set(0, 0, 0);
      amongUsModel.scale.set(1, 1, 1);
  },
  (progress) => {
      const percentage = Math.floor((progress.loaded / progress.total) * 100);
      console.log(`Loading model... ${percentage}%`);
      loadingHead.textContent = `${percentage}%`;
      
      if (percentage === 100) {
          loadingHead.textContent = '';
      }
  },
  (error) => {
      console.error('An error occurred while loading the model:', error);
  }
);

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    controls.update();

    if (amongUsModel) {
        // Add any animations or transformations to the model here
        // For example: amongUsModel.rotation.y += 0.01;
    }

    renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});