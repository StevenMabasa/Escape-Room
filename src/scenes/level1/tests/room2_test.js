// for effective testing, when you design the a room you will be able to see changes in the correspondi html file of this file
// so run the room_test.html file when designing to see the changes Just like how things were in CGV Labs


// You can make changes to your liking

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createRoom2 } from '../room2.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color("0x000000");

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // smoother soft shadows
renderer.outputEncoding = THREE.sRGBEncoding;

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
;

camera.position.set(0, 300, 0);  // diagonal view
controls.target.set(0, 200, 100);       // look a bit down at the room center
controls.update();







// Lights
// Improved lighting so walls, door, and handle are visible from all angles
// ===== Lighting (replace existing lights block) =====
scene.add(new THREE.AmbientLight(0xffffff, 0.00001)); // soft fill

// Main directional (shadow-casting) — covers room, like a strong interior light
const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.1);
dirLight1.position.set(100, 300, 100);
dirLight1.castShadow = true;
dirLight1.shadow.mapSize.width = 2048;
dirLight1.shadow.mapSize.height = 2048;
const s = 600;
dirLight1.shadow.camera.left = -s;
dirLight1.shadow.camera.right = s;
dirLight1.shadow.camera.top = s;
dirLight1.shadow.camera.bottom = -s;
dirLight1.shadow.camera.near = 50;
dirLight1.shadow.camera.far = 700;
dirLight1.shadow.bias = -0.0005;
scene.add(dirLight1);

// Secondary fill light (non-harsh)
const dirLight2 = new THREE.DirectionalLight(0xffffff, 0);
dirLight2.position.set(-200, 200, -100);
dirLight2.castShadow = false;
scene.add(dirLight2);

// Ceiling bulb — local light source that also casts shadows
const ceilingBulb = new THREE.PointLight(0xffeecc, 0.9, 1000, 0.5);
ceilingBulb.position.set(0, 180, 0);
ceilingBulb.castShadow = true;
ceilingBulb.shadow.mapSize.width = 1024;
ceilingBulb.shadow.mapSize.height = 1024;
ceilingBulb.shadow.bias = -0.001;
scene.add(ceilingBulb);

// DEBUG helper (optional) - comment out after you position lights
// scene.add(new THREE.CameraHelper(dirLight1.shadow.camera));



// Add the room
scene.add(createRoom2());

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime() * 1000; // milliseconds

    // Animate curtains
    scene.traverse(obj => {
        if (obj.userData.animate) obj.userData.animate(elapsed);
    });

    controls.update();
    renderer.render(scene, camera);
}
animate();

