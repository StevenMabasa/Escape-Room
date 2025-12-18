import * as THREE from 'three';
import { createRoom1 } from '../room1.js';
import { setupFirstPersonControls } from '../../../controls/controls.js';
import { createRoom4 } from '../room4.js';

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaaaa);

// --- Camera ---
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(10, 10, 10);

// --- Renderer ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// --- First-Person Controls ---
const controls = setupFirstPersonControls(camera, renderer.domElement);

// --- Lights ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);


// --- Room Setup ---
const room = createRoom1();
const room4 = createRoom4();
room4.position.set(74.5, 0, 20);

room4.traverse((child) => {
  if (child.isMesh) {
    child.castShadow = true;
    child.receiveShadow = true;
  }
});

room.traverse((child) => {
  if (child.isMesh) {
    child.castShadow = true;
    child.receiveShadow = true;
  }
});
scene.add(room);
scene.add(room4);
// --- Window Resize Handling ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  controls.update(delta);
  renderer.render(scene, camera);
}

animate();
