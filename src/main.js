// Guys this is just the example skeleton of the game and you can add more staff as needed
// I just wanted to make it clear how things are linking to each other
// you can also add more files as you want

// Main game entry point
// Sets up scene, camera, renderer, player, game, and levels

import { PuzzleManager } from './puzzles/puzzleManager.js';
import * as THREE from 'three';
import { createCrosshair,createInfoDisplay } from './puzzles/UiElements.js';
import { createControls } from './camera.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
// Using authored blood splatter mesh instead of decal geometry
import { setupFirstPersonControls } from './controls/controls.js';
import { CharacterControls } from './controls/movement.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createPlayer } from './objects/player.js';
import { createGame } from './game.js';
import { createLevel1 } from './scenes/level1/index.js';
import { collidableObjectsroom1} from './scenes/level1/room1.js';
import { collidableObjectsroom2} from './scenes/level1/room2.js'; 
import { collidableObjectsroom3} from './scenes/level1/room3.js';
import { createLevel2 } from './scenes/level2/index.js';
import { createLevel3 } from './scenes/level3/index.js';
import { createLevel4 } from './scenes/level4/index.js';

// Guard: some browsers throw InvalidStateError when setPointerCapture is called
// in situations where pointer capture isn't allowed (OrbitControls in some builds).
// Wrap the canvas setPointerCapture with a safe no-op to avoid uncaught exceptions.
function makeSafePointerCapture(canvas) {
    if (!canvas || !canvas.setPointerCapture) return;
    const orig = canvas.setPointerCapture.bind(canvas);
    canvas.setPointerCapture = (pointerId) => {
        try { orig(pointerId); } catch (e) { /* ignore InvalidStateError */ }
    };
}

// Start with collidable objects from room1 by default
const collidableObjects = collidableObjectsroom1;
// --- Scene, camera, renderer setup ---
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 6, 10);
camera.lookAt(0,5,0);

const crosshair = createCrosshair();
const infoDisplay = createInfoDisplay();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;                 // enable shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // soft shadows
document.body.appendChild(renderer.domElement);
// Make pointer capture safe on the renderer canvas
makeSafePointerCapture(renderer.domElement);
const puzzleManager = new PuzzleManager(scene, camera, renderer);

// Explosion state
let explosionActive = false;
let explosionPieces = [];
let explosionStartTime = 0;
let bloodDecals = [];
let bloodTexture = null;
let gutsTemplate = null;
let bloodSplatterTemplate = null;
let explosionCollisionTargets = [];
let bloodSplatTexture = null;
let explosionOrigin = new THREE.Vector3();
let explosionMaxRadius = 9; // clamp distance from origin

const controls = setupFirstPersonControls(camera, renderer.domElement);
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.target.set(15, 5, 15);
orbitControls.update();
const pointerControls = new PointerLockControls(camera, renderer.domElement);
scene.add(pointerControls.getObject());


window.isPaused = false;
// Click to lock the mouse
document.addEventListener('click', () => {
    if (!window.isPaused) {
        pointerControls.lock();
    }
});

pointerControls.addEventListener('lock', () => console.log('Pointer locked'));
pointerControls.addEventListener('unlock', () => console.log('Pointer unlocked'));

// --- Add lights ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);
// bottom = -50;
// scene.add(directionalLight);


window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


// --- Initialize player ---
const player = createPlayer(camera);

// --- Initialize game ---
const game = createGame(scene, player);

// global key counter and level counter
window.numOfKeys = 0;
window.level_num = 0;

// --- Add levels ---
const level1 = createLevel1();
const level2 = createLevel2();
const level3 = createLevel3();
const level4 = createLevel4();

level1.setupPuzzles(puzzleManager, infoDisplay);
level2.setupPuzzles && level2.setupPuzzles(puzzleManager, infoDisplay);
level3.setupPuzzles && level3.setupPuzzles(puzzleManager, infoDisplay);
level4.setupPuzzles && level4.setupPuzzles(puzzleManager, infoDisplay);

