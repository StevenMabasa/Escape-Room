// Game.js
import { level } from "./UI/HUD.js";
import { startCountdown, resetCountdown } from "./UI/HUD.js";

function createGame(scene, player, puzzleManager = null) {
  const levels = [];
  let currentLevelIndex = 0;
  let currentRoomIndex = 0;
  let isMoving = false; // track if player is moving

  // Footstep sound
  // path to your sound file
  const footstepSound = new Audio('assets/footsteps.mp3');// path to your sound file
  footstepSound.loop = true;
  footstepSound.volume = 0.9;
  // Door opening sound
const doorOpenSound = new Audio('assets/door_open.mp3');
doorOpenSound.volume = 0.95; // adjust to taste

// Button click sound
const buttonClickSound = new Audio('assets/button_click.mp3');
buttonClickSound.volume = 0.9;

  // Track WASD key presses
  const keysPressed = { w: false, a: false, s: false, d: false };

  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (keysPressed.hasOwnProperty(key)) keysPressed[key] = true;
  });

  window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (keysPressed.hasOwnProperty(key)) keysPressed[key] = false;
  });

  function addLevel(levelObj) {
    levels.push(levelObj);
  }

  function getCurrentRoom() {
    const levelObj = levels[currentLevelIndex];
    if (!levelObj || !levelObj.rooms) return null;

    const room = levelObj.rooms[currentRoomIndex];
    if (!room) return null;

    const roomId = room.userData.roomId;

    // Update global level number
    const roomNumMatch = roomId.match(/room(\d+)/);
    if (roomNumMatch) window.level_num = parseInt(roomNumMatch[1]);

    // Update HUD
    level();
    return room;
  }
  function attachButtonSounds() {
  const buttons = document.querySelectorAll('button, .game-button'); // catches HTML buttons or custom classes
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttonClickSound.currentTime = 0; // restart if still playing
      buttonClickSound.play().catch(err => console.log("Button sound error:", err));
    });
  });
}


  function nextRoom() {
  const levelObj = levels[currentLevelIndex];
  if (!levelObj || !levelObj.rooms) return null;

  // Deactivate current room in puzzle manager
  if (puzzleManager) {
    const currentRoom = levelObj.rooms[currentRoomIndex];
    puzzleManager.deactivateRoom(currentRoom.userData.roomId);
  }

  currentRoomIndex++;
  const newRoom = levelObj.rooms[currentRoomIndex];
  if (!newRoom) return null;

  // 🎵 Play door opening sound here
  doorOpenSound.currentTime = 0; // restart if still playing
  doorOpenSound.play().catch(err => console.log("Door sound error:", err));

  // Update global level number from room ID
  const roomNumMatch = newRoom.userData.roomId.match(/room(\d+)/);
  if (roomNumMatch) window.level_num = parseInt(roomNumMatch[1]);
  level(); // Update HUD

  // Reset countdown for new room
  resetCountdown(5);

  // Activate new room in puzzle manager
  if (puzzleManager) puzzleManager.activateRoom(newRoom.userData.roomId);

  return newRoom;
}

  function switchToRoom(levelIndex, roomIndex) {
    if (puzzleManager) {
      const currentRoom = getCurrentRoom();
      if (currentRoom) puzzleManager.deactivateRoom(currentRoom.userData.roomId);
    }

    currentLevelIndex = levelIndex;
    currentRoomIndex = roomIndex;

    const newRoom = getCurrentRoom();
    if (puzzleManager && newRoom) puzzleManager.activateRoom(newRoom.userData.roomId);

    return newRoom;
  }

  function update() {
  // Determine if player is moving via WASD keys
  const moving = keysPressed.w || keysPressed.a || keysPressed.s || keysPressed.d;

  if (moving && !isMoving) {
    console.log("Player started moving! Attempting to play footstep sound...");
    footstepSound.play().catch(err => {
      console.log("Footstep sound could not play:", err);
    });
    isMoving = true;
  } else if (!moving && isMoving) {
    console.log("Player stopped moving. Pausing footstep sound.");
    footstepSound.pause();
    footstepSound.currentTime = 0;
    isMoving = false;
  }

  // Optional: call player update if player object has update method
  if (player && typeof player.update === 'function') {
    player.update();
  }

  // Debug: print which keys are pressed
  // console.log("Keys pressed:", keysPressed);
}

    attachButtonSounds();

  return {
    addLevel,
    getCurrentRoom,
    nextRoom,
    switchToRoom,
    update,
    attachButtonSounds 
  };
}

export { createGame };
