// Here is where the scene for room1 level1 will be coded (that is the collections of objects,puzzles and models for this level will be here)
// This file also Defines the geometry, textures, and objects for this room.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import {loadTexture} from '../../../utils/loader.js';
import { loadModel } from '../../../utils/loader.js';
import { createPuzzle1Integration } from '../../puzzles/puzzle1Integration.js';

export const collidableObjectsroom1 = [];

// everything you want to design for this ROOM you should do it inside createRoom function
// you are also free to create functions outside the createRoom function and call them inside afterwards

const puzz1Models = new THREE.Group();
puzz1Models.name = "puzz1Models"; 

//helper function for adding and naming models

const addModel = (path, name, position, scale, rotation = {}, interactable = true) => {
    loadModel(
      path,
      { x: position.x, y: position.y, z: position.z, scale, rotation },
      (model) => {
        model.name = name;
        model.userData.interactable = interactable;
        model.userData.type = name;

        model.traverse((child) => {
          if (child !== model) child.userData.parentName = name;
        });

        puzz1Models.add(model);
      }
    );
  };

//function for creating pointLights, takes in name and position as input

const createPuzzleLight = (name, position) => {
    const light = new THREE.PointLight(0xfff2cc, 10, 50);
    light.position.set(...position);
    light.castShadow = true;
    light.shadow.bias = -0.003;
    light.name = name;

    light.traverse((child) => {
      if (child !== light) child.userData.parentName = name;
    });

    puzz1Models.add(light);
  };

//Function for creating notes with text, takes in a transparent image with text,scene and position/rotation

export function createTexturedNote(
  scene,
  texturePath,
  position = { x: 0, y: 0, z: 0 },
  rotation = { x: 0, y: 0, z: 0 }
) {
  loadModel(
    './models/post_it_notes.glb',
    {
      x: position.x,
      y: position.y,
      z: position.z,
      scale: 5,
      rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
    },
    (notes) => {
      notes.name = "customNote";
      notes.userData.interactable = true;
      scene.add(notes);

      // Hide all other note meshes except the target
      notes.traverse((child) => {
        if (child.isMesh && child.name !== 'Object_8') {
          child.visible = false;
        }
      });

      // Load the overlay image (writing)
      const textureLoader = new THREE.TextureLoader();
      const targetNote = notes.getObjectByName('Object_8');

      if (!targetNote) {
        console.warn('Target note mesh not found!');
        return;
      }

      // Create a combined texture (base + overlay)
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Fill canvas with base sticky note color
      ctx.fillStyle = '#ffffaa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load PNG and draw it centered
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        const combinedTexture = new THREE.CanvasTexture(canvas);
        combinedTexture.needsUpdate = true;

        // Apply texture to the note
        targetNote.material = new THREE.MeshStandardMaterial({
          map: combinedTexture,
          side: THREE.DoubleSide,
        });
      };
      img.src = texturePath;
    }
  );
}
// function to create walls
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

// function to create a door
function createDoor(width, height, depth, x, y, z, texturePath = null, color = "brown") {
  let material;

  if (texturePath) {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(texturePath);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    material = new THREE.MeshPhongMaterial({ map: texture });
  } else {
    material = new THREE.MeshPhongMaterial({ color });
  }

  const geometry = new THREE.BoxGeometry(width, height, depth);
  const door = new THREE.Mesh(geometry, material);

  door.position.set(x, y, z);
  door.castShadow = true;

  return door;
}