game.addLevel(level1);
game.addLevel(level2);
game.addLevel(level3);
game.addLevel(level4);

let current_room = game.getCurrentRoom();

// Enable shadows on room objects
current_room.traverse((child) => {
  if (child.isMesh) {
    child.castShadow = true;
    child.receiveShadow = true;
  }
});


// --- Add first room to scene ---
scene.add(current_room);

current_room.visible = true;

puzzleManager.activateRoom(current_room.userData.roomId);

let characterControls = null;
// Expose to other modules (read-only usage expected)
window._characterControls = null;
const keysPressed = {};
const clock = new THREE.Clock();


///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Door interaction logic 
const interactionUI = document.getElementById('interaction-ui');
const no_key = document.getElementById('no_key');
let nearDoor = false;
let doorUnlocked = false;

// Helper function to check if player is near the door
function checkDoorInteraction() {
    if (!characterControls || !collidableObjects) return;

    const playerPos = characterControls.model.position;
    nearDoor = false;

    // Loop over the collidable objects of the current room
    for (const obj of collidableObjects) {
        if (obj.userData.isDoor) {
            const distance = playerPos.distanceTo(obj.position);
            if (distance < 10 && !doorUnlocked) { // within 10 units
                nearDoor = true;
                break;
            }
        }
    }

    // Show proper UI based on keys
    if (window.numOfKeys > 0 && current_room.userData.roomId === "level1-room1") {
        interactionUI.style.display = nearDoor ? 'block' : 'none';
        no_key.style.display = 'none';
    } else if(window.numOfKeys > 1 && current_room.userData.roomId === "level1-room2"){
        interactionUI.style.display = nearDoor ? 'block' : 'none';
        no_key.style.display = 'none';
    }
    else{
        no_key.style.display = nearDoor ? 'block' : 'none';
        interactionUI.style.display = 'none';
    }
}


// When the player presses 'E' the door unlocks
window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'e' && nearDoor && !doorUnlocked) {
    if(window.numOfKeys > 0 && current_room.userData.roomId === "level1-room1"){
      unlockDoor();
    }
    else if(window.numOfKeys > 1 && current_room.userData.roomId === "level1-room2"){
        unlockDoor();
    }
  }
});


function unlockDoor() {
    const door = collidableObjects.find(obj => obj.userData.isDoor);
    if (!door) return;

    doorUnlocked = true;

    // Animate door rotation
    const doorOpenRotation = { y: door.rotation.y - Math.PI/2 }; // rotate 90 degrees
    const duration = 1; // seconds
    const startTime = performance.now();

    function animateDoor(time) {
        const elapsed = (time - startTime) / 1000;
        const t = Math.min(elapsed / duration, 1);
        door.rotation.y = THREE.MathUtils.lerp(door.rotation.y, doorOpenRotation.y, t);
        if (t < 1) requestAnimationFrame(animateDoor);
        else fadeOutRoom();
    }
    requestAnimationFrame(animateDoor);
}


function fadeOutRoom() {
    const fadeOverlay = document.getElementById('fade-overlay');
    fadeOverlay.style.transition = 'opacity 1s ease';
    fadeOverlay.style.opacity = 1;

    // Wait for fade to finish, then switch room
    setTimeout(() => {
        switchRoom();
        fadeOverlay.style.opacity = 0;
    }, 1000);
}


