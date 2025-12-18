// Utility to load models (.gltf) or textures, so we don’t repeat code everywhere.

import { TextureLoader } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function loadTexture(path) {
  const loader = new TextureLoader();
  return loader.load(path);
}

/**
 * Load a GLTF/GLB model and return it as a THREE.Group
 * @param {string} path - path to the model file
 * @param {object} options - {x, y, z, scale, rotation}
 * @param {function} callback - called after model is loaded
 */

export function loadModel(path, options = {}, callback) {
  const loader = new GLTFLoader();

  loader.load(path, (gltf) => {
    const model = gltf.scene;

    // Set position
    if (options.x) model.position.x = options.x;
    if (options.y) model.position.y = options.y;
    if (options.z) model.position.z = options.z;

    // Set scale (uniform if number, or object {x,y,z})
    if (options.scale) {
      if (typeof options.scale === "number") {
        model.scale.set(options.scale, options.scale, options.scale);
      } else {
        model.scale.set(options.scale.x, options.scale.y, options.scale.z);
      }
    }

    // Set rotation (in radians)
    if (options.rotation) {
      if (options.rotation.x) model.rotation.x = options.rotation.x;
      if (options.rotation.y) model.rotation.y = options.rotation.y;
      if (options.rotation.z) model.rotation.z = options.rotation.z;
    }

    // Enable shadows
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    if (callback) callback(model);
  });
}
