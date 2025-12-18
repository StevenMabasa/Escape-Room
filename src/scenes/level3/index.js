// Guys this is just the example skeleton of the game and you can add more staff as needed
// I just wanted to make it clear how things are linking to each other
// you can also add more files as you want

// This functions creates a floor 2 of the buiding with 4 rooms
import { createRoom1 } from './room1.js';
import { createRoom2 } from './room2.js';
import { createRoom3 } from './room3.js';
import { createRoom4 } from './room4.js';

export function createLevel3() {
  const rooms = [
    createRoom1(),
    createRoom2(),
    createRoom3(),
    createRoom4()

  ];

  return {
    rooms,

    // Return a specific room by index
    getRoom: (index) => rooms[index],

    // Return total number of rooms
    totalRooms: () => rooms.length
  };
}