// This  function changes the room after a player unlocks the door
function switchRoom() {
    // Remove current room
    if (current_room) scene.remove(current_room);

    // Get the next room
    const nextRoom = game.nextRoom();
    scene.add(nextRoom);

    // Enable shadows
    nextRoom.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    // Update collidable objects
    collidableObjects.length = 0;
    if (nextRoom.userData.roomId === "level1-room2") {
        collidableObjects.push(...collidableObjectsroom2);
    } else if (nextRoom.userData.roomId === "level1-room3") {
        collidableObjects.push(...collidableObjectsroom3);
    }

    // Update player position
    if (characterControls) {
        characterControls.collidableObjects = collidableObjects;
        if (nextRoom.userData.roomId === "level1-room2") {
            characterControls.model.position.set(-15, 0.5, 3);
            characterControls.model.rotation.y = Math.PI/2;
        } else if (nextRoom.userData.roomId === "level1-room3") {
            characterControls.model.position.set(0, 0.5, 10);
            characterControls.model.scale.set(4,4,4);
            characterControls.model.rotation.y = Math.PI;
        }
    }

    // Update current_room reference
    current_room = nextRoom;

    // Activate puzzle for the new room
    puzzleManager.activateRoom(nextRoom.userData.roomId);

    // Reset door state
    doorUnlocked = false;
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// player model

new GLTFLoader().load('./models/player.glb', gltf => {
    const model = gltf.scene;
    model.traverse(obj => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    // setting the initial postion of the player model in each room
    model.position.set(0, 0.5, 0);
    model.scale.set(5, 5, 5);

    scene.add(model);

    const mixer = new THREE.AnimationMixer(model);
    const animationsMap = new Map();
    gltf.animations.forEach(clip => animationsMap.set(clip.name, mixer.clipAction(clip)));

    characterControls = new CharacterControls(model, mixer, animationsMap, orbitControls, camera, 'idle',collidableObjects );
    // make accessible for proximity checks (read-only)
    try { window._characterControls = characterControls; } catch (_) {}
});

// Preload explosion assets (guts + blood splatter)
const sharedLoader = new GLTFLoader();
sharedLoader.load('./models/guts.glb', (gltf) => {
    gutsTemplate = gltf.scene;
    normalizeAndCenterTemplate(gutsTemplate, 1.0);
});
// The original 'blood_slatter.glb' isn't present in the models directory on all installs.
// Fall back to a similar authored splatter/gore model if available to avoid a 404.
sharedLoader.load('./models/gore.glb', (gltf) => {
    bloodSplatterTemplate = gltf.scene;
    normalizeAndCenterTemplate(bloodSplatterTemplate, 1.0);
});

// Preload authored blood texture (JPEG without alpha). We'll use a shader to discard bright background
new THREE.TextureLoader().load('./textures/splashed-blood.jpg', (tex) => {
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.encoding = THREE.sRGBEncoding;
    bloodSplatTexture = tex;
});

// Time-up handling: explode player only in first room
function isInFirstRoom() {
    // Explosion now enabled in all rooms; keep function for compatibility
    return true;
}

// Allow HUD to defer showing default time-up UI (we want to run explosion first)
window.shouldDeferTimeUpUI = function() {
    // Always defer so explosion plays before showing the UI
    return true;
};

function triggerPlayerExplosion() {
    if (!characterControls || !characterControls.model || explosionActive) return;
    const playerModel = characterControls.model;

    // Mark that this time-up path is an explosion death
    try { window.wasExploded = true; } catch (_) {}

    // Build gore fragments from player bounding box
    const bbox = new THREE.Box3().setFromObject(playerModel);
    const size = new THREE.Vector3();
    bbox.getSize(size);

    const center = new THREE.Vector3();
    bbox.getCenter(center);

    // Build collision target list from current room meshes
    explosionCollisionTargets = [];
    if (current_room) current_room.traverse(obj => { if (obj.isMesh) explosionCollisionTargets.push(obj); });

    // Hide the original player model
    playerModel.visible = false;

    explosionPieces = [];
    // 1) Spawn authored guts pieces (cloned from template)
    const gutsCount = 28;
    for (let i = 0; i < gutsCount; i++) {
        const gut = createGutsPiece(center);
        if (gut) {
            scene.add(gut);
            explosionPieces.push(gut);
        }
    }

    // 2) Add a handful of chunky gibs for variety
    const gibCount = 50;
    for (let i = 0; i < gibCount; i++) {
        const gibSize = 0.08 + Math.random() * 0.18; // smaller cubes
        const geom = new THREE.BoxGeometry(gibSize, gibSize * (0.5 + Math.random()), gibSize);
        const mat = new THREE.MeshPhysicalMaterial({ color: 0x6b0a0a, roughness: 0.35, metalness: 0.0, clearcoat: 0.6, clearcoatRoughness: 0.3 });
        const gib = new THREE.Mesh(geom, mat);
        gib.castShadow = true;
        gib.receiveShadow = true;
        gib.position.copy(center);
        const dir = new THREE.Vector3(Math.random() - 0.5, Math.random(), Math.random() - 0.5).normalize();
        const speed = 5 + Math.random() * 3; // slower travel
        gib.userData.velocity = dir.multiplyScalar(speed);
        gib.userData.angularVelocity = new THREE.Vector3(
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6
        );
        gib.userData.life = 2.5 + Math.random() * 0.8; // seconds to fade out
        scene.add(gib);
        explosionPieces.push(gib);
    }

    explosionStartTime = performance.now();
    explosionActive = true;
    explosionOrigin.copy(center);

    // 3) Splatter blood onto nearby objects using the authored mesh
    splatterBloodMeshes(center, 8, 48);
    // 4) Also stamp texture-based blood splats using a shader cutoff to fake transparency
    splatterBloodTextureQuads(center, 8, 36);
}

// Update explosion pieces and eventually show game-over UI
function updateExplosion(delta) {
    if (!explosionActive) return;

    const gravity = -9.8;
    const airDrag = 0.98;

    for (const p of explosionPieces) {
        // Integrate velocity
        if (p.userData.settled) continue;
        const currentPos = p.position.clone();
        const nextVel = p.userData.velocity.clone();
        nextVel.y += gravity * delta;
        nextVel.multiplyScalar(airDrag);
        const nextPos = currentPos.clone().addScaledVector(nextVel, delta);

        // Simple raycast collision from current -> next
        const ray = new THREE.Raycaster(currentPos, nextPos.clone().sub(currentPos).normalize(), 0, currentPos.distanceTo(nextPos));
        const hits = explosionCollisionTargets.length ? ray.intersectObjects(explosionCollisionTargets, true) : [];
        if (hits.length > 0) {
            const hit = hits[0];
            // Stick to the surface slightly offset along normal
            const offset = hit.normal.clone().multiplyScalar(0.02);
            p.position.copy(hit.point.clone().add(offset));
            // Align orientation so its local up roughly matches surface normal, if it has a lookAt-friendly shape
            try {
                const lookTarget = new THREE.Vector3().addVectors(p.position, hit.normal);
                p.lookAt(lookTarget);
            } catch (_) {}
            p.userData.velocity.set(0, 0, 0);
            p.userData.angularVelocity.set(0, 0, 0);
            p.userData.settled = true;

            // If we settled, add a small blood pool under if there's ground below
            try { maybeAddGroundPool(p.position); } catch (_) {}
        } else {
            p.userData.velocity.copy(nextVel);
            p.position.copy(nextPos);
        }

        // Clamp to explosion radius to keep debris nearby
        const fromOrigin = new THREE.Vector3().subVectors(p.position, explosionOrigin);
        const dist = fromOrigin.length();
        if (dist > explosionMaxRadius) {
            p.position.copy(explosionOrigin.clone().add(fromOrigin.setLength(explosionMaxRadius)));
            p.userData.velocity.set(0, 0, 0);
            p.userData.angularVelocity.set(0, 0, 0);
            p.userData.settled = true;
        }

        // Spin
        p.rotation.x += p.userData.angularVelocity.x * delta;
        p.rotation.y += p.userData.angularVelocity.y * delta;
        p.rotation.z += p.userData.angularVelocity.z * delta;

        // Fade out flying debris over lifetime (keep settled ones)
        if (!p.userData.settled && typeof p.userData.life === 'number') {
            p.userData.life -= delta;
            const alpha = Math.max(0, Math.min(1, p.userData.life / 3));
            if (p.material && p.material.transparent !== undefined) {
                p.material.transparent = true;
                p.material.opacity = alpha;
            }
        }
    }

    // After 1.5s, show Game Over UI and stop simulation
    if (performance.now() - explosionStartTime > 1500) {
        explosionActive = false;
        if (typeof window.showTimeUpUI === 'function') window.showTimeUpUI();
    }
}

// Create a guts piece by cloning the preloaded template
function createGutsPiece(origin) {
    if (!gutsTemplate) return null;
    const clone = gutsTemplate.clone(true);
    // Randomize scale within reasonable intestine-like range
    const s = 0.18 + Math.random() * 0.24; // slightly smaller guts
    clone.scale.setScalar(s);

    // Randomize slight rotation so not all look the same
    clone.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

    // Start at origin with outward/upward velocity
    const outward = new THREE.Vector3(Math.random() - 0.5, Math.random(), Math.random() - 0.5).normalize();
    clone.position.copy(origin);
    clone.userData.velocity = outward.multiplyScalar(4 + Math.random() * 3); // slower
    clone.userData.velocity.y += 2 + Math.random() * 3;
    clone.userData.angularVelocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2.5,
        (Math.random() - 0.5) * 2.5,
        (Math.random() - 0.5) * 2.5
    );
    // Approximate bounding radius for collision (used implicitly in ray length)
    clone.userData.settled = false;
    // Make guts look wet
    clone.traverse(child => {
        if (child.isMesh) {
            child.material = new THREE.MeshPhysicalMaterial({ color: 0x7a0c0c, roughness: 0.35, metalness: 0.0, clearcoat: 0.7, clearcoatRoughness: 0.25 });
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    enableShadowsRecursive(clone);
    return clone;
}

// Project authored blood splatter meshes onto nearby surfaces
function splatterBloodMeshes(origin, radius = 12, rays = 40) {
    if (!bloodSplatterTemplate) {
        // Template not ready yet; retry shortly so the effect still appears
        setTimeout(() => splatterBloodMeshes(origin, radius, rays), 100);
        return;
    }
    const raycaster = new THREE.Raycaster();
    const targets = explosionCollisionTargets && explosionCollisionTargets.length ? explosionCollisionTargets : [];
    if (targets.length === 0) return;

    for (let i = 0; i < rays; i++) {
        const dir = new THREE.Vector3(
            (Math.random() - 0.5),
            Math.random() * 0.8,
            (Math.random() - 0.5)
        ).normalize();
        raycaster.set(origin, dir);
        const hits = raycaster.intersectObjects(targets, true);
        if (hits.length === 0) continue;
        const hit = hits[0];
        if (hit.distance > radius) continue;

        const splat = bloodSplatterTemplate.clone(true);
        // Randomize scale and rotate to face the surface normal
        // Randomize non-uniform scale for irregular shape
        const s = 1.0 + Math.random() * 2.0;
        splat.scale.set(s * (0.7 + Math.random() * 0.6), s, s * (0.7 + Math.random() * 0.6));
        splat.position.copy(hit.point.clone().add(hit.normal.clone().multiplyScalar(0.03)));
        // Orient: align local +Y to surface normal, then add random twist around normal
        const quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), hit.normal.clone().normalize());
        splat.setRotationFromQuaternion(quat);
        splat.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);

        // Ensure visibility of materials (opaque, double-sided red)
        splat.traverse(child => {
            if (child.isMesh) {
                // If the child has a material, tweak basic visibility aspects
                const mat = child.material;
                if (Array.isArray(mat)) {
                    mat.forEach(m => adjustBloodMaterial(m));
                } else if (mat) {
                    adjustBloodMaterial(mat);
                }
            }
        });
        enableShadowsRecursive(splat);
        scene.add(splat);
        bloodDecals.push(splat);

        // If wall-like surface, add a couple of drips below
        const vertical = Math.abs(hit.normal.y) < 0.5;
        if (vertical) {
            try { addWallDrips(hit.point, hit.normal); } catch (_) {}
        }
    }
}

// Stamp quads using the provided blood JPEG; discard bright pixels to simulate alpha
function splatterBloodTextureQuads(origin, radius = 12, rays = 24) {
    if (!bloodSplatTexture) {
        setTimeout(() => splatterBloodTextureQuads(origin, radius, rays), 100);
        return;
    }
    const raycaster = new THREE.Raycaster();
    const targets = explosionCollisionTargets && explosionCollisionTargets.length ? explosionCollisionTargets : [];
    if (targets.length === 0) return;

    for (let i = 0; i < rays; i++) {
        const dir = new THREE.Vector3(
            (Math.random() - 0.5),
            Math.random() * 0.8,
            (Math.random() - 0.5)
        ).normalize();
        raycaster.set(origin, dir);
        const hits = raycaster.intersectObjects(targets, true);
        if (hits.length === 0) continue;
        const hit = hits[0];
        if (hit.distance > radius) continue;

        const size = 0.6 + Math.random() * 1.6;
        const geom = new THREE.PlaneGeometry(size * (0.6 + Math.random() * 0.8), size);
        const mat = createBloodCutoutMaterial(bloodSplatTexture, 0.85);
        const quad = new THREE.Mesh(geom, mat);
        quad.position.copy(hit.point.clone().add(hit.normal.clone().multiplyScalar(0.02)));
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), hit.normal.clone().normalize());
        quad.setRotationFromQuaternion(quat);
        quad.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);
        quad.renderOrder = 2; // help avoid z-fighting
        scene.add(quad);
        bloodDecals.push(quad);
    }
}

