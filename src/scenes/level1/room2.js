// Here is where the scene for this room will be coded (that is the collections of objects,puzzles and models for this level will be here)
// This file also Defines the geometry, textures, and objects for this room.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import {loadTexture} from '../../../utils/loader.js';
import { loadModel } from '../../../utils/loader.js';
import { createPuzzle2Integration } from '../../puzzles/puzzle2Integration.js';

// everything you want to design for this ROOM you should do it inside createRoom function
// you are also free to create functions outside the createRoom function and call them inside afterwards
export const collidableObjectsroom2 = [];
const puzz2Models = new THREE.Group();
puzz2Models.name = "puzz2Models"; 
function createWall(width, height, depth, x, y, z, paint,path) {
  const wallgeometry = new THREE.BoxGeometry(width, height, depth);
  const wallmaterial = new THREE.MeshPhongMaterial({ map: path});
  const wall = new THREE.Mesh(wallgeometry, wallmaterial);

  wall.position.set(x, y, z);

  return wall;
}

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
        collidableObjectsroom2.push(model)
        puzz2Models.add(model);
      }
    );
  };

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

// === NEW helper: lamp with real light ===
function createLampWithLight(x, y, z, scale = 20) {
  const group = new THREE.Group();

  // load lamp model
  loadModel('./models/ceiling_light.glb',
    {x:-18,y:-16.5,z:3,scale:scale},
    (lamp)=>{
      group.add(lamp);
      
    }
  );  

  // point light to emit illumination
  const lampLight = new THREE.PointLight(0xfff2cc, 50, 50); 
  lampLight.position.set(0, -0.5, 0); 
  lampLight.castShadow = true;
  lampLight.shadow.mapSize.width = 512;
  lampLight.shadow.mapSize.height = 512;
  group.add(lampLight);

  group.position.set(x, y, z);
  return group;
}

