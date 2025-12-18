// Guys this is just the example skeleton of the game and you can add more staff as needed
// I just wanted to make it clear how things are linking to each other
// you can also add more files as you want


// This functions creates a floor4 of the buiding with 4 rooms

// scenes/level1/index.js
// Updated to support puzzle integration

// scenes/level1/index.js
// Updated to support puzzle integration

import { createRoom1, setupRoom1Puzzles } from './room1.js';
import { createRoom2 ,setupRoom2Puzzles} from './room2.js';
import { createRoom3, setupRoom3Puzzles } from './room3.js';
import { createRoom4 } from './room4.js';

export function createLevel1() {
  // Create room 1 (returns {room, puzz1Models})
  const room1Data = createRoom1();
  const room1 = room1Data.room;
  const puzz1Models = room1Data.puzz1Models;
  
  // Set room metadata
  room1.userData.roomId = 'level1-room1';
  room1.userData.levelId = 'level1';
  room1.userData.roomIndex = 0;
  
  // Create other rooms (these return room objects directly)
  const room2Data = createRoom2();
  const room2 = room2Data.room;
  const puzz2Models = room2Data.puzz2Models;
  if (room2) {
    room2.userData.roomId = 'level1-room2';
    room2.userData.levelId = 'level1';
    room2.userData.roomIndex = 1;
  }
  
  const room3 = createRoom3();
  if (room3) {
    room3.userData.roomId = 'level1-room3';
    room3.userData.levelId = 'level3';
    room3.userData.roomIndex = 2;
  }
  
  const room4 = createRoom4();
  if (room4) {
    room4.userData.roomId = 'level1-room4';
    room4.userData.levelId = 'level1';
    room4.userData.roomIndex = 3;
  }
  
  const rooms = [room1, room2, room3, room4].filter(Boolean); // Filter out undefined rooms

  return {
    rooms,
    totalRooms: rooms.length,
    setupPuzzles: (puzzleManager, infoDisplay) => {
      // Setup puzzles for each room that has them
      setupRoom1Puzzles(room1, puzz1Models, puzzleManager, infoDisplay);
      // Add more puzzle setups for other rooms as needed
  setupRoom2Puzzles(room2, puzz2Models, puzzleManager, infoDisplay);
  // Room3: pressure plate / sequence puzzle integration
  setupRoom3Puzzles(room3, puzzleManager, infoDisplay);
    }
  };
}