function createBloodCutoutMaterial(texture, brightnessCutoff = 0.85) {
    const uniforms = {
        map: { value: texture },
        cutoff: { value: brightnessCutoff },
        tint: { value: new THREE.Color(0x7a0c0c) }
    };
    const vert = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    const frag = `
        varying vec2 vUv;
        uniform sampler2D map;
        uniform float cutoff;
        uniform vec3 tint;
        void main() {
            vec4 c = texture2D(map, vUv);
            float brightness = dot(c.rgb, vec3(0.299, 0.587, 0.114));
            if (brightness > cutoff) discard;
            vec3 color = c.rgb * tint;
            gl_FragColor = vec4(color, 1.0);
        }
    `;
    const mat = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -2
    });
    return mat;
}

// Add a small blood pool on the ground under a settled piece
function maybeAddGroundPool(fromPosition) {
    if (!bloodSplatTexture) return;
    const ray = new THREE.Raycaster(fromPosition, new THREE.Vector3(0, -1, 0), 0, 3);
    const hits = explosionCollisionTargets.length ? ray.intersectObjects(explosionCollisionTargets, true) : [];
    if (hits.length === 0) return;
    const hit = hits[0];
    // Only if surface is floor-ish
    if (hit.normal.y < 0.85) return;
    const poolSize = 0.8 + Math.random() * 1.6;
    const geom = new THREE.PlaneGeometry(poolSize * (1.3 + Math.random() * 0.7), poolSize);
    const mat = createBloodCutoutMaterial(bloodSplatTexture, 0.9);
    const pool = new THREE.Mesh(geom, mat);
    pool.position.copy(hit.point.clone().add(hit.normal.clone().multiplyScalar(0.005)));
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), hit.normal.clone().normalize());
    pool.setRotationFromQuaternion(quat);
    pool.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);
    pool.renderOrder = 2;
    scene.add(pool);
    bloodDecals.push(pool);
}

