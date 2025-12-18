// controls.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/PointerLockControls.js?module';


export function createControls(camera, domElement) {
  const controls = new PointerLockControls(camera, domElement);

  // Lock pointer on click
  domElement.addEventListener('click', () => {
    controls.lock();
  });

  controls.addEventListener('lock', () => {
    console.log('Pointer locked');
  });

  controls.addEventListener('unlock', () => {
    console.log('Pointer unlocked');
  });

  return controls;
}