export function createRoom2() {
    const room = new THREE.Group();
    //TODO design a room here
    // const plane =  createPlane(20000,1000,'/textures/pave.jpg');
    // room.add(plane);

    const floortexture = loadTexture('./textures/tile.jpg');
    floortexture.wrapS = THREE.RepeatWrapping;
    floortexture.wrapT = THREE.RepeatWrapping;
    floortexture.repeat.set(1.5, 1);
    const walltexture = loadTexture('./textures/wall.jpg');

    const ceilingTexture = loadTexture('./textures/ceiling.jpg');

    const ceiling = createFloor(60,1,60,0,16,0,"white",ceilingTexture); 
    room.add(ceiling);

    const floor1 = createFloor(60,1,60,0,0,0,"white",floortexture); 
    room.add(floor1);

    const wall1 = createWall(30,15,1,15,8,-30.5,"white",walltexture);
    room.add(wall1);
    collidableObjectsroom2.push(wall1);

    const wall2 = createWall(30,15,1,-15,8,-30.5,"white",walltexture);
    room.add(wall2);
    collidableObjectsroom2.push(wall2);

    const wall3 = createWall(1,15,30,-30,8,-15,"white",walltexture);
    room.add(wall3);
    collidableObjectsroom2.push(wall3);

    const wall4 = createWall(1,15,24,-30,8,18,"white",walltexture);
    room.add(wall4);
    collidableObjectsroom2.push(wall4);

    const wall5 = createWall(1,15,30,30,8,-15,"white",walltexture);
    room.add(wall5);
    collidableObjectsroom2.push(wall5);

    const wall6 = createWall(1,15,30,30,8,15,"white",walltexture);
    room.add(wall6);
    collidableObjectsroom2.push(wall6);

    const wall7 = createWall(31,15,1,15,8,30.5,"white",walltexture);
    room.add(wall7);
    collidableObjectsroom2.push(wall7);

    const wall8 = createWall(23,15,1,-18,8,30.5,"white",walltexture);
    room.add(wall8);
    collidableObjectsroom2.push(wall8);

    const wall9 = createWall(1,4,6,-30,13.5,3,"white",walltexture);
    room.add(wall9);
    collidableObjectsroom2.push(wall9);

    const wall10 = createWall(6,4,1,-3.5,13.5,30.5,"white",walltexture);
    room.add(wall10);
    collidableObjectsroom2.push(wall10);

    // beds
    loadModel('./models/old_bed.glb',{x:20,y:0,z:-30,scale:5.5},(bed)=>{ room.add(bed), collidableObjectsroom2.push(bed); });
    loadModel('./models/old_bed.glb',{x:10,y:0,z:-30,scale:5.5},(bed)=>{ room.add(bed), collidableObjectsroom2.push(bed); });
    loadModel('./models/old_bed.glb',{x:0,y:0,z:-30,scale:5.5},(bed)=>{ room.add(bed), collidableObjectsroom2.push(bed); });



   addModel(
    './models/tablet.glb',
    'room2tablet',
    { x:-20.9,y:4.1,z:-30 },
    0.012,
    { x: Math.PI / 2, y:3*Math.PI/2}
  );


  addModel(
    './models/1.glb',
    '8puzz1',
    { x: -21.4, y: 5.8, z: -29.7 },
    4,
    { x:Math.PI/2*3,z:Math.PI,y:Math.PI}
  );
  addModel(
    './models/2.glb',
    '8puzz2',
    { x: -20.5, y: 5.8, z: -29.7  },
    4,
    { x: Math.PI/ 2*3,z:Math.PI,y:Math.PI}
  );
  addModel(
    './models/3.glb',
    '8puzz3',
    { x: -19.6, y: 5.8, z: -29.7  },
    4,
    { x: Math.PI / 2*3,z:Math.PI,y:Math.PI}
  );
  addModel(
    './models/4.glb',
    '8puzz4',
    { x: -21.4, y: 4.9, z: -29.7 },
    4,
    { x: Math.PI / 2*3,z:Math.PI,y:Math.PI}
  );
  addModel(
    './models/5.glb',
    '8puzz5',
    { x: -20.5, y: 4.9, z: -29.7 },
    4,
    { x: Math.PI / 2*3,z:Math.PI,y:Math.PI}
  );
  addModel(
    './models/6.glb',
    '8puzz6',
    { x: -19.6, y: 4.9, z: -29.7  },
    4,
    { x: Math.PI / 2*3,z:Math.PI,y:Math.PI}
  );
  addModel(
    './models/7.glb',
    '8puzz7',
    { x: -21.4, y: 4, z: -29.7  },
    4,
    { x: Math.PI / 2*3,z:Math.PI,y:Math.PI}
  );
  addModel(
    './models/8.glb',
    '8puzz8',
    { x: -20.5, y: 4, z: -29.7  },
    4,
    { x: Math.PI / 2*3,z:Math.PI,y:Math.PI}
  );

  // Add key2 for the 8-puzzle (positioned relative to chest like key1 in room1)
  addModel(
    './models/key.glb',
    'key2',
    { x: -26, y: 0.5, z: -25 }, // 1 unit right of chest (chest is at x:-27)
    0.003,
    { x: Math.PI / 2 }
  );

  room.add(puzz2Models);
    // window
    // loadModel('/models/window2.glb',{x:28.5,y:8,z:6,scale:4,rotation:{y:-Math.PI/2}},(window)=>{ room.add(window); });

    // closet
    loadModel('./models/box_wooden_closet_supplies.glb',{x:-28.5,y:0,z:-15,scale:5,rotation:{y:2*Math.PI}},(closet)=>{ room.add(closet), collidableObjectsroom2.push(closet); });

    // desks
    loadModel('./models/japan_school_desk.glb',{x:27,y:0,z:25,scale:6,rotation:{y:Math.PI/2}},(desk)=>{ room.add(desk), collidableObjectsroom2.push(desk); });
    loadModel('./models/japan_school_desk.glb',{x:27,y:0,z:18,scale:6,rotation:{y:Math.PI/2}},(desk)=>{ room.add(desk), collidableObjectsroom2.push(desk); });
    loadModel('./models/japan_school_desk.glb',{x:27,y:0,z:-7,scale:6,rotation:{y:Math.PI/2}},(desk)=>{ room.add(desk), collidableObjectsroom2.push(desk); });

    // doors
    loadModel('./models/door.glb',{x:-30,y:11,z:3,scale:0.05,rotation:{y:Math.PI/2}},(door)=>{ room.add(door), collidableObjectsroom2.push(door); });
    loadModel('./models/wooden_door.glb',{x:-3.5,y:0,z:30,scale:1.9,rotation:{y:Math.PI}},(wooden_door)=>{ room.add(wooden_door),wooden_door.name = "exitDoor",wooden_door.userData.isDoor = true, collidableObjectsroom2.push(wooden_door); });

    // chest
    loadModel('./models/treasure_chest.glb',{x:-27,y:0.5,z:-25,scale:0.06},(chest)=>{ room.add(chest), collidableObjectsroom2.push(chest); });

    // === Lamps with light ===
    const lamp1 = createLampWithLight(0, 15.5, -2, 6);
    room.add(lamp1);
    collidableObjectsroom2.push(lamp1);

    const lamp2 = createLampWithLight(0, 15.5, -20, 6);
    room.add(lamp2);
    collidableObjectsroom2.push(lamp2);

    const lamp3 = createLampWithLight(0, 15.5, 20, 6);
    room.add(lamp3);
    collidableObjectsroom2.push(lamp3);

    
    return {room,puzz2Models};
}

export function setupRoom2Puzzles(room, puzz2Models, puzzleManager, infoDisplay) {
  try {
    const modelsGroup = puzz2Models || room.getObjectByName('puzz2Models') || room;
    const integration = createPuzzle2Integration(modelsGroup, infoDisplay, room);
    puzzleManager.registerPuzzle(room.userData.roomId || 'level1-room2', integration);
    try { console.log('Room 2 puzzles registered (puzzle2 enabled)'); } catch(_){ }
  } catch (e) {
    try { console.error('Failed to register Room 2 puzzles', e); } catch(_){ }
  }
}