// Add a couple of gravity drips below a wall splat
function addWallDrips(startPoint, normal) {
    if (!bloodSplatTexture) return;
    const ray = new THREE.Raycaster(startPoint, new THREE.Vector3(0, -1, 0), 0, 2.5);
    const hits = explosionCollisionTargets.length ? ray.intersectObjects(explosionCollisionTargets, true) : [];
    const count = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < Math.min(count, hits.length); i++) {
        const h = hits[i];
        const size = 0.25 + Math.random() * 0.5;
        const geom = new THREE.PlaneGeometry(size * (0.5 + Math.random()), size * 1.6);
        const mat = createBloodCutoutMaterial(bloodSplatTexture, 0.88);
        const drip = new THREE.Mesh(geom, mat);
        drip.position.copy(h.point.clone().add(h.normal.clone().multiplyScalar(0.008)));
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), h.normal.clone().normalize());
        drip.setRotationFromQuaternion(quat);
        // Rotate so the long side points downward visually
        drip.rotateZ(Math.PI * 0.5 * (Math.random() - 0.5));
        drip.renderOrder = 2;
        scene.add(drip);
        bloodDecals.push(drip);
    }
}

// Utility: ensure meshes cast/receive shadows
function enableShadowsRecursive(obj) {
    obj.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
}

