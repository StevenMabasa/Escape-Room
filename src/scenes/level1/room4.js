// Here is where the scene for this room will be coded (that is the collections of objects,puzzles and models for this level will be here)
// This file also Defines the geometry, textures, and objects for this room.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import {loadTexture} from '../../../utils/loader.js';
import { loadModel } from '../../../utils/loader.js';

// everything you want to design for this ROOM you should do it inside createRoom function
// you are also free to create functions outside the createRoom function and call them inside afterwards

function createWall(width, height, depth, x, y, z, paint,path) {
  const wallgeometry = new THREE.BoxGeometry(width, height, depth);
  const wallmaterial = new THREE.MeshPhongMaterial({ map: path});
  const wall = new THREE.Mesh(wallgeometry, wallmaterial);

  wall.position.set(x, y, z);

  return wall;
}

// function to create a floor
function createFloor(width, height, depth, x, y, z, paint,path){
  const floorgeometry = new THREE.BoxGeometry(width, height, depth);
  const floormaterial = new THREE.MeshPhongMaterial({map: path});
  const floor = new THREE.Mesh(floorgeometry, floormaterial);

  floor.position.set(x, y, z);

  return floor
}

function createPlane(size = 10000, repeat = 1000, texturePath = null, color = "gray") {
  const loader = new THREE.TextureLoader();
  let material;

  if (texturePath) {
    const texture = loader.load(texturePath);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeat, repeat);

    material = new THREE.MeshStandardMaterial({ map: texture });
  } else {
    material = new THREE.MeshStandardMaterial({ color });
  }

  const geometry = new THREE.PlaneGeometry(size, size);
  const plane = new THREE.Mesh(geometry, material);

  plane.rotation.x = -Math.PI / 2; // lay flat
  plane.receiveShadow = true; // so it catches shadows if you add lighting

  return plane;
}


export function createRoom4() {
    const room = new THREE.Group();
    //TODO design a room here
    
    return room;
}