export function createRoom1() {
    const room = new THREE.Group();
    //TODO design a roome here
    // const plane =  createPlane(20000,1000,'/textures/pave.jpg');
    // room.add(plane);

    const floortexture = loadTexture('./textures/tile.jpg');
    floortexture.wrapS = THREE.RepeatWrapping;
    floortexture.wrapT = THREE.RepeatWrapping;
    floortexture.repeat.set(1.5, 1);
    const walltexture = loadTexture('./textures/wall.jpg');
    const ceilingTexture = loadTexture('./textures/ceiling.jpg');
    walltexture.wrapS = THREE.RepeatWrapping;
    walltexture.wrapT = THREE.RepeatWrapping;

    // floor
    const floor1 = createFloor(30,1,30,0,0,0,"white",floortexture); 
    room.add(floor1);

    const floor2 = createFloor(60,1,15,15,0,22.5,"white",floortexture);
    room.add(floor2);

    //ceiling
    const ceiling1 = createFloor(30,1,30,0,16,0,"white",ceilingTexture); 
    room.add(ceiling1);


    const ceiling2 = createFloor(60,1,15,15,16,22.5,"white",ceilingTexture);
    room.add(ceiling2);
 
    // walls
    const wall1 = createWall(30,15,1,0,8,-14.5,"white",walltexture);
    wall1.receiveShadow = true;
    room.add(wall1);
    collidableObjectsroom1.push(wall1);

    const wall2 = createWall(1,15,30,14.5,8,0,"white",walltexture);
    wall2.receiveShadow = true;
    room.add(wall2);
    collidableObjectsroom1.push(wall2);

    const wall3 = createWall(1,15,30,-14.5,8,0,"white",walltexture);
    wall3.receiveShadow = true;
    room.add(wall3);
    collidableObjectsroom1.push(wall3);

    const wall4 = createWall(1,15,15,-14.5,8,22.5,"white",walltexture);
    wall4.receiveShadow = true;
    room.add(wall4);
    collidableObjectsroom1.push(wall4);

    const wall5 = createWall(60,15,1,15,8,29.5,"white",walltexture);
    wall5.receiveShadow = true;
    room.add(wall5);
    collidableObjectsroom1.push(wall5);

    const wall6 =  createWall(31,15,1,29.5,8,15.5,"white",walltexture);
    wall6.receiveShadow = true;
    room.add(wall6);
    collidableObjectsroom1.push(wall6);

    const wall7 = createWall(1,15,4,44.5,8,18,"white",walltexture);
    wall7.receiveShadow = true;
    room.add(wall7);
    collidableObjectsroom1.push(wall7);

    const wall8 = createWall(1,15,4,44.5,8,27,"white",walltexture);
    wall8.receiveShadow = true;
    room.add(wall8);
    collidableObjectsroom1.push(wall8);

    const wall9 = createWall(1,5,5,44.5,13,22.5,"white",walltexture);
    wall9.receiveShadow = true;
    room.add(wall9);
    collidableObjectsroom1.push(wall9);

    //door
    const doorTexture = './textures/black_door1.png'; // replace with your door texture
    const door = createDoor(1, 10, 5, 44.5, 5.5, 22.5, doorTexture);
    door.name = "exitDoor";
    door.userData.isDoor = true;
    room.add(door);
    collidableObjectsroom1.push(door);

    //////////// Furnitures //////////////////////


    const paintingtexture = loadTexture('./textures/painting-min.jpg');

    const painting = createFloor(7, 4.6, 0.1, 3.5, 8, -13.8, "white", paintingtexture); 
    const rgbtexture = loadTexture('./textures/rgb.png');

    const rgb = createFloor(7, 4.6, 0.1, 3.5, 8, 28.9, "white", rgbtexture);
    room.add(painting, rgb);
    //post-it notes model
    createTexturedNote(room, './textures/love.png', { x: -2.5, y: 4.2, z: 8 },{ x: 0, y: Math.PI / 3, z: 0 });
    createTexturedNote(room, './textures/two.png', { x: 3.5, y: 6.2, z: -13.5},{ x: Math.PI/2, y:Math.PI/2, z: 0 });
    createTexturedNote(room, './textures/one.png', {x: -13.9, y: 5.8, z: 20},{ x: 0, y:Math.PI, z: Math.PI/2 });
    createTexturedNote(room, './textures/two.png', {x: -13.9, y: 5.8, z: 23},{ x: 0, y:Math.PI, z: Math.PI/2 });

    //adding puzzle lights

    // Create the 3 point lights 

    createPuzzleLight("Light1", [-13, 10, 20]);
    createPuzzleLight("Light2", [-13, 10, 23]);
    createPuzzleLight("Light3", [-13, 10, 26]);

    //load the 3 light Models
    const puzzLightPositions = [
    { name: "puzzLight1", z: 20 },
    { name: "puzzLight2", z: 23 },
    { name: "puzzLight3", z: 26 },
  ];

  puzzLightPositions.forEach(({ name, z }) =>
    addModel(
      './models/puzzLight.glb',
      name,
      { x: -14, y: 9, z },
      0.03,
      { y: -Math.PI }
    )
  );

  //Load Buttons

  const buttonPositions = [
    { name: "button1", z: 20 },
    { name: "button2", z: 23 },
    { name: "button3", z: 26 },
  ];

  buttonPositions.forEach(({ name, z }) =>
    addModel(
      './models/button.glb',
      name,
      { x: -14, y: 7, z },
      0.3,
      { z: -Math.PI / 2 }
    )
  );

  // Load the key
  addModel(
    './models/key.glb',
    'key1',
    { x: -10, y: 0, z: 23 },
    0.003,
    { x: Math.PI / 2 }
  );

  room.add(puzz1Models)
    //cage
    loadModel('./models/cage.glb',
      {x:-8,y:0,z:-9,scale:0.05},
      (cage)=>{
        room.add(cage);
        collidableObjectsroom1.push(cage);
      }
    );
    //locker
    loadModel('./models/locker.glb',
      {x:13,y:0,z:0,scale:6,rotation:{y:-Math.PI/2}},
      (locker)=>{
        room.add(locker);
        collidableObjectsroom1.push(locker);
      }
    );
    //dardboard
    loadModel('./models/dartboard.glb',
      {x:13.7,y:8,z:9,scale:0.7,rotation:{y:Math.PI/2}},
      (dart)=>{
        room.add(dart);
        collidableObjectsroom1.push(dart);
      }
    );
    //old couch
    loadModel('./models/old_couch.glb',
      {x:-11.5,y:0,z:9,scale:0.06,rotation:{y:Math.PI/2}},
      (couch)=>{
        room.add(couch);
        collidableObjectsroom1.push(couch);
      }
    );
    //old table
    loadModel('./models/old_wooden_table.glb',
      {x:-3,y:4,z:9,scale:1.1,rotation:{y:Math.PI}},
      (table)=>{
        room.add(table);
        collidableObjectsroom1.push(table);
      }
    );
    //window
    loadModel('./models/window.glb',
      {x:-3,y:6,z:30,scale:1.8,rotation:{y:2*Math.PI}},
      (window)=>{
        room.add(window);
        collidableObjectsroom1.push(window);
      }
    );
    //chest
    loadModel('./models/chest.glb',
      {x:-11,y:0,z:23,scale:0.004,rotation:{y:-Math.PI/2}},
      (chest)=>{
        room.add(chest);
        collidableObjectsroom1.push(chest);
      }
    );
    
    //wall lamp
    loadModel('./models/wall_lamp.glb',
      {x:25,y:8,z:28,scale:3,rotation:{y:Math.PI}},
      (lamp)=>{
        lamp.castShadow = true;
        room.add(lamp);
        collidableObjectsroom1.push(lamp);

        const wallLight = new THREE.SpotLight(0xffd27f, 2, 40, Math.PI / 2, 0.5, 1);
        wallLight.position.set(25, 8, 28);
        wallLight.target.position.set(25, 5, 20);
        wallLight.castShadow = true;

        wallLight.shadow.mapSize.width = 512;
        wallLight.shadow.mapSize.height = 512;
        wallLight.shadow.bias = -0.003;

        room.add(wallLight);
        room.add(wallLight.target);
      }
    );

//ceiling light
loadModel('./models/ceiling_light.glb',
  {x:-6,y:-17.5,z:-30,scale:12,rotation:{y:-Math.PI/2}},
  (ceilingLight)=>{
    room.add(ceilingLight);
    // Create the actual light source
    const bulbLight = new THREE.PointLight(0xfff2cc, 50, 50); 
    bulbLight.position.set(0, 10, 10);
    bulbLight.castShadow = true;

    bulbLight.shadow.mapSize.width = 512;
    bulbLight.shadow.mapSize.height = 512;
    bulbLight.shadow.bias = -0.003;

    room.add(bulbLight);

  }
);

  return {room,puzz1Models};
}

// Export a function to setup puzzles for room1
export function setupRoom1Puzzles(room, puzz1Models, puzzleManager, infoDisplay) {
  // Create the puzzle integration
  const puzzle1Integration = createPuzzle1Integration(puzz1Models, infoDisplay);
  
  // Register with puzzle manager
  // Use a unique ID for this room (level1-room1)
  puzzleManager.registerPuzzle('level1-room1', puzzle1Integration);
  
  console.log('Room 1 puzzles registered');
}