// Utility: normalize template to unit-ish bounds and center for cleaner cloning
function normalizeAndCenterTemplate(root, targetMaxSize = 1.0) {
    const bbox = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3(); bbox.getSize(size);
    const center = new THREE.Vector3(); bbox.getCenter(center);
    // Center
    root.position.sub(center);
    // Scale
    const maxSide = Math.max(size.x, size.y, size.z) || 1;
    const uniform = targetMaxSize / maxSide;
    root.scale.multiplyScalar(uniform);
}

// Ensure blood materials render visibly
function adjustBloodMaterial(material) {
    if (!material) return;
    if (material.color) material.color.set(0x7a0c0c);
    material.transparent = false;
    material.opacity = 1.0;
    material.depthWrite = false;
    material.side = THREE.DoubleSide;
}

// Listen to time-up event
window.addEventListener('game:timeup', () => {
    // If currently in first-person, switch to third-person and wait until it applies
    if (characterControls &&
        characterControls.currentCameraMode === characterControls.cameraModes.FIRST_PERSON) {
        try { characterControls.toggleCameraMode(); } catch (_) {}
        waitForThirdPersonThenExplode(1000); // wait up to 1s
    } else {
        triggerPlayerExplosion();
    }
});

function waitForThirdPersonThenExplode(timeoutMs = 1000) {
    const start = performance.now();
    function check() {
        const inThird = characterControls &&
            characterControls.currentCameraMode === characterControls.cameraModes.THIRD_PERSON &&
            characterControls.model && characterControls.model.visible;
        if (inThird) {
            // Small additional delay to ensure rendering has updated
            setTimeout(() => triggerPlayerExplosion(), 150);
            return;
        }
        if (performance.now() - start > timeoutMs) {
            // Fallback: explode anyway
            triggerPlayerExplosion();
            return;
        }
        requestAnimationFrame(check);
    }
    requestAnimationFrame(check);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


document.addEventListener('keydown', event => {
    // Ignore key presses if the game is paused
    if (window.isPaused) return;

    keysPressed[event.key.toLowerCase()] = true;

    if (event.key.toLowerCase() === 'v' && characterControls) {
        characterControls.toggleCameraMode();
    }
}, false);

document.addEventListener('keyup', event => {
    // Ignore key releases if the game is paused
    if (window.isPaused) return;

    keysPressed[event.key.toLowerCase()] = false;
}, false);


window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// --- Animation loop ---
function animate() {
    requestAnimationFrame(animate);

    if (!window.isPaused || explosionActive) { 
        const delta = clock.getDelta();
        game.update();
        puzzleManager.update(delta);
        if (!explosionActive && characterControls) characterControls.update(delta, keysPressed);
        updateExplosion(delta);
        checkDoorInteraction();
        orbitControls.update();
    }

    renderer.render(scene, camera);
}

animate();


