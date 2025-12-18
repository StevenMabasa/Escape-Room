// for effective testing, when you design the a room you will be able to see changes in the correspondi html file of this file
// so run the room_test.html file when designing to see the changes Just like how things were in CGV Labs

// You can make changes to your liking

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createRoom4 } from '../room4.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaaaa);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild(renderer.domElement);

// OrbitControls for free movement around the room
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2.5, 0); // focus around room center
controls.update();

// Lights
// scene.add(new THREE.AmbientLight(0xffffff, 0.5));
// const dirLight = new THREE.DirectionalLight(0xffffff, 1);
// dirLight.position.set(10, 10, 10);
// scene.add(dirLight);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.01);
scene.add(ambientLight);


const room = createRoom4();
room.traverse((child) => {
  if (child.isMesh) {
    child.castShadow = true;
    child.receiveShadow = true;
  }
});
// Add the room
scene.add(room);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // needed for damping
  renderer.render(scene, camera);
}
animate();